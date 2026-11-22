import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { INSTALL_HINT_BODY, INSTALL_HINT_TITLE, INSTALL_LABEL, INSTALL_NOT_NOW } from "@/lib/brand";

export const INSTALL_HINT_KEY = "daybreak-install-hint-v1";

interface InstallPrompt extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const InstallContext = createContext({
  visible: false,
  ios: false,
  canPrompt: false,
  busy: false,
  dismiss: () => {},
  install: async () => {},
});

// Mounted outside the age and welcome screens so early browser offers are retained.
export function InstallHintProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [ios, setIos] = useState(false);
  const [offer, setOffer] = useState<InstallPrompt | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const displayMode = window.matchMedia("(display-mode: standalone)");
    const device = navigator as Navigator & { standalone?: boolean };
    const updateInstalled = () => setInstalled(displayMode.matches || device.standalone === true);
    updateInstalled();
    setIos(/iPad|iPhone|iPod/.test(device.userAgent) || (device.platform === "MacIntel" && device.maxTouchPoints > 1));
    try { setDismissed(localStorage.getItem(INSTALL_HINT_KEY) === "true"); } catch { /* Storage may be unavailable. */ }
    setReady(true);
    const onOffer = (event: Event) => {
      event.preventDefault();
      setOffer(event as InstallPrompt);
    };
    const onInstalled = () => { setInstalled(true); setOffer(null); };
    window.addEventListener("beforeinstallprompt", onOffer);
    window.addEventListener("appinstalled", onInstalled);
    displayMode.addEventListener("change", updateInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onOffer);
      window.removeEventListener("appinstalled", onInstalled);
      displayMode.removeEventListener("change", updateInstalled);
    };
  }, []);

  function dismiss() {
    setDismissed(true);
    try { localStorage.setItem(INSTALL_HINT_KEY, "true"); } catch { /* Keep hidden for this visit. */ }
  }

  async function install() {
    if (!offer || busy) return;
    setBusy(true);
    try {
      await offer.prompt();
      const choice = await offer.userChoice;
      if (choice.outcome === "accepted") setInstalled(true);
    } catch { /* The browser instructions remain available. */ }
    finally { setOffer(null); setBusy(false); }
  }

  return <InstallContext.Provider value={{ visible: ready && !installed && !dismissed, ios, canPrompt: offer !== null, busy, dismiss, install }}>{children}</InstallContext.Provider>;
}

export function InstallHint() {
  const { visible, canPrompt, busy, dismiss, install } = useContext(InstallContext);
  if (!visible) return null;
  return (
    <section className="space-y-3 rounded-lg border bg-card p-5 text-card-foreground">
      <h2 className="font-display text-xl">{INSTALL_HINT_TITLE}</h2>
      <p className="text-base leading-relaxed text-muted-foreground">{INSTALL_HINT_BODY}</p>
      <div className="flex flex-col gap-3 sm:flex-row">
        {canPrompt ? (
          <Button variant="calm" className="min-h-12" disabled={busy} onClick={() => void install()}>{INSTALL_LABEL}</Button>
        ) : (
          <Button variant="calm" className="min-h-12" asChild>
            <Link to="/install">{INSTALL_LABEL}</Link>
          </Button>
        )}
        <Button variant="quiet" className="min-h-12 rounded-full" onClick={dismiss}>{INSTALL_NOT_NOW}</Button>
      </div>
    </section>
  );
}