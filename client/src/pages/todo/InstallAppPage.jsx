import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, Smartphone, Monitor, Check } from "lucide-react";
import toast from "react-hot-toast";

export default function InstallAppPage() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    if (window.matchMedia("(display-mode: standalone)").matches || (window.navigator.standalone === true)) {
      setIsInstalled(true);
    }
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      toast("Install not available in this browser. Try adding to home screen from the browser menu.");
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      toast.success("App installed! Open it from your home screen.");
      setDeferredPrompt(null);
      setIsInstalled(true);
    }
  };

  return (
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-lg mx-auto text-center"
      >
        <div
          className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6"
          style={{ background: "var(--accent-soft)" }}
        >
          <Download size={40} style={{ color: "var(--accent)" }} />
        </div>
        <h1
          className="text-2xl font-bold mb-2"
          style={{ color: "var(--text-primary)" }}
        >
          Install QuestionBank TODO
        </h1>
        <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>
          Add this app to your home screen or desktop for quick access and a full-screen experience.
        </p>

        {isInstalled ? (
          <div className="card p-6 flex items-center justify-center gap-3" style={{ color: "var(--color-success)" }}>
            <Check size={24} />
            <span className="font-medium">App is installed</span>
          </div>
        ) : (
          <>
            <div className="card p-6 mb-6 text-left">
              <h3 className="font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
                Why install?
              </h3>
              <ul className="space-y-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                <li className="flex items-center gap-2">
                  <Smartphone size={16} style={{ color: "var(--accent)" }} />
                  Open from home screen like a native app
                </li>
                <li className="flex items-center gap-2">
                  <Monitor size={16} style={{ color: "var(--accent)" }} />
                  Works offline for your todos and focus timer
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} style={{ color: "var(--accent)" }} />
                  No browser chrome — more space for your tasks
                </li>
              </ul>
            </div>
            <button
              type="button"
              className="btn btn-primary btn-lg w-full"
              onClick={handleInstall}
            >
              <Download size={20} />
              Install to home screen / desktop
            </button>
            <p className="text-xs mt-4" style={{ color: "var(--text-muted)" }}>
              On mobile: use your browser’s “Add to Home Screen” from the menu if the button doesn’t appear.
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
}
