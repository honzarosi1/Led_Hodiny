// Web Bluetooth hook pro komunikaci s ESP32 LED hodinami
// Nordic UART Service UUIDs (stejné jako v Arduino kódu)
import { useCallback, useEffect, useRef, useState } from "react";

const UART_SERVICE = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
const UART_RX_CHAR = "6e400002-b5a3-f393-e0a9-e50e24dcca9e"; // Write -> ESP32
const UART_TX_CHAR = "6e400003-b5a3-f393-e0a9-e50e24dcca9e"; // Notify <- ESP32

export function useBLE() {
  const [isSupported, setIsSupported] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [deviceName, setDeviceName] = useState("");
  const [log, setLog] = useState([]);

  const deviceRef = useRef(null);
  const rxCharRef = useRef(null);
  const txCharRef = useRef(null);
  const sendQueueRef = useRef(Promise.resolve());

  useEffect(() => {
    setIsSupported(typeof navigator !== "undefined" && !!navigator.bluetooth);
  }, []);

  const addLog = useCallback((direction, text) => {
    setLog((prev) => {
      const entry = { id: Date.now() + Math.random(), direction, text, time: new Date() };
      const next = [entry, ...prev];
      return next.slice(0, 80);
    });
  }, []);

  const handleNotification = useCallback(
    (event) => {
      const decoder = new TextDecoder("utf-8");
      const value = decoder.decode(event.target.value);
      addLog("rx", value);
    },
    [addLog]
  );

  const handleDisconnect = useCallback(() => {
    setIsConnected(false);
    setDeviceName("");
    addLog("sys", "Odpojeno");
  }, [addLog]);

  const connect = useCallback(async () => {
    if (!navigator.bluetooth) {
      addLog("sys", "CHYBA: Web Bluetooth není podporováno. Použij prohlížeč Bluefy.");
      return;
    }
    try {
      setIsConnecting(true);
      addLog("sys", "Hledám zařízení LED_HODINY…");
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ name: "LED_HODINY" }],
        optionalServices: [UART_SERVICE],
      });
      deviceRef.current = device;
      device.addEventListener("gattserverdisconnected", handleDisconnect);
      addLog("sys", `Připojuji k ${device.name}…`);
      const server = await device.gatt.connect();
      const service = await server.getPrimaryService(UART_SERVICE);
      const rxChar = await service.getCharacteristic(UART_RX_CHAR);
      const txChar = await service.getCharacteristic(UART_TX_CHAR);
      await txChar.startNotifications();
      txChar.addEventListener("characteristicvaluechanged", handleNotification);
      rxCharRef.current = rxChar;
      txCharRef.current = txChar;
      setIsConnected(true);
      setDeviceName(device.name || "LED_HODINY");
      addLog("sys", "Připojeno ✓");
    } catch (err) {
      addLog("sys", `CHYBA: ${err?.message || err}`);
    } finally {
      setIsConnecting(false);
    }
  }, [addLog, handleDisconnect, handleNotification]);

  const disconnect = useCallback(async () => {
    try {
      if (deviceRef.current?.gatt?.connected) {
        deviceRef.current.gatt.disconnect();
      }
    } catch (_err) {
      // ignore
    }
  }, []);

  const send = useCallback(
    (command) => {
      if (!rxCharRef.current) {
        addLog("sys", "Nepřipojeno. Klikni na Připojit.");
        return;
      }
      const text = String(command);
      // Serializovat writes, aby se překrývaly
      sendQueueRef.current = sendQueueRef.current
        .then(async () => {
          try {
            const encoder = new TextEncoder();
            await rxCharRef.current.writeValueWithoutResponse(encoder.encode(text));
            addLog("tx", text);
          } catch (err) {
            try {
              const encoder = new TextEncoder();
              await rxCharRef.current.writeValue(encoder.encode(text));
              addLog("tx", text);
            } catch (err2) {
              addLog("sys", `CHYBA odeslání: ${err2?.message || err2}`);
            }
          }
        })
        .catch(() => {});
    },
    [addLog]
  );

  return {
    isSupported,
    isConnected,
    isConnecting,
    deviceName,
    log,
    connect,
    disconnect,
    send,
  };
}
