"use client";

import React, { useState, useEffect, useCallback, createContext, useContext } from "react";
import { CheckCircle, AlertCircle, X } from "lucide-react";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type?: "success" | "error" | "info", duration?: number) => void;
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: "success" | "error" | "info" = "success", duration = 2500) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        zIndex: 10000,
        pointerEvents: "none",
      }}>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onRemove(toast.id), 300);
    }, toast.duration || 2500);
    return () => clearTimeout(timer);
  }, [toast, onRemove]);

  const colors = {
    success: { bg: "rgba(74, 222, 128, 0.15)", border: "rgba(74, 222, 128, 0.3)", icon: "#4ade80" },
    error: { bg: "rgba(248, 113, 113, 0.15)", border: "rgba(248, 113, 113, 0.3)", icon: "#f87171" },
    info: { bg: "rgba(96, 165, 250, 0.15)", border: "rgba(96, 165, 250, 0.3)", icon: "#60a5fa" },
  };

  const c = colors[toast.type];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 16px",
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: "var(--radius-sm)",
        backdropFilter: "blur(12px)",
        pointerEvents: "auto",
        minWidth: 240,
        maxWidth: 400,
        transform: visible && !exiting ? "translateX(0)" : "translateX(100%)",
        opacity: visible && !exiting ? 1 : 0,
        transition: "all 0.3s ease",
      }}
    >
      {toast.type === "success" ? <CheckCircle size={16} style={{ color: c.icon, flexShrink: 0 }} /> :
       toast.type === "error" ? <AlertCircle size={16} style={{ color: c.icon, flexShrink: 0 }} /> :
       <AlertCircle size={16} style={{ color: c.icon, flexShrink: 0 }} />}
      <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", flex: 1 }}>{toast.message}</span>
      <button
        onClick={() => { setExiting(true); setTimeout(() => onRemove(toast.id), 300); }}
        style={{ background: "transparent", border: "none", color: "var(--text-dim)", cursor: "pointer", padding: 2, flexShrink: 0 }}
      >
        <X size={14} />
      </button>
    </div>
  );
}
