# MAHA — A Little Escape
## Original AI video production brief · 2026

Create original footage for the site's **four mini films**, not stock montages. Each individual shot should look like one naturally observed memory. No real identifiable portrayal of Maha, her home, or her family unless she approves and supplies a real reference. Generated clips are creative fictional postcards inspired by places she likes.

### Master visual instructions (prepend to every shot)
Cinematic documentary observational photography, subtly imperfect 35mm lens, natural and coherent architecture, restrained movement, believable wind/weather, tactile light, human warmth, premium independent-film colour grading, filmic highlight rolloff, no uncanny details, no logos, no text, no typography, no overdesigned AI fantasy, no flying cameras, no generic influencer imagery. **Landscape 16:9**, 1920×1080 or 4K, 24 fps, 6–9 seconds per clip. Camera gently handheld, slow pan or static with environmental movement. Do not generate sound or music in the video unless specifically requested and properly licensed; the website has optional local audio. No faces or replicas of real people.

### Film 1 — *Kerala, Slowly*
| Shot | Video generation prompt | Duration |
| --- | --- | --- |
| K1 | A real-looking quiet Kerala residential lane just after sunrise, moisture clinging to broad leaves, two-storey lived-in homes in the distance, a warm breeze shifts the banana foliage, stationary camera at human eye level, tender light, no people in close view, absolutely natural. | 7s |
| K2 | A steaming steel tumbler of chai next to a little window in a Kerala family kitchen, rain-damp greenery outside, sunlight catches the steam and the rim, 35mm close focus, no floating props or magical effects, subtle breathing camera. | 7s |
| K3 | A winding rural Kerala road watched from the side under huge shade trees and afternoon light, leaves moving slightly, one auto-rickshaw passes far away, cinematic but entirely ordinary documentary realism. | 8s |
| K4 | Monsoon raindrops drawing soft paths down an old window overlooking tropical Kerala plants, visible warm light inside, realistic rain physics and microfocus, slow rack focus from drops to leaves beyond. | 7s |
| K5 | Coconut palms silhouetted against warm Kerala dusk, camera gently rises from low wall to pink fading sky, peaceful ending with space for credits that the website overlays. | 7s |

### Film 2 — *A Day in Kuwait*
| Shot | Video generation prompt | Duration |
| --- | --- | --- |
| W1 | Kuwait urban morning from the balcony of an ordinary, warm private apartment; authentic muted cream architecture and soft city haze at sunrise, light reflecting on a nearby window, no fake landmark and no invented identification of a specific home. | 7s |
| W2 | An ordinary Kuwait street from a moving car passenger perspective at calm midmorning, modern buildings, subdued traffic, sunlight and accurately behaving reflections, restrained handheld documentary feeling, no visible brand or readable signs. | 7s |
| W3 | Tea or a small snack on a simple kitchen counter after a long day, sunlight from a window, intimate macro composition, real ceramic texture, imperfect napkin, no hands. | 7s |
| W4 | A still Kuwait neighbourhood rooftop view during golden hour, sandstone-toned buildings silhouetted by warm sky, natural long shadows, very slow pan, no spectacular invented skyline. | 7s |
| W5 | A Kuwait apartment window at blue hour as a few distant city lights switch on, luminous evening sky, camera remains inside looking out, quiet emotionally resonant final shot, believable interior reflection. | 7s |

### Film 3 — *Places You'll Go*
| Shot | Video generation prompt | Duration |
| --- | --- | --- |
| P1 | Bengaluru neighbourhood street on a wet morning, little details of a rainy pavement and trees with moving leaves, realistic soft movement, understated documentary shot rather than an exaggerated city montage. | 7s |
| P2 | Munnar tea hills after fresh rain, low cloud gently clearing the curving rows of tea bushes, slow handheld medium-wide shot, geographically plausible landscape without an impossibly dramatic fantasy valley. | 7s |
| P3 | Manali mountain road with tall conifers and pale natural snow on distant ridges, shot from a gentle roadside viewpoint, realistic scale and weather, soft mountain sunlight, no drone swoops. | 7s |
| P4 | Ladakh high desert landscape with broad earth-coloured mountains and blue sky, slow panoramic locked camera, dusty mountain path, high-altitude light, credible Indian Himalayan geology. | 7s |
| P5 | Warm evening Kuwait apartment table with an open blank paper travel journal and a vintage suitcase corner, a hand-drawn route line not yet filled in, a sense of future possibility; leave blank space for separately overlaid website text. | 7s |
| P6 | Last shot: a quiet empty train window against dusk landscape and a softly folded paper map on the seat; the journey is unfinished; no fake text or figures. | 7s |

### Film 4 — *Trailer: Maha's Travel Channel (Coming Soon)*
This is for a **fictional, future channel**, not an implication she already launched one. Use original scenes rather than generating Maha's identity from guesses. The website supplies the title cards and the `Start Episode 1` action.

| Shot | Video generation prompt | Duration |
| --- | --- | --- |
| T1 — First frame | Extreme cinematic close focus of a small travel journal opening on a wooden desk, fingertips of an unidentified anonymous traveller (no face), a paper ticket and an unmarked camera strap, warm afternoon light, slow push-in; **no readable text**. | 5s |
| T2 — The possibility | Original cinematic POV from an ordinary moving train window in Kerala, greens passing gently in natural cadence, real window reflections, understated movement, golden humid daylight; no exaggerated impossible landscapes. | 6s |
| T3 — The world is bigger | A quiet layered scene of actual snowy Himalayan foothills beyond a pine path near Manali, morning mist lifting naturally, slow pan, human perspective, documentary realism. | 5s |
| T4 — Back to everyday | A Kuwait evening balcony window, soft amber room light in foreground and blue sky fading outside; a little camera sits on the edge of a travel journal; no faces, no channel logo. | 5s |
| T5 — The first episode | Close-up of a camera recording button being pressed, red indicator light turns on, a tiny change in focus reveals a folded map in the background; clean dark space reserved for HTML overlay **MAHA'S TRAVEL CHANNEL · EPISODE 1?**. | 5s |

### Suggested assembly (user-controlled)
- Cut shots deliberately; don't use generic AI morph transitions.
- Opening text in HTML, never baked into generated frames.
- Original title direction: **"Maha's Travel Channel — Coming whenever she's ready."**
- End frame interaction: **Start Episode 1** opens the existing vlog checklist, not a streaming link.
- Tone: warm, thoughtful, lightly witty, **not romantic**, no false portrayal of her.

### Delivery files and integration manifest
When generated, provide individual video files or an export named:
`kerala.mp4`, `kuwait.mp4`, `places.mp4`, `trailer.mp4`.
Prefer H.264 baseline/main profile MP4, 16:9, 1080p, muted, each approximately 30–45 seconds. Ensure you own or may use the generated footage and any music/speech. Optimise for iPhone Safari: `playsinline`, poster fallback, manual playback, no automatic sound. The existing static cinema app already accepts `video` paths in `content/movies.json`; leave them `null` until the files truly exist. Include a neutral poster/thumbnail if available.

**Footage safety and realism rule:** don't fabricate a photo-real representation of Maha herself, family members or a specific real residence. Fictional scenes represent a mood, not documentary evidence of private events.
