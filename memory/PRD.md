# LED Hodiny BLE - Project Memory

## Original Problem Statement
User wants a custom mobile app to control ESP32 LED clock (144 WS2812B LEDs, DS3231 RTC,
photoresistor) via BLE from iPhone. Clock features: custom 7-segment LED mapping, time
display, manual digit assignment, various color effects, colon blinking control, LDR-driven
day brightness, fixed minimum night mode, leading zero suppressed.

User language: Czech. All UI must be in Czech.

## Architecture
- **ESP32** — Arduino C++ sketch (`.ino`) runs on user's physical hardware
  - BLE using BLEDevice.h with Nordic UART Service
  - Service UUID: `6E400001-B5A3-F393-E0A9-E50E24DCCA9E`
  - RX (write) char: `6E400002-...`, TX (notify) char: `6E400003-...`
- **Frontend PWA** — React app hosted on Emergent preview URL
  - Uses Web Bluetooth API (`navigator.bluetooth`)
  - Communicates via writeValueWithoutResponse with fallback to writeValue
  - No backend needed (pure client-side BLE)

## Files of Reference
- `/app/frontend/src/App.js` — main component with all panels (Power, Colors, Effects,
  Digits, Colon, Night, Manual, Terminal)
- `/app/frontend/src/useBLE.js` — Web Bluetooth React hook
- `/app/frontend/src/index.css` — dark theme + slider/color-picker polish
- `/app/frontend/public/index.html` — PWA meta tags, iOS standalone support
- `/app/frontend/public/manifest.json` — PWA manifest for Add-to-Home-Screen
- `/app/frontend/public/icon.svg` + icon-192.png + icon-512.png — app icons
- Arduino ESP32 `.ino` — not in repo, shared with user via chat (v3.0)

## BLE Commands Supported
- Power: ON, OFF, TIME ON, TIME OFF, AUTO, STATUS, HELP
- Colors: RED, GREEN, BLUE, YELLOW, CYAN, MAGENTA, ORANGE, WHITE, PINK, PURPLE, RGB,r,g,b
- Effects: NORMAL, RAINBOW, PULSE, GRADIENT, FLOW, FADE, SNAKE, METEOR, SPARKLE, FIRE,
  THEATER, BREATHE
- Colon: COLON ON/OFF/BLINK/GLOBAL, COLON,r,g,b
- Digits: D1..D4,r,g,b, DALL
- Manual: SET,d1,d2,d3,d4 (X or - for off)
- Night: NIGHT ON/OFF, NIGHTRGB,r,g,b, NIGHT MIN

## Changelog
- 2026-02 — Built PWA web app with all BLE commands, dark minimal Czech UI, PWA manifest
  and iOS Bluefy compatibility. Added 6 new effects to Arduino code: SNAKE, METEOR,
  SPARKLE, FIRE, THEATER, BREATHE. Hardcoded leading-zero suppression (09:40 → 9:40).

## Next / Future
- Optional: Deploy to Vercel/Netlify for permanent URL (Emergent preview URL may expire)
- Optional: Add brightness slider (currently auto from LDR only)
- Optional: Add time/date setting via BLE (currently RTC is set separately)
- Optional: Save/load "favorite scenes" (combination of effect + colors)

## Testing
- Arduino code runs on user's physical ESP32 — must be tested by user on hardware
- PWA web app tested with smoke-test screenshot — UI renders correctly
- Web Bluetooth requires HTTPS (Emergent preview is HTTPS) and supported browser
  (Chrome/Edge/Opera on desktop/Android, Bluefy on iOS)

## Known Limitations
- iOS Safari does not support Web Bluetooth — users MUST install Bluefy from App Store
- Emergent preview URL is temporary — for production, user should deploy to Vercel
