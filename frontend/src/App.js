import { useEffect, useMemo, useState } from "react";
import { useBLE } from "@/useBLE";
import {
  Power,
  Bluetooth,
  BluetoothOff,
  Sun,
  Moon,
  Palette,
  Sparkles,
  Clock,
  Type,
  Terminal as TerminalIcon,
  Wand2,
  Zap,
  CalendarClock,
} from "lucide-react";

const PRESET_COLORS = [
  { cmd: "RED", label: "Červená", hex: "#ff3b30" },
  { cmd: "ORANGE", label: "Oranžová", hex: "#ff9500" },
  { cmd: "YELLOW", label: "Žlutá", hex: "#ffcc00" },
  { cmd: "GREEN", label: "Zelená", hex: "#34c759" },
  { cmd: "CYAN", label: "Tyrkysová", hex: "#64d2ff" },
  { cmd: "BLUE", label: "Modrá", hex: "#0a84ff" },
  { cmd: "PURPLE", label: "Purpurová", hex: "#8a2be2" },
  { cmd: "MAGENTA", label: "Fialová", hex: "#ff2d55" },
  { cmd: "PINK", label: "Růžová", hex: "#ff6ab0" },
  { cmd: "WHITE", label: "Bílá", hex: "#ffffff" },
];

const EFFECTS = [
  { cmd: "NORMAL", label: "Statická", icon: "•" },
  { cmd: "RAINBOW", label: "Duha", icon: "🌈" },
  { cmd: "PULSE", label: "Pulz", icon: "♡" },
  { cmd: "GRADIENT", label: "Gradient", icon: "▨" },
  { cmd: "FLOW", label: "RGB Flow", icon: "∿" },
  { cmd: "FADE", label: "Fade", icon: "◐" },
  { cmd: "SNAKE", label: "Snake", icon: "🐍" },
  { cmd: "METEOR", label: "Meteor", icon: "☄" },
  { cmd: "SPARKLE", label: "Jiskry", icon: "✨" },
  { cmd: "FIRE", label: "Oheň", icon: "🔥" },
  { cmd: "THEATER", label: "Theater", icon: "▣" },
  { cmd: "BREATHE", label: "Dýchání", icon: "○" },
];

// Převod HEX → RGB
function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  return {
    r: parseInt(clean.substring(0, 2), 16),
    g: parseInt(clean.substring(2, 4), 16),
    b: parseInt(clean.substring(4, 6), 16),
  };
}

function rgbToHex(r, g, b) {
  const h = (n) => Number(n).toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
}

// ═════════════════════════════════════════════════════════════
// MALÉ KOMPONENTY
// ═════════════════════════════════════════════════════════════

function SectionCard({ title, icon: Icon, children, testId }) {
  return (
    <section
      data-testid={testId}
      className="rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm p-4 sm:p-5 shadow-[0_0_40px_-20px_rgba(255,45,85,0.4)]"
    >
      <div className="flex items-center gap-2 mb-3 text-neutral-200">
        {Icon ? <Icon className="h-4 w-4 text-[#ff2d55]" /> : null}
        <h2 className="text-[13px] uppercase tracking-[0.18em] font-semibold">{title}</h2>
      </div>
      <div>{children}</div>
    </section>
  );
}

