// ╔═══════════════════════════════════════════════════════════════════════╗
// ║  🔑  KI-ANBIETER & API-KEYS                                            ║
// ║                                                                         ║
// ║  Diese Datei steuert die KI-Anbieter (Claude, OpenAI, Gemini, Mistral). ║
// ║  Normalerweise müssen Sie hier NICHTS ändern.                           ║
// ║                                                                         ║
// ║  Wo wird der API-Key eingegeben?                                        ║
// ║   • Standard: jede:r Nutzer:in gibt den Key beim ersten Öffnen im       ║
// ║     Begrüßungsfenster ein (wird nur im Browser gespeichert).            ║
// ║   • Fester Key für alle (nur bei Vercel): als Environment Variables     ║
// ║     VITE_FIXED_PROVIDER, VITE_FIXED_API_KEY, VITE_FIXED_MODEL setzen.    ║
// ║     Siehe Funktion getFixedConfig() weiter unten und die README.        ║
// ║                                                                         ║
// ║  Neue Modelle hinzufügen: in der jeweiligen "models"-Liste ergänzen.    ║
// ╚═══════════════════════════════════════════════════════════════════════╝


export const PROVIDERS = {
  anthropic: {
    label: "Anthropic (Claude)",
    keyPlaceholder: "sk-ant-...",
    keyUrl: "https://console.anthropic.com",
    models: ["claude-haiku-4-5-20251001", "claude-sonnet-4-6", "claude-opus-4-8"],
    defaultModel: "claude-haiku-4-5-20251001",
    async call({ apiKey, model, system, messages, maxTokens }) {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true"
        },
        body: JSON.stringify({ model, max_tokens: maxTokens, system, messages })
      });
      const d = await r.json();
      if (d.error) throw new Error(d.error.message || "Anthropic-Fehler");
      return d.content?.map(b => b.text || "").join("") || "";
    }
  },

  openai: {
    label: "OpenAI (GPT)",
    keyPlaceholder: "sk-...",
    keyUrl: "https://platform.openai.com/api-keys",
    models: ["gpt-4o-mini", "gpt-4o", "gpt-4.1-mini", "gpt-4.1"],
    defaultModel: "gpt-4o-mini",
    async call({ apiKey, model, system, messages, maxTokens }) {
      const r = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + apiKey },
        body: JSON.stringify({
          model,
          max_tokens: maxTokens,
          messages: [{ role: "system", content: system }, ...messages]
        })
      });
      const d = await r.json();
      if (d.error) throw new Error(d.error.message || "OpenAI-Fehler");
      return d.choices?.[0]?.message?.content || "";
    }
  },

  gemini: {
    label: "Google (Gemini)",
    keyPlaceholder: "AIza... oder neuer Key",
    keyUrl: "https://aistudio.google.com/app/apikey",
    models: ["gemini-2.0-flash", "gemini-2.5-flash", "gemini-1.5-pro"],
    defaultModel: "gemini-2.0-flash",
    async call({ apiKey, model, system, messages, maxTokens }) {
      const contents = messages.map(m => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }]
      }));
      const r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: system }] },
            contents,
            generationConfig: { maxOutputTokens: maxTokens }
          })
        }
      );
      const d = await r.json();
      if (d.error) throw new Error(d.error.message || "Gemini-Fehler");
      return d.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("") || "";
    }
  },

  mistral: {
    label: "Mistral",
    keyPlaceholder: "...",
    keyUrl: "https://console.mistral.ai/api-keys",
    models: ["mistral-small-latest", "mistral-large-latest", "open-mistral-nemo"],
    defaultModel: "mistral-small-latest",
    async call({ apiKey, model, system, messages, maxTokens }) {
      const r = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + apiKey },
        body: JSON.stringify({
          model,
          max_tokens: maxTokens,
          messages: [{ role: "system", content: system }, ...messages]
        })
      });
      const d = await r.json();
      if (d.error) throw new Error(d.error.message || "Mistral-Fehler");
      return d.choices?.[0]?.message?.content || "";
    }
  }
};

const STORAGE_KEY = "peoe_llm_config";

// ── FESTER BACKEND-KEY (optional) ──────────────────────────────────────────
// Wenn die betreibende Person Environment Variables in Vercel setzt, nutzen ALLE
// Nutzer automatisch diesen Key — der Setup-Screen wird dann übersprungen.
// Benötigte Variablen in Vercel:
//   VITE_FIXED_PROVIDER  = anthropic | openai | gemini | mistral
//   VITE_FIXED_API_KEY   = der API-Key
//   VITE_FIXED_MODEL     = (optional) Modellname, sonst Default des Anbieters
export function getFixedConfig() {
  const provider = import.meta.env.VITE_FIXED_PROVIDER;
  const apiKey = import.meta.env.VITE_FIXED_API_KEY;
  if (!provider || !apiKey || !PROVIDERS[provider]) return null;
  return {
    provider,
    apiKey,
    model: import.meta.env.VITE_FIXED_MODEL || PROVIDERS[provider].defaultModel,
    fixed: true
  };
}

export function loadConfig() {
  // 1. Fester Backend-Key hat Vorrang
  const fixed = getFixedConfig();
  if (fixed) return fixed;
  // 2. Sonst: im Browser gespeicherte Nutzer-Konfiguration
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const c = JSON.parse(raw);
    if (!c.provider || !c.apiKey || !PROVIDERS[c.provider]) return null;
    return c;
  } catch {
    return null;
  }
}

export function saveConfig(config) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(config)); } catch {}
}

export function clearConfig() {
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
}

// Zentrale Aufruf-Funktion — nutzt die gespeicherte Konfiguration
export async function callLLM(messages, system, maxTokens = 1024) {
  const cfg = loadConfig();
  if (!cfg) return "⚠️ Kein Anbieter konfiguriert. Bitte zuerst Anbieter & API-Key eingeben.";
  const provider = PROVIDERS[cfg.provider];
  try {
    const text = await provider.call({
      apiKey: cfg.apiKey,
      model: cfg.model || provider.defaultModel,
      system,
      messages,
      maxTokens
    });
    return text || "Keine Antwort erhalten.";
  } catch (e) {
    return "⚠️ Fehler (" + provider.label + "): " + e.message;
  }
}
