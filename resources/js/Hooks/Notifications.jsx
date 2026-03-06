import { useState, useEffect, useCallback, useRef } from "react";

/* ─────────────────────────────────────────────
   ICONS
───────────────────────────────────────────── */
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const WarnIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);
const DangerIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);
const InfoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);
const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

/* ─────────────────────────────────────────────
   THEME CONFIG
───────────────────────────────────────────── */
const THEMES = {
  success: {
    bg: "#ffffff",
    border: "#d1fae5",
    accent: "#16a34a",
    track: "#dcfce7",
    icon: CheckIcon,
    label: "Success",
    glow: "rgba(22,163,74,0.10)",
  },
  warning: {
    bg: "#ffffff",
    border: "#fef3c7",
    accent: "#d97706",
    track: "#fef9c3",
    icon: WarnIcon,
    label: "Warning",
    glow: "rgba(217,119,6,0.10)",
  },
  danger: {
    bg: "#ffffff",
    border: "#fee2e2",
    accent: "#dc2626",
    track: "#fee2e2",
    icon: DangerIcon,
    label: "Danger",
    glow: "rgba(220,38,38,0.10)",
  },
  info: {
    bg: "#ffffff",
    border: "#dbeafe",
    accent: "#2563eb",
    track: "#eff6ff",
    icon: InfoIcon,
    label: "Info",
    glow: "rgba(37,99,235,0.10)",
  },
};

/* ─────────────────────────────────────────────
   SINGLE NOTIFICATION
───────────────────────────────────────────── */
function Notification({ id, type = "success", title, message, duration = 4000, onDismiss }) {
  const theme = THEMES[type] || THEMES.success;
  const Icon = theme.icon;

  const [phase, setPhase] = useState("enter"); // enter | idle | leave
  const [progress, setProgress] = useState(100);
  const startRef = useRef(null);
  const rafRef = useRef(null);
  const pausedRef = useRef(false);
  const remainingRef = useRef(duration);
  const lastTickRef = useRef(null);

  const dismiss = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    setPhase("leave");
    setTimeout(() => onDismiss(id), 380);
  }, [id, onDismiss]);

  // Animate progress
  useEffect(() => {
    const tick = (ts) => {
      if (pausedRef.current) {
        lastTickRef.current = ts;
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      if (!lastTickRef.current) lastTickRef.current = ts;
      const delta = ts - lastTickRef.current;
      lastTickRef.current = ts;
      remainingRef.current = Math.max(0, remainingRef.current - delta);
      setProgress((remainingRef.current / duration) * 100);
      if (remainingRef.current <= 0) {
        dismiss();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [duration, dismiss]);

  // Enter animation
  useEffect(() => {
    const t = setTimeout(() => setPhase("idle"), 20);
    return () => clearTimeout(t);
  }, []);

  const handleMouseEnter = () => { pausedRef.current = true; };
  const handleMouseLeave = () => {
    lastTickRef.current = null;
    pausedRef.current = false;
  };

  const translateY = phase === "enter" ? "translateY(20px)" : phase === "leave" ? "translateY(-10px)" : "translateY(0)";
  const opacity = phase === "idle" ? 1 : 0;
  const scale = phase === "leave" ? 0.94 : 1;

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        position: "relative",
        width: "340px",
        background: "#ffffff",
        border: `1px solid ${theme.border}`,
        borderRadius: "5px",
        padding: "14px 16px 0 16px",
        boxShadow: `0 4px 16px rgba(0,0,0,0.10), 0 0 30px ${theme.glow}`,
        overflow: "hidden",
        cursor: "default",
        transition: "opacity 0.38s cubic-bezier(.4,0,.2,1), transform 0.38s cubic-bezier(.4,0,.2,1)",
        opacity,
        transform: `${translateY} scale(${scale})`,
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      }}
    >

      {/* Header row */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", paddingBottom: "12px" }}>
        {/* Icon bubble */}
        <div style={{
          flexShrink: 0,
          width: "32px", height: "32px",
          borderRadius: "8px",
          background: `${theme.accent}18`,
          border: `1px solid ${theme.accent}40`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: theme.accent,
          marginTop: "1px",
        }}>
          <Icon />
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: "13px",
            fontWeight: "700",
            color: theme.accent,
            letterSpacing: "0.02em",
            marginBottom: "2px",
            textTransform: "uppercase",
            fontFamily: "'DM Mono', monospace",
          }}>
            {title || theme.label}
          </div>
          {message && (
            <div style={{
              fontSize: "13.5px",
              color: "#4b5563",
              lineHeight: "1.45",
              wordBreak: "break-word",
            }}>
              {message}
            </div>
          )}
        </div>

        {/* Close */}
        <button
          onClick={dismiss}
          style={{
            flexShrink: 0,
            background: "rgba(0,0,0,0.04)",
            border: "1px solid rgba(0,0,0,0.08)",
            borderRadius: "6px",
            color: "rgba(0,0,0,0.35)",
            cursor: "pointer",
            padding: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background 0.15s, color 0.15s",
            marginTop: "1px",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "rgba(0,0,0,0.09)";
            e.currentTarget.style.color = "rgba(0,0,0,0.7)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "rgba(0,0,0,0.04)";
            e.currentTarget.style.color = "rgba(0,0,0,0.35)";
          }}
        >
          <CloseIcon />
        </button>
      </div>

      {/* Progress bar track */}
      <div style={{
        height: "3px",
        background: theme.track,
        borderRadius: "0 0 5px 5px",
        overflow: "hidden",
        marginLeft: "-16px",
        marginRight: "-16px",
      }}>
        <div style={{
          height: "100%",
          width: `${progress}%`,
          background: `linear-gradient(90deg, ${theme.accent}99, ${theme.accent})`,
          borderRadius: "0 2px 2px 0",
          transition: "none",
          boxShadow: `0 0 8px ${theme.accent}80`,
        }} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   CONTAINER  (top-right stack)
───────────────────────────────────────────── */
function NotificationContainer({ notifications, onDismiss }) {
  return (
    <div style={{
      position: "fixed",
      top: "20px",
      right: "20px",
      display: "flex",
      flexDirection: "column",
      gap: "10px",
      zIndex: 9999,
      pointerEvents: "none",
    }}>
      {notifications.map(n => (
        <div key={n.id} style={{ pointerEvents: "auto" }}>
          <Notification {...n} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   HOOK  – useNotifications()
   Returns: { notify, NotificationPortal }
───────────────────────────────────────────── */
export function useNotifications() {
  const [notifications, setNotifications] = useState([]);

  const dismiss = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const notify = useCallback(({ type = "info", title, message, duration = 4000 } = {}) => {
    const id = Math.random().toString(36).slice(2);
    setNotifications(prev => [...prev, { id, type, title, message, duration }]);
  }, []);

  const NotificationPortal = useCallback(() => (
    <NotificationContainer notifications={notifications} onDismiss={dismiss} />
  ), [notifications, dismiss]);

  return { notify, NotificationPortal };
}