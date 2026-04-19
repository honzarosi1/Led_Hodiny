# LED Hodiny BLE — Webová Aplikace

Progresivní webová aplikace (PWA) pro ovládání ESP32 LED hodin přes Bluetooth Low Energy
z prohlížeče. Komunikuje přes Nordic UART Service (stejné UUID jako v Arduino kódu).

## Funkce
- Zapnutí / vypnutí, zobrazit / skrýt čas, STATUS
- 10 přednastavených barev + vlastní RGB color picker
- 12 efektů: NORMAL, RAINBOW, PULSE, GRADIENT, FLOW, FADE, SNAKE, METEOR, SPARKLE, FIRE, THEATER, BREATHE
- Individuální barvy pro každou ze 4 číslic
- Dvojtečka (trvale / blikat / vypnout / vlastní barva)
- Noční režim s vlastní barvou
- Ruční zobrazení 4 číslic (SET)
- Terminál pro vlastní příkazy + log komunikace

## Kompatibilita
- Chrome / Edge / Opera na desktopu a Androidu — funguje rovnou
- **iPhone / iPad** — Safari NEPODPORUJE Web Bluetooth API.
  Nutno použít prohlížeč **Bluefy** (zdarma v App Store).
- Stránku lze přidat na plochu telefonu (Add to Home Screen) a používat jako nativní appku.

## Vývoj
`yarn start` — spustí dev server na portu 3000.

## Arduino
Kompatibilní s kódem v3.0 — BLE service UUID `6E400001-B5A3-F393-E0A9-E50E24DCCA9E`.
