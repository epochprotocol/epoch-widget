import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "@epoch-protocol/epoch-intent-widget/styles.css";
import "@rainbow-me/rainbowkit/styles.css";
import "sonner/dist/styles.css";

const bootScreenStyle: React.CSSProperties = {
  minHeight: "100vh",
  display: "grid",
  placeItems: "center",
  padding: "24px",
  color: "#25292e",
  background: "#f8f9fb",
  fontFamily:
    'SFRounded, ui-rounded, "SF Pro Rounded", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
};

function Bootstrap() {
  const [RuntimeApp, setRuntimeApp] =
    useState<React.ComponentType | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    import("./RuntimeApp")
      .then((module) => {
        if (active) setRuntimeApp(() => module.default);
      })
      .catch((error: unknown) => {
        if (!active) return;
        setLoadError(error instanceof Error ? error.message : String(error));
      });

    return () => {
      active = false;
    };
  }, []);

  if (RuntimeApp) return <RuntimeApp />;

  if (loadError) {
    return (
      <main style={bootScreenStyle}>
        <section style={{ maxWidth: 520, textAlign: "center" }}>
          <h1 style={{ marginBottom: 12 }}>Miden runtime did not load</h1>
          <p style={{ marginBottom: 20 }}>{loadError}</p>
          <button type="button" onClick={() => window.location.reload()}>
            Retry
          </button>
        </section>
      </main>
    );
  }

  return (
    <main style={bootScreenStyle} role="status" aria-live="polite">
      Loading Miden integration…
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Bootstrap />
  </React.StrictMode>,
);
