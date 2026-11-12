# Immersive home layout — 29 October 2026

- Removed both desktop app frame and inner room panel. The room fills the viewport.
- Added a separate landscape SVG furnishing composition; the seven controls and bouquet remain live DOM elements.
- Recomposed the phone room and moved secondary navigation, moods, replay and keepsakes into a native dialog. Room object positions remain consistent across scenery choices.
- Preserved storage keys and destination modules. Updated service-worker cache to v7.1.0.

Validation in this session: 44 Node tests pass; JavaScript syntax checks pass. Chrome desktop room bounds match the 1363 × 936 viewport exactly. Chrome same-origin iframe layouts at 360 × 740, 393 × 852 and 402 × 874 have zero horizontal overflow; all seven target boxes exceed 44 px in both dimensions. Inspected desktop and phone artwork. Verified menu → Letters, phone Garden → home with Garden focus restored, and phone scenery change. Existing responsive CI now also asserts full viewport geometry and on-screen targets.

Limits: iframe sizes are not physical iPhones. Real Safari, WhatsApp browser, OS keyboard, audio quality and complete game playthroughs were not retested for this layout change. CI browser results are recorded separately in GitHub Actions.
