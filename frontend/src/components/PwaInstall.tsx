"use client";

import { useEffect, useState } from "react";

type InstallPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export default function PwaInstall() {
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null);
  const [showIosHelp, setShowIosHelp] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [installed, setInstalled] = useState(true);

  useEffect(() => {
    if ("serviceWorker" in navigator) void navigator.serviceWorker.register("/sw.js");

    const standalone = window.matchMedia("(display-mode: standalone)").matches ||
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setInstalled(standalone);
    setIsIos(ios);

    const handlePrompt = (event: Event) => {
      event.preventDefault();
      setPrompt(event as InstallPrompt);
      setInstalled(false);
    };
    const handleInstalled = () => {
      setPrompt(null);
      setInstalled(true);
    };

    window.addEventListener("beforeinstallprompt", handlePrompt);
    window.addEventListener("appinstalled", handleInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handlePrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  if (installed || (!prompt && !isIos)) return null;

  async function install() {
    if (!prompt) {
      setShowIosHelp((value) => !value);
      return;
    }
    await prompt.prompt();
    const choice = await prompt.userChoice;
    if (choice.outcome === "accepted") setInstalled(true);
    setPrompt(null);
  }

  return (
    <div className="pwa-install-wrap">
      <button type="button" className="pwa-install" onClick={() => void install()} aria-label="Install Canopy app">
        <svg viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path d="M9 2.5v8M5.8 7.7 9 10.9l3.2-3.2M3 12.5v1A1.5 1.5 0 0 0 4.5 15h9a1.5 1.5 0 0 0 1.5-1.5v-1" />
        </svg>
        <span>Install</span>
      </button>
      {showIosHelp && <span className="pwa-install-help" role="status">In Safari, tap Share then Add to Home Screen.</span>}
    </div>
  );
}
