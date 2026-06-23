// ╔═══════════════════════════════════════════════════════════════════════╗
// ║                                                                         ║
// ║          ⚙️  EINSTELLUNGEN  —  HIER ALLES WICHTIGE ÄNDERN  ⚙️           ║
// ║                                                                         ║
// ║  Diese Datei ist der zentrale Ort für die wichtigsten Einstellungen.    ║
// ║  Ändern Sie NUR den Text zwischen den Anführungszeichen "..." bzw.      ║
// ║  die Zahlen. Lassen Sie Anführungszeichen, Kommas und Klammern stehen.  ║
// ║                                                                         ║
// ║  Nach jeder Änderung: speichern und (falls online) ins Repository       ║
// ║  hochladen (git push bzw. auf GitHub das Stift-Symbol -> Commit).       ║
// ║                                                                         ║
// ╚═══════════════════════════════════════════════════════════════════════╝


// ───────────────────────────────────────────────────────────────────────────
// 1) ADMIN-PIN  (Passwort für den Bearbeiten-Bereich auf der Startseite)
// ───────────────────────────────────────────────────────────────────────────
// Ändern Sie "1234" in Ihr Wunsch-Passwort. Nur Zahlen oder Buchstaben.
export const ADMIN_PIN = "1234";


// ───────────────────────────────────────────────────────────────────────────
// 2) TEXTE AUF DER STARTSEITE
// ───────────────────────────────────────────────────────────────────────────
export const APP_TEXTE = {
  // Kleiner Hinweis-Banner ganz oben:
  banner: "PE/OE · CASE STUDY · KRONBERG SITZSYSTEME",

  // Große Überschrift. Das Wort in farbiger Schrift steht separat darunter.
  titel: "Überzeugungs-",
  titelFarbig: "Simulator",

  // Beschreibungstext unter der Überschrift:
  beschreibung:
    "Überzeuge drei Schlüsselpersonen von Kronberg Sitzsysteme, bei „Projekt Fokus26\" mitzuwirken. Setze die 10 Überzeugungstechniken aus Session 6 gezielt ein.",

  // Erklärkasten unten auf der Startseite:
  anleitung:
    "1. Wähle eine Kronberg-Person · 2. Führe das Überzeugungsgespräch (Fokus26) · 3. Klicke „Gespräch auswerten\" für dein Feedback zu Überzeugungstechniken & Kommunikation",

  // Fußzeile:
  fusszeile: "Hochschule München · PE/OE · Powered by Claude"
};


// ───────────────────────────────────────────────────────────────────────────
// 3) STANDARD-KI-ANBIETER  (Vorauswahl im Begrüßungsfenster)
// ───────────────────────────────────────────────────────────────────────────
// Mögliche Werte: "anthropic", "openai", "gemini", "mistral"
export const STANDARD_ANBIETER = "anthropic";

// Standard-Modell (leer lassen "" für das Standardmodell des Anbieters,
// oder z.B. "claude-haiku-4-5-20251001" eintragen).
export const STANDARD_MODELL = "";


// ───────────────────────────────────────────────────────────────────────────
// 4) FARBEN DER SCHWIERIGKEITSGRADE
// ───────────────────────────────────────────────────────────────────────────
// Farben im Format "#RRGGBB". Nur ändern, wenn gewünscht.
export const SCHWIERIGKEITS_FARBEN = {
  Leicht: "#00A878",   // grün
  Mittel: "#FF6B35",   // orange
  Schwer: "#E63946"    // rot
};


// ╔═══════════════════════════════════════════════════════════════════════╗
// ║  WEITERE EINSTELLUNGEN IN ANDEREN DATEIEN (mit Editor öffnen):          ║
// ║                                                                         ║
// ║  • Die 3 Personen / Charaktere / Bewertung ....... src/personas.js      ║
// ║      -> dort: name, role, description, goal, difficulty,                ║
// ║         systemPrompt (Charakter) und evaluatorKey (Bewertung)           ║
// ║                                                                         ║
// ║  • Globale Zusatz-Anweisungen für alle Personen .. src/personas.js      ║
// ║      -> ganz unten: DEFAULT_GLOBAL_INSTRUCTIONS                         ║
// ║                                                                         ║
// ║  • Kursinhalte für die Auswertung (10 Techniken) . src/courseContent.js ║
// ║      -> dort: COURSE_CONTEXT                                            ║
// ║                                                                         ║
// ║  Tipp: Vieles davon lässt sich auch ohne Code direkt in der App im      ║
// ║  Admin-Bereich ändern (PIN oben eingeben). Diese Änderungen gelten      ║
// ║  aber nur vorübergehend; dauerhaft = hier im Code ändern.               ║
// ╚═══════════════════════════════════════════════════════════════════════╝
