"use client";

import React from "react";
import { Save, RotateCcw } from "lucide-react";
import { useNovelTeaStore } from "@/stores/noveltea-store";
import { getTranslations, LANGUAGES } from "@/lib/i18n";
import type { NovelTeaSettings } from "@/types";
import type { Language } from "@/lib/i18n";

const FONTS = [
  "Inter, system-ui, sans-serif",
  "Georgia, serif",
  "Merriweather, serif",
  "'Courier New', monospace",
  "'Source Sans Pro', sans-serif",
  "'Lora', serif",
];

export default function SettingsView() {
  const { settings, updateSettings } = useNovelTeaStore();
  const t = getTranslations(settings.language || "de");

  const update = (partial: Partial<NovelTeaSettings>) => updateSettings(partial);

  const THEMES = [
    { value: "dark" as const, label: t.settings.dark, bg: "#08080d", fg: "#e4e4e7" },
    { value: "grey" as const, label: t.settings.grey, bg: "#1a1a2e", fg: "#e4e4e7" },
    { value: "light" as const, label: t.settings.light, bg: "#f5f5f5", fg: "#18181b" },
  ];

  const resetDefaults = () => {
    updateSettings({
      theme: "dark",
      editorFont: "Inter, system-ui, sans-serif",
      editorFontSize: 16,
      editorLineHeight: 1.8,
      autosaveInterval: 30000,
      showWordCount: true,
      typewriterMode: false,
      focusMode: false,
      spellcheck: true,
      language: "de" as Language,
      highlightDates: true,
      highlightNames: true,
    });
  };

  return (
    <div style={{ height: "100%", overflow: "auto", padding: 32 }}>
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)" }}>{t.settings.title}</h1>
          <button className="btn-ghost" onClick={resetDefaults} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
            <RotateCcw size={13} /> {t.settings.resetDefaults}
          </button>
        </div>

        {/* Language */}
        <Section title={t.settings.language}>
          <label style={labelStyle}>{t.settings.languageDesc}</label>
          <select
            className="input"
            style={{ width: "100%", marginBottom: 16 }}
            value={settings.language || "de"}
            onChange={(e) => update({ language: e.target.value as Language })}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>{lang.label}</option>
            ))}
          </select>
        </Section>

        {/* Theme */}
        <Section title={t.settings.appearance}>
          <label style={labelStyle}>{t.settings.theme}</label>
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            {THEMES.map((th) => (
              <div
                key={th.value}
                onClick={() => update({ theme: th.value })}
                style={{
                  flex: 1,
                  padding: "14px 16px",
                  background: th.bg,
                  color: th.fg,
                  border: `2px solid ${settings.theme === th.value ? "var(--accent)" : "var(--border-subtle)"}`,
                  borderRadius: "var(--radius-sm)",
                  cursor: "pointer",
                  textAlign: "center",
                  fontSize: 13,
                  fontWeight: 600,
                  transition: "border-color 0.15s",
                }}
              >
                {th.label}
              </div>
            ))}
          </div>
        </Section>

        {/* Editor settings */}
        <Section title={t.settings.editorSection}>
          <label style={labelStyle}>{t.settings.fontFamily}</label>
          <select
            className="input"
            style={{ width: "100%", marginBottom: 16 }}
            value={settings.editorFont}
            onChange={(e) => update({ editorFont: e.target.value })}
          >
            {FONTS.map((f) => (
              <option key={f} value={f} style={{ fontFamily: f }}>{f.split(",")[0].replace(/'/g, "")}</option>
            ))}
          </select>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>{t.settings.fontSize}</label>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <input
                  type="range"
                  min={12}
                  max={24}
                  step={1}
                  value={settings.editorFontSize}
                  onChange={(e) => update({ editorFontSize: Number(e.target.value) })}
                  style={{ flex: 1 }}
                />
                <span style={{ fontSize: 13, color: "var(--text-muted)", minWidth: 36, textAlign: "right" }}>
                  {settings.editorFontSize}px
                </span>
              </div>
            </div>
            <div>
              <label style={labelStyle}>{t.settings.lineHeight}</label>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <input
                  type="range"
                  min={1.2}
                  max={2.4}
                  step={0.1}
                  value={settings.editorLineHeight}
                  onChange={(e) => update({ editorLineHeight: Number(e.target.value) })}
                  style={{ flex: 1 }}
                />
                <span style={{ fontSize: 13, color: "var(--text-muted)", minWidth: 36, textAlign: "right" }}>
                  {settings.editorLineHeight.toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div
            style={{
              padding: 20,
              background: "var(--bg-hover)",
              borderRadius: "var(--radius-sm)",
              fontFamily: settings.editorFont,
              fontSize: settings.editorFontSize,
              lineHeight: settings.editorLineHeight,
              color: "var(--text-primary)",
              marginBottom: 16,
            }}
          >
            The quick brown fox jumps over the lazy dog. In the beginning, there was nothing but darkness and silence.
          </div>
        </Section>

        {/* Writing preferences */}
        <Section title={t.settings.writing}>
          <ToggleSetting
            label={t.settings.showWordCount}
            description={t.settings.showWordCountDesc}
            value={settings.showWordCount}
            onChange={(v) => update({ showWordCount: v })}
          />
          <ToggleSetting
            label={t.settings.typewriterMode}
            description={t.settings.typewriterModeDesc}
            value={settings.typewriterMode}
            onChange={(v) => update({ typewriterMode: v })}
          />
          <ToggleSetting
            label={t.settings.focusMode}
            description={t.settings.focusModeDesc}
            value={settings.focusMode}
            onChange={(v) => update({ focusMode: v })}
          />
          <ToggleSetting
            label={t.settings.spellcheck}
            description={t.settings.spellcheckDesc}
            value={settings.spellcheck}
            onChange={(v) => update({ spellcheck: v })}
          />
        </Section>

        {/* Autosave */}
        <Section title={t.settings.autosave}>
          <label style={labelStyle}>{t.settings.autosaveInterval}</label>
          <select
            className="input"
            style={{ width: "100%" }}
            value={settings.autosaveInterval}
            onChange={(e) => update({ autosaveInterval: Number(e.target.value) })}
          >
            <option value={10000}>{t.settings.seconds10}</option>
            <option value={30000}>{t.settings.seconds30}</option>
            <option value={60000}>{t.settings.minute1}</option>
            <option value={120000}>{t.settings.minutes2}</option>
            <option value={300000}>{t.settings.minutes5}</option>
            <option value={0}>{t.settings.disabled}</option>
          </select>
        </Section>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: "var(--text-muted)",
  display: "block",
  marginBottom: 6,
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{
        fontSize: 13, fontWeight: 700, color: "var(--text-secondary)",
        textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 16,
        paddingBottom: 8, borderBottom: "1px solid var(--border-subtle)",
      }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

function ToggleSetting({ label, description, value, onChange }: { label: string; description: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 0", borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{label}</div>
        <div style={{ fontSize: 11, color: "var(--text-dim)" }}>{description}</div>
      </div>
      <button
        onClick={() => onChange(!value)}
        style={{
          width: 40,
          height: 22,
          borderRadius: 11,
          border: "none",
          background: value ? "var(--accent)" : "var(--bg-hover)",
          cursor: "pointer",
          position: "relative",
          transition: "background 0.2s",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 3,
            left: value ? 21 : 3,
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: "#fff",
            transition: "left 0.2s",
          }}
        />
      </button>
    </div>
  );
}