function GlowButton({ children, onClick, variant = "default", testId, className = "", disabled }) {
  const base =
    "select-none active:scale-[0.97] transition-all duration-150 font-medium rounded-xl px-3 py-2.5 text-sm border disabled:opacity-40 disabled:pointer-events-none";
  const variants = {
    default:
      "bg-neutral-900 border-white/10 text-neutral-100 hover:bg-neutral-800 hover:border-white/20",
    primary:
      "bg-[#ff2d55] border-[#ff2d55] text-black font-semibold hover:bg-[#ff4265] shadow-[0_0_20px_-2px_rgba(255,45,85,0.6)]",
    ghost: "bg-transparent border-white/10 text-neutral-300 hover:bg-white/5",
    danger: "bg-red-950/60 border-red-900/60 text-red-200 hover:bg-red-900/60",
  };
  return (
    <button
      data-testid={testId}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

function ColorSwatch({ label, hex, onClick, testId }) {
  return (
    <button
      data-testid={testId}
      onClick={onClick}
      className="group relative aspect-square rounded-xl border border-white/10 overflow-hidden active:scale-95 transition-transform"
      style={{ background: hex }}
      aria-label={label}
    >
      <span className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition" />
      <span className="absolute bottom-1 left-1 right-1 text-[10px] font-medium text-black/80 bg-white/70 rounded px-1 py-0.5 text-center">
        {label}
      </span>
    </button>
  );
}

// RGB Color Picker se sliderem
function RGBPicker({ value, onChange, testId }) {
  const { r, g, b } = value;
  const setChannel = (key, v) => onChange({ ...value, [key]: Number(v) });
  const hex = rgbToHex(r, g, b);

  const onHexChange = (e) => {
    const v = e.target.value;
    if (/^#[0-9a-fA-F]{6}$/.test(v)) {
      onChange(hexToRgb(v));
    }
  };

  return (
    <div className="space-y-3" data-testid={testId}>
      <div className="flex items-center gap-3">
        <div
          className="h-14 w-14 rounded-xl border border-white/10 shadow-[0_0_30px_-5px_rgba(0,0,0,0.5)]"
          style={{ background: hex, boxShadow: `0 0 30px ${hex}80` }}
        />
        <div className="flex-1">
          <input
            type="color"
            value={hex}
            onChange={(e) => onChange(hexToRgb(e.target.value))}
            className="h-14 w-full rounded-xl border border-white/10 bg-neutral-900 cursor-pointer"
            data-testid={`${testId}-native`}
          />
        </div>
      </div>
      <input
        type="text"
        value={hex.toUpperCase()}
        onChange={onHexChange}
        className="w-full rounded-lg bg-neutral-900 border border-white/10 px-3 py-2 text-sm font-mono text-neutral-200"
        data-testid={`${testId}-hex`}
      />
      <div className="space-y-2">
        {[
          { k: "r", label: "R", color: "#ff3b30" },
          { k: "g", label: "G", color: "#34c759" },
          { k: "b", label: "B", color: "#0a84ff" },
        ].map(({ k, label, color }) => (
          <div key={k} className="flex items-center gap-2">
            <span className="w-6 text-xs font-semibold" style={{ color }}>
              {label}
            </span>
            <input
              type="range"
              min="0"
              max="255"
              value={value[k]}
              onChange={(e) => setChannel(k, e.target.value)}
              className="flex-1 accent-[#ff2d55]"
              data-testid={`${testId}-${k}`}
            />
            <span className="w-10 text-right text-xs font-mono text-neutral-400">{value[k]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// HLAVNÍ APP
// ═════════════════════════════════════════════════════════════

export default function App() {
  const {
    isSupported,
    isConnected,
    isConnecting,
    deviceName,
    lastError,
    log,
    connect,
    disconnect,
    send,
  } = useBLE();

  const [tab, setTab] = useState("power");
  const [customRGB, setCustomRGB] = useState({ r: 255, g: 45, b: 85 });
  const [colonRGB, setColonRGB] = useState({ r: 255, g: 255, b: 255 });
  const [nightRGB, setNightRGB] = useState({ r: 3, g: 0, b: 0 });
  const [digitRGBs, setDigitRGBs] = useState([
    { r: 255, g: 0, b: 0 },
    { r: 0, g: 255, b: 0 },
    { r: 0, g: 0, b: 255 },
    { r: 255, g: 255, b: 0 },
  ]);
  const [manualDigits, setManualDigits] = useState(["0", "0", "0", "0"]);
  const [terminalInput, setTerminalInput] = useState("");
  const [schedule, setSchedule] = useState({
    enabled: true,
    nightStart: "21:00",
    sleepStart: "21:45",
    wake: "06:30",
  });

  const tabs = useMemo(
    () => [
      { id: "power", label: "Napájení", icon: Power },
      { id: "colors", label: "Barvy", icon: Palette },
      { id: "effects", label: "Efekty", icon: Sparkles },
      { id: "digits", label: "Číslice", icon: Type },
      { id: "colon", label: "Dvojtečka", icon: Clock },
      { id: "night", label: "Noční", icon: Moon },
      { id: "schedule", label: "Plán", icon: CalendarClock },
      { id: "manual", label: "Ruční", icon: Wand2 },
      { id: "terminal", label: "Terminál", icon: TerminalIcon },
    ],
    []
  );

  const guardSend = (cmd) => {
    if (!isConnected) return;
    send(cmd);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-100 font-sans relative overflow-x-hidden">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 opacity-40">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-[#ff2d55] blur-[150px]" />
        <div className="absolute top-1/2 -right-40 h-[400px] w-[400px] rounded-full bg-[#0a84ff] blur-[150px]" />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 pt-[max(env(safe-area-inset-top),1rem)] pb-[max(env(safe-area-inset-bottom),5rem)]">
        {/* HEADER */}
        <header className="mb-4 flex items-center justify-between gap-3" data-testid="app-header">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#ff2d55] to-[#ff9500] grid place-items-center shadow-lg shadow-[#ff2d55]/30">
              <Zap className="h-5 w-5 text-black" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight leading-tight">LED Hodiny</h1>
              <p className="text-[11px] text-neutral-500 uppercase tracking-widest">
                ESP32 · Bluetooth
              </p>
            </div>
          </div>
          <ConnectionBadge
            isSupported={isSupported}
            isConnected={isConnected}
            isConnecting={isConnecting}
            deviceName={deviceName}
            onConnect={connect}
            onDisconnect={disconnect}
          />
        </header>

        {!isSupported ? <UnsupportedBanner /> : null}

        {/* LIVE LOG STRIP - krátký stav poslední komunikace */}
        {isConnected && (
          <LiveStatus lastError={lastError} log={log} onOpenTerminal={() => setTab("terminal")} />
        )}

        {/* TABS */}
        <nav
          className="sticky top-2 z-20 -mx-4 px-4 mb-4 overflow-x-auto scrollbar-hide"
          data-testid="tab-nav"
        >
          <div className="flex gap-1.5 py-1">
            {tabs.map((t) => {
              const active = tab === t.id;
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  data-testid={`tab-${t.id}`}
                  onClick={() => setTab(t.id)}
                  className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium border transition-all ${
                    active
                      ? "bg-[#ff2d55] border-[#ff2d55] text-black shadow-[0_0_15px_-2px_rgba(255,45,85,0.8)]"
                      : "bg-neutral-900/80 border-white/10 text-neutral-400 hover:text-neutral-200 hover:border-white/20 backdrop-blur"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {t.label}
                </button>
              );
            })}
          </div>
        </nav>

        {/* CONTENT */}
        <main className="space-y-4">
          {tab === "power" && (
            <PowerPanel send={guardSend} disabled={!isConnected} />
          )}
          {tab === "colors" && (
            <ColorsPanel
              send={guardSend}
              disabled={!isConnected}
              customRGB={customRGB}
              setCustomRGB={setCustomRGB}
            />
          )}
          {tab === "effects" && (
            <EffectsPanel send={guardSend} disabled={!isConnected} />
          )}
          {tab === "digits" && (
            <DigitsPanel
              send={guardSend}
              disabled={!isConnected}
              digitRGBs={digitRGBs}
              setDigitRGBs={setDigitRGBs}
            />
          )}
          {tab === "colon" && (
            <ColonPanel
              send={guardSend}
              disabled={!isConnected}
              colonRGB={colonRGB}
              setColonRGB={setColonRGB}
            />
          )}
          {tab === "night" && (
            <NightPanel
              send={guardSend}
              disabled={!isConnected}
              nightRGB={nightRGB}
              setNightRGB={setNightRGB}
            />
          )}
          {tab === "schedule" && (
            <SchedulePanel
              send={guardSend}
              disabled={!isConnected}
              schedule={schedule}
              setSchedule={setSchedule}
            />
          )}
          {tab === "manual" && (
            <ManualPanel
              send={guardSend}
              disabled={!isConnected}
              manualDigits={manualDigits}
              setManualDigits={setManualDigits}
            />
          )}
          {tab === "terminal" && (
            <TerminalPanel
              send={guardSend}
              disabled={!isConnected}
              log={log}
              terminalInput={terminalInput}
              setTerminalInput={setTerminalInput}
            />
          )}
        </main>

        <footer className="mt-8 text-center text-[11px] text-neutral-600">
          LED Hodiny BLE · v1.0 · Bluefy kompatibilní
        </footer>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// CONNECTION BADGE
// ═════════════════════════════════════════════════════════════
function ConnectionBadge({ isSupported, isConnected, isConnecting, deviceName, onConnect, onDisconnect }) {
  if (!isSupported) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-950/40 border border-amber-900/50 rounded-full px-3 py-1.5" data-testid="status-unsupported">
        <BluetoothOff className="h-3.5 w-3.5" />
        Bluefy nutný
      </div>
    );
  }
  if (isConnected) {
    return (
      <button
        onClick={onDisconnect}
        data-testid="btn-disconnect"
        className="flex items-center gap-1.5 text-xs text-emerald-300 bg-emerald-950/40 border border-emerald-900/60 rounded-full px-3 py-1.5 hover:bg-emerald-900/40"
      >
        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        {deviceName || "Připojeno"}
      </button>
    );
  }
  return (
    <button
      onClick={onConnect}
      disabled={isConnecting}
      data-testid="btn-connect"
      className="flex items-center gap-1.5 text-xs font-semibold text-black bg-[#ff2d55] border border-[#ff2d55] rounded-full px-4 py-2 shadow-[0_0_20px_-2px_rgba(255,45,85,0.7)] active:scale-95 transition-all disabled:opacity-60"
    >
      <Bluetooth className="h-3.5 w-3.5" />
      {isConnecting ? "Připojuji…" : "Připojit"}
    </button>
  );
}

function UnsupportedBanner() {
  return (
    <div
      data-testid="banner-unsupported"
      className="mb-4 rounded-2xl border border-amber-900/60 bg-amber-950/40 p-4 text-sm text-amber-200"
    >
      <div className="font-semibold mb-1">⚠ Tento prohlížeč nepodporuje Web Bluetooth</div>
      <p className="text-amber-300/80 text-xs leading-relaxed">
        Safari na iPhonu nepodporuje BLE. Stáhni si zdarma{" "}
        <b>Bluefy – Web BLE Browser</b> z App Store a otevři tuhle stránku v něm. Pak{" "}
        <b>Share → Add to Home Screen</b> pro ikonku na ploše.
      </p>
    </div>
  );
}

function LiveStatus({ lastError, log, onOpenTerminal }) {
  const lastTx = log.find((e) => e.direction === "tx");
  const lastRx = log.find((e) => e.direction === "rx");
  const hasError = !!lastError;
  return (
    <button
      type="button"
      data-testid="live-status"
      onClick={onOpenTerminal}
      className={`w-full mb-4 rounded-xl border text-left px-3 py-2 text-xs font-mono transition ${
        hasError
          ? "border-red-900/60 bg-red-950/40 text-red-200"
          : "border-white/10 bg-black/40 text-neutral-400 hover:bg-black/60"
      }`}
    >
      {hasError ? (
        <div className="text-red-300">
          <span className="font-semibold not-italic">CHYBA:</span> {lastError}
          <div className="text-[10px] text-red-400/70 mt-1">Klepni → otevřít Terminál</div>
        </div>
      ) : (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[#ff2d55]">→ TX:</span>
            <span className="truncate">{lastTx ? lastTx.text : "—"}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-400">← RX:</span>
            <span className="truncate">{lastRx ? lastRx.text : "—"}</span>
          </div>
        </div>
      )}
    </button>
  );
}

// ═════════════════════════════════════════════════════════════
// POWER PANEL
// ═════════════════════════════════════════════════════════════
function PowerPanel({ send, disabled }) {
  return (
    <>
      <SectionCard title="Zapnutí / Vypnutí" icon={Power} testId="section-power">
        <div className="grid grid-cols-2 gap-2">
          <GlowButton testId="btn-on" variant="primary" onClick={() => send("ON")} disabled={disabled}>
            ZAP hodiny
          </GlowButton>
          <GlowButton testId="btn-off" variant="danger" onClick={() => send("OFF")} disabled={disabled}>
            VYP hodiny
          </GlowButton>
        </div>
      </SectionCard>

      <SectionCard title="Režim zobrazení" icon={Clock} testId="section-mode">
        <div className="grid grid-cols-2 gap-2">
          <GlowButton testId="btn-time-on" onClick={() => send("TIME ON")} disabled={disabled}>
            Zobrazit čas
          </GlowButton>
          <GlowButton testId="btn-time-off" onClick={() => send("TIME OFF")} disabled={disabled}>
            Skrýt čas
          </GlowButton>
          <GlowButton testId="btn-auto" onClick={() => send("AUTO")} disabled={disabled}>
            Automatický čas
          </GlowButton>
          <GlowButton testId="btn-status" variant="ghost" onClick={() => send("STATUS")} disabled={disabled}>
            Stav (STATUS)
          </GlowButton>
        </div>
      </SectionCard>
    </>
  );
}

// ═════════════════════════════════════════════════════════════
// COLORS PANEL
// ═════════════════════════════════════════════════════════════
function ColorsPanel({ send, disabled, customRGB, setCustomRGB }) {
  return (
    <>
      <SectionCard title="Předvolené barvy" icon={Palette} testId="section-preset-colors">
        <div className="grid grid-cols-5 gap-2">
          {PRESET_COLORS.map((c) => (
            <ColorSwatch
              key={c.cmd}
              testId={`swatch-${c.cmd.toLowerCase()}`}
              label={c.label}
              hex={c.hex}
              onClick={() => !disabled && send(c.cmd)}
            />
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Vlastní RGB barva" icon={Palette} testId="section-custom-color">
        <RGBPicker value={customRGB} onChange={setCustomRGB} testId="picker-custom" />
        <GlowButton
          testId="btn-send-rgb"
          variant="primary"
          className="w-full mt-3"
          onClick={() => send(`RGB,${customRGB.r},${customRGB.g},${customRGB.b}`)}
          disabled={disabled}
        >
          Nastavit barvu
        </GlowButton>
      </SectionCard>
    </>
  );
}

// ═════════════════════════════════════════════════════════════
// EFFECTS PANEL
// ═════════════════════════════════════════════════════════════
function EffectsPanel({ send, disabled }) {
  return (
    <SectionCard title="Animované efekty" icon={Sparkles} testId="section-effects">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {EFFECTS.map((e) => (
          <GlowButton
            key={e.cmd}
            testId={`btn-effect-${e.cmd.toLowerCase()}`}
            onClick={() => send(e.cmd)}
            disabled={disabled}
            className="flex flex-col items-center gap-1 h-20"
          >
            <span className="text-2xl leading-none">{e.icon}</span>
            <span className="text-xs font-medium">{e.label}</span>
          </GlowButton>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-neutral-500 leading-relaxed">
        Snake a Meteor běží přes celý pásek (skryjí čas). Jiskry, Oheň, Theater a Dýchání animují
        zobrazené číslice.
      </p>
    </SectionCard>
  );
}

// ═════════════════════════════════════════════════════════════
// DIGITS PANEL
// ═════════════════════════════════════════════════════════════
function DigitsPanel({ send, disabled, digitRGBs, setDigitRGBs }) {
  const updateDigit = (idx, val) => {
    const next = [...digitRGBs];
    next[idx] = val;
    setDigitRGBs(next);
  };
  return (
    <>
      <SectionCard title="Barvy jednotlivých číslic" icon={Type} testId="section-digits">
        <p className="text-xs text-neutral-500 mb-3">
          Číslice <b>D1</b> = desítky hodin (vlevo), <b>D4</b> = jednotky minut (vpravo).
        </p>
        <div className="space-y-3">
          {digitRGBs.map((rgb, i) => (
            <div
              key={i}
              className="rounded-xl border border-white/5 bg-black/40 p-3"
              data-testid={`digit-${i + 1}-block`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold">Číslice D{i + 1}</span>
                <div
                  className="h-6 w-6 rounded-md border border-white/10"
                  style={{
                    background: rgbToHex(rgb.r, rgb.g, rgb.b),
                    boxShadow: `0 0 12px ${rgbToHex(rgb.r, rgb.g, rgb.b)}80`,
                  }}
                />
              </div>
              <RGBPicker
                value={rgb}
                onChange={(v) => updateDigit(i, v)}
                testId={`picker-digit-${i + 1}`}
              />
              <GlowButton
                testId={`btn-send-digit-${i + 1}`}
                variant="primary"
                className="w-full mt-2"
                onClick={() => send(`D${i + 1},${rgb.r},${rgb.g},${rgb.b}`)}
                disabled={disabled}
              >
                Nastavit D{i + 1}
              </GlowButton>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Společná barva" testId="section-dall">
        <GlowButton
          testId="btn-dall"
          variant="ghost"
          className="w-full"
          onClick={() => send("DALL")}
          disabled={disabled}
        >
          DALL — všechny číslice stejnou globální barvou
        </GlowButton>
      </SectionCard>
    </>
  );
}

// ═════════════════════════════════════════════════════════════
// COLON PANEL
// ═════════════════════════════════════════════════════════════
function ColonPanel({ send, disabled, colonRGB, setColonRGB }) {
  return (
    <>
      <SectionCard title="Režim dvojtečky" icon={Clock} testId="section-colon-mode">
        <div className="grid grid-cols-2 gap-2">
          <GlowButton testId="btn-colon-on" onClick={() => send("COLON ON")} disabled={disabled}>
            Svítí trvale
          </GlowButton>
          <GlowButton testId="btn-colon-off" variant="ghost" onClick={() => send("COLON OFF")} disabled={disabled}>
            Vypnuta
          </GlowButton>
          <GlowButton testId="btn-colon-blink" variant="primary" onClick={() => send("COLON BLINK")} disabled={disabled}>
            Bliká
          </GlowButton>
          <GlowButton testId="btn-colon-global" onClick={() => send("COLON GLOBAL")} disabled={disabled}>
            Globální barva
          </GlowButton>
        </div>
      </SectionCard>

      <SectionCard title="Vlastní barva dvojtečky" icon={Palette} testId="section-colon-color">
        <RGBPicker value={colonRGB} onChange={setColonRGB} testId="picker-colon" />
        <GlowButton
          testId="btn-send-colon-rgb"
          variant="primary"
          className="w-full mt-3"
          onClick={() => send(`COLON,${colonRGB.r},${colonRGB.g},${colonRGB.b}`)}
          disabled={disabled}
        >
          Nastavit barvu dvojtečky
        </GlowButton>
      </SectionCard>
    </>
  );
}

// ═════════════════════════════════════════════════════════════
// NIGHT PANEL
// ═════════════════════════════════════════════════════════════
function NightPanel({ send, disabled, nightRGB, setNightRGB }) {
  return (
    <>
      <SectionCard title="Noční režim" icon={Moon} testId="section-night-mode">
        <p className="text-xs text-neutral-500 mb-3">
          Nejnižší jas, ignoruje fotorezistor. Ideální do ložnice.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <GlowButton testId="btn-night-on" variant="primary" onClick={() => send("NIGHT ON")} disabled={disabled}>
            <Moon className="h-4 w-4 mr-1 inline" /> Zapnout
          </GlowButton>
          <GlowButton testId="btn-night-off" onClick={() => send("NIGHT OFF")} disabled={disabled}>
            <Sun className="h-4 w-4 mr-1 inline" /> Vypnout
          </GlowButton>
          <GlowButton
            testId="btn-night-min"
            variant="ghost"
            className="col-span-2"
            onClick={() => send("NIGHT MIN")}
            disabled={disabled}
          >
            Resetovat na minimum (tlumená červená)
          </GlowButton>
        </div>
      </SectionCard>

      <SectionCard title="Noční barva" icon={Palette} testId="section-night-color">
        <RGBPicker value={nightRGB} onChange={setNightRGB} testId="picker-night" />
        <GlowButton
          testId="btn-send-night-rgb"
          variant="primary"
          className="w-full mt-3"
          onClick={() => send(`NIGHTRGB,${nightRGB.r},${nightRGB.g},${nightRGB.b}`)}
          disabled={disabled}
        >
          Nastavit noční barvu
        </GlowButton>
      </SectionCard>
    </>
  );
}

// ═════════════════════════════════════════════════════════════
// SCHEDULE PANEL
// ═════════════════════════════════════════════════════════════
function SchedulePanel({ send, disabled, schedule, setSchedule }) {
  const update = (key, val) => setSchedule({ ...schedule, [key]: val });

  const sendAll = () => {
    if (disabled) return;
    const parse = (t) => t.split(":").map((n) => parseInt(n, 10) || 0);
    const [nsH, nsM] = parse(schedule.nightStart);
    const [ssH, ssM] = parse(schedule.sleepStart);
    const [wH, wM] = parse(schedule.wake);
    send(`NIGHTSTART,${nsH},${nsM}`);
    setTimeout(() => send(`SLEEPSTART,${ssH},${ssM}`), 80);
    setTimeout(() => send(`WAKE,${wH},${wM}`), 160);
    setTimeout(() => send(schedule.enabled ? "SCHED ON" : "SCHED OFF"), 240);
  };

  const TimeRow = ({ label, hint, value, onChange, testId, color }) => (
    <div className="rounded-xl border border-white/5 bg-black/40 p-3">
      <div className="flex items-center gap-2 mb-1">
        <span
          className="h-2.5 w-2.5 rounded-full shrink-0"
          style={{ background: color, boxShadow: `0 0 8px ${color}` }}
        />
        <span className="text-sm font-semibold">{label}</span>
      </div>
      <p className="text-[11px] text-neutral-500 mb-2 leading-relaxed">{hint}</p>
      <input
        type="time"
        data-testid={testId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-neutral-900 border border-white/10 rounded-lg px-3 py-2.5 text-lg font-mono text-[#ff2d55] focus:border-[#ff2d55] focus:outline-none"
      />
    </div>
  );

  return (
    <>
      <SectionCard title="Automatický plán" icon={CalendarClock} testId="section-schedule">
        <div className="rounded-xl border border-white/5 bg-black/40 p-3 mb-3 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">Plán aktivní</div>
            <div className="text-[11px] text-neutral-500">
              Pokud je vypnuto, hodiny se chovají normálně podle ručního ovládání.
            </div>
          </div>
          <button
            data-testid="schedule-enabled-toggle"
            onClick={() => update("enabled", !schedule.enabled)}
            className={`relative h-7 w-12 rounded-full border transition shrink-0 ${
              schedule.enabled ? "bg-[#ff2d55] border-[#ff2d55]" : "bg-neutral-800 border-white/10"
            }`}
            aria-pressed={schedule.enabled}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                schedule.enabled ? "translate-x-6" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>

        <div className="space-y-3">
          <TimeRow
            label="🌙 Začátek nočního režimu"
            hint="Hodiny se přepnou na červenou (jas dle okolního světla)."
            value={schedule.nightStart}
            onChange={(v) => update("nightStart", v)}
            testId="schedule-night-start"
            color="#ff3b30"
          />
          <TimeRow
            label="🛌 Úplné vypnutí"
            hint="Hodiny zhasnou úplně — žádné světlo."
            value={schedule.sleepStart}
            onChange={(v) => update("sleepStart", v)}
            testId="schedule-sleep-start"
            color="#0a0a0a"
          />
          <TimeRow
            label="☀ Probuzení"
            hint="Hodiny se ráno zapnou v denním režimu (tvoje barvy/efekty)."
            value={schedule.wake}
            onChange={(v) => update("wake", v)}
            testId="schedule-wake"
            color="#ff9500"
          />
        </div>

        <GlowButton
          testId="btn-schedule-save"
          variant="primary"
          className="w-full mt-4"
          onClick={sendAll}
          disabled={disabled}
        >
          Uložit plán do hodin
        </GlowButton>
      </SectionCard>

      <SectionCard title="Jak to funguje" testId="section-schedule-help">
        <div className="text-xs text-neutral-400 leading-relaxed space-y-2">
          <p>
            <span className="text-emerald-400">☀ Den</span> ({schedule.wake} →{" "}
            {schedule.nightStart}): Tvoje vybraná barva a efekt, jas podle fotorezistoru.
          </p>
          <p>
            <span className="text-red-400">🌙 Noční tlumená</span> ({schedule.nightStart} →{" "}
            {schedule.sleepStart}): Hodiny svítí červeně, jas reaguje na tmu v místnosti.
          </p>
          <p>
            <span className="text-neutral-500">🛌 Spánek</span> ({schedule.sleepStart} →{" "}
            {schedule.wake}): LED úplně zhasnuty.
          </p>
          <p className="text-neutral-500 pt-2 border-t border-white/5">
            Plán běží na ESP32 podle RTC modulu — funguje i když nemáš telefon připojený. Časy se
            uloží do paměti hodin.
          </p>
        </div>
      </SectionCard>
    </>
  );
}

// ═════════════════════════════════════════════════════════════
// MANUAL PANEL
// ═════════════════════════════════════════════════════════════
function ManualPanel({ send, disabled, manualDigits, setManualDigits }) {
  const options = ["X", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  const setDigit = (idx, val) => {
    const next = [...manualDigits];
    next[idx] = val;
    setManualDigits(next);
  };
  return (
    <SectionCard title="Ruční nastavení číslic" icon={Wand2} testId="section-manual">
      <p className="text-xs text-neutral-500 mb-3">
        Zobraz libovolné 4 číslice místo času. <b>X</b> = zhasnuto.
      </p>
      <div className="grid grid-cols-4 gap-2 mb-3">
        {manualDigits.map((d, i) => (
          <div key={i} className="space-y-1">
            <div className="text-center text-xs text-neutral-500">D{i + 1}</div>
            <select
              data-testid={`manual-digit-${i + 1}`}
              value={d}
              onChange={(e) => setDigit(i, e.target.value)}
              className="w-full bg-neutral-900 border border-white/10 rounded-xl py-3 text-center text-2xl font-mono text-[#ff2d55] focus:border-[#ff2d55] focus:outline-none"
            >
              {options.map((o) => (
                <option key={o} value={o} className="text-base text-neutral-100 bg-neutral-900">
                  {o}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <GlowButton
          testId="btn-send-manual"
          variant="primary"
          onClick={() => send(`SET,${manualDigits.join(",")}`)}
          disabled={disabled}
        >
          Zobrazit
        </GlowButton>
        <GlowButton
          testId="btn-manual-auto"
          variant="ghost"
          onClick={() => send("AUTO")}
          disabled={disabled}
        >
          Vrátit čas
        </GlowButton>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <GlowButton testId="btn-manual-8888" onClick={() => send("SET,8,8,8,8")} disabled={disabled}>
          Test 8888
        </GlowButton>
        <GlowButton testId="btn-manual-0000" onClick={() => send("SET,0,0,0,0")} disabled={disabled}>
          0000
        </GlowButton>
        <GlowButton testId="btn-manual-clear" onClick={() => send("SET,X,X,X,X")} disabled={disabled}>
          Zhasnout
        </GlowButton>
      </div>
    </SectionCard>
  );
}

// ═════════════════════════════════════════════════════════════
// TERMINAL PANEL
// ═════════════════════════════════════════════════════════════
function TerminalPanel({ send, disabled, log, terminalInput, setTerminalInput }) {
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    // noop
  }, [log, autoScroll]);

  const handleSend = () => {
    if (!terminalInput.trim()) return;
    send(terminalInput.trim());
    setTerminalInput("");
  };

  return (
    <>
      <SectionCard title="Vlastní příkaz" icon={TerminalIcon} testId="section-terminal-input">
        <div className="flex gap-2">
          <input
            data-testid="terminal-input"
            value={terminalInput}
            onChange={(e) => setTerminalInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="např. RGB,255,0,128"
            className="flex-1 bg-neutral-900 border border-white/10 rounded-xl px-3 py-2.5 text-sm font-mono text-neutral-100 placeholder:text-neutral-600 focus:border-[#ff2d55] focus:outline-none"
          />
          <GlowButton testId="btn-terminal-send" variant="primary" onClick={handleSend} disabled={disabled}>
            Odeslat
          </GlowButton>
        </div>
        <div className="flex gap-2 mt-2">
          <GlowButton testId="btn-help" variant="ghost" onClick={() => send("HELP")} disabled={disabled}>
            HELP
          </GlowButton>
          <GlowButton testId="btn-status-2" variant="ghost" onClick={() => send("STATUS")} disabled={disabled}>
            STATUS
          </GlowButton>
        </div>
      </SectionCard>

      <SectionCard title="Komunikace" icon={TerminalIcon} testId="section-terminal-log">
        <div
          className="font-mono text-[11px] bg-black rounded-xl border border-white/10 p-3 h-64 overflow-y-auto"
          data-testid="terminal-log"
        >
          {log.length === 0 && <div className="text-neutral-600">Zatím žádná komunikace…</div>}
          {log.map((e) => (
            <div key={e.id} className="leading-relaxed">
              <span className="text-neutral-600">{e.time.toLocaleTimeString("cs-CZ")} </span>
              <span
                className={
                  e.direction === "tx"
                    ? "text-[#ff2d55]"
                    : e.direction === "rx"
                    ? "text-emerald-400"
                    : "text-amber-300"
                }
              >
                {e.direction === "tx" ? "→ " : e.direction === "rx" ? "← " : "• "}
              </span>
              <span className="text-neutral-200 whitespace-pre-wrap">{e.text}</span>
            </div>
          ))}
        </div>
      </SectionCard>
    </>
  );
}
