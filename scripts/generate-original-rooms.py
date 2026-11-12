#!/usr/bin/env python3
"""Build MAHA's 12 original, locally hosted GPT-generated room images.

Invoked explicitly from GitHub Actions, never on ordinary page deployment.
Requires OPENAI_API_KEY in GitHub Actions Secrets; ChatGPT subscription alone
does not include OpenAI API credits. No personal data is sent in prompts.
"""
import argparse
import base64
from datetime import datetime, timezone
import io
import json
import os
from pathlib import Path
import re
import sys
import time
from urllib import error, request

ROOT = Path(__file__).resolve().parents[1]
DIRECTION = ROOT / "content" / "room-art-direction.json"
OUT = ROOT / "assets" / "rooms" / "originals"
MANIFEST = OUT / "manifest.json"
STOCK_DIR = ROOT / "assets" / "rooms"
CSS = ROOT / "css" / "cinematic-room.css"
SW = ROOT / "sw.js"
THEMES = ("story", "monsoon", "sunroom", "terracotta", "midnight", "cosmos")
ORIENTATIONS = ("wide", "portrait")


def generate_image(model, prompt, size, key):
    body = {
        "model": model,
        "prompt": prompt,
        "size": size,
        "quality": "high",
        "background": "opaque",
        "output_format": "webp",
        "output_compression": 86
    }
    payload = json.dumps(body).encode("utf-8")
    for attempt in range(4):
        req = request.Request(
            "https://api.openai.com/v1/images/generations",
            data=payload,
            headers={
                "Authorization": "Bearer " + key,
                "Content-Type": "application/json",
            },
            method="POST",
        )
        try:
            with request.urlopen(req, timeout=240) as response:
                obj = json.load(response)
            image = obj.get("data", [{}])[0].get("b64_json")
            if not image:
                raise RuntimeError("Image API returned no b64_json")
            return base64.b64decode(image, validate=True)
        except error.HTTPError as exc:
            # Never print credentials or bodies that might contain secrets.
            if exc.code in (429, 500, 502, 503, 504) and attempt < 3:
                wait = min(4 * 2**attempt, 32)
                print(f"Transient image API status {exc.code}; retry after {wait}s", flush=True)
                time.sleep(wait)
                continue
            raise RuntimeError(f"Image API HTTP {exc.code} for {size}") from None
    raise RuntimeError("Image API exhausted retries")


def optimize(raw, destination, size):
    try:
        from PIL import Image, ImageOps
    except ImportError:
        raise RuntimeError("Pillow is required in the generation runner")
    with Image.open(io.BytesIO(raw)) as original:
        image = ImageOps.exif_transpose(original).convert("RGB")
        target = tuple(map(int, size.split("x")))
        image.thumbnail(target, Image.Resampling.LANCZOS)
        if image.width < 700 or image.height < 700:
            raise RuntimeError(f"Generated image unexpectedly small: {image.size}")
        destination.parent.mkdir(parents=True, exist_ok=True)
        image.save(destination, "WEBP", quality=84, method=6)
        print(f"Created {destination.relative_to(ROOT)} ({destination.stat().st_size // 1024} KiB)", flush=True)


def remove_stock_when_complete(manifest):
    if not all(manifest["scenes"][t][o] for t in THEMES for o in ORIENTATIONS):
        return False
    # Absolutely no stock photography after the entire original set exists.
    css = CSS.read_text()
    boundary = css.find("/* The pocket edition:")
    if boundary < 0:
        raise RuntimeError("Cannot identify mobile CSS boundary safely")
    desktop, mobile = css[:boundary], css[boundary:]
    for theme in THEMES:
        stock = f"url('../assets/rooms/{theme}.webp')"
        desktop = desktop.replace(stock, f"url('../assets/rooms/originals/{theme}-wide.webp')")
        mobile = mobile.replace(stock, f"url('../assets/rooms/originals/{theme}-portrait.webp')")
    CSS.write_text(desktop + mobile)
    legacy_credits=ROOT / "ROOM-PHOTO-CREDITS.md"
    if legacy_credits.exists():
        legacy_credits.unlink()
    for theme in THEMES:
        p = STOCK_DIR / f"{theme}.webp"
        if p.exists():
            p.unlink()
            print(f"Removed previous photographic stock asset {p.relative_to(ROOT)}")
    return True


def update_service_worker(manifest, originals_only):
    content = SW.read_text()
    version = "maha-worlds-v10-" + datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
    content = re.sub(r"const VERSION='[^']+';", f"const VERSION='{version}';", content, count=1)
    marker = "'./assets/rooms/originals/manifest.json',"
    if marker not in content:
        raise RuntimeError("Service worker manifest marker was not found")
    if originals_only:
        for theme in THEMES:
            old = f"'./assets/rooms/{theme}.webp',"
            content = content.replace(old, "")
    for theme in THEMES:
        for orient in ORIENTATIONS:
            if not manifest["scenes"][theme][orient]:
                continue
            asset = f"'./assets/rooms/originals/{theme}-{orient}.webp',"
            if asset not in content:
                content = content.replace(marker, marker + "\n " + asset, 1)
    SW.write_text(content)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--theme", choices=["all", *THEMES], default="all")
    parser.add_argument("--orientation", choices=["both", *ORIENTATIONS], default="both")
    parser.add_argument("--model", default="gpt-image-2.5-flare")
    parser.add_argument("--replace", action="store_true", help="Explicitly regenerate even existing local originals")
    parser.add_argument("--dry-run", action="store_true", help="List image prompts without making paid API calls")
    args = parser.parse_args()
    art = json.loads(DIRECTION.read_text())
    manifest = json.loads(MANIFEST.read_text())
    selected_themes = THEMES if args.theme == "all" else (args.theme,)
    selected_orientations = ORIENTATIONS if args.orientation == "both" else (args.orientation,)
    tasks = [(t, o) for t in selected_themes for o in selected_orientations]
    print(f"Original artwork tasks: {len(tasks)}. Model: {args.model}. These are API-billed image requests.", flush=True)
    if args.dry_run:
        for theme, orient in tasks:
            print(f"PROMPT {theme}/{orient}: {art['scenes'][theme][orient + '_prompt'][:280]}...", flush=True)
        return
    api_key = os.environ.get("OPENAI_API_KEY", "")
    if not api_key:
        raise SystemExit("OPENAI_API_KEY missing. Set it as an Actions repository secret; never paste a key into code or chat.")
    for theme, orient in tasks:
        file = OUT / f"{theme}-{orient}.webp"
        if file.exists() and manifest["scenes"][theme][orient] and not args.replace:
            print(f"Already generated, not charging again: {file.name}", flush=True)
            continue
        size = art["output"][orient]
        prompt = art["scenes"][theme][orient + "_prompt"]
        raw = generate_image(args.model, prompt, size, api_key)
        optimize(raw, file, size)
        manifest["scenes"][theme][orient] = True
        MANIFEST.write_text(json.dumps(manifest, indent=2) + "\n")
    originals_only = remove_stock_when_complete(manifest)
    update_service_worker(manifest, originals_only)
    print(f"Done. All original scenes present: {originals_only}", flush=True)


if __name__ == "__main__":
    main()
