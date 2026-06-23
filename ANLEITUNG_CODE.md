# 🛠️ Wo ändere ich was? — Übersicht für Anpassungen

Diese Übersicht zeigt, in welcher Datei welche Inhalte stehen. Alle Dateien liegen
im Ordner `src/`. Sie können sie mit einem Texteditor (z. B. VS Code) oder direkt
auf GitHub über das Stift-Symbol öffnen.

> **Grundregel:** Ändern Sie nur Text zwischen Anführungszeichen `"..."` oder
> zwischen den schrägen Backticks `` `...` ``. Kommas, Klammern und Schlüsselwörter
> bitte stehen lassen. Nach dem Ändern speichern und hochladen (siehe README).

---

## Schnellübersicht

| Was Sie ändern möchten | Datei | Worauf achten |
|---|---|---|
| **Admin-Passwort (PIN)** | `src/EINSTELLUNGEN.js` | Zeile `ADMIN_PIN = "1234"` |
| **Texte der Startseite** (Titel, Beschreibung, Fußzeile) | `src/EINSTELLUNGEN.js` | Block `APP_TEXTE` |
| **Standard-KI-Anbieter & -Modell** | `src/EINSTELLUNGEN.js` | `STANDARD_ANBIETER`, `STANDARD_MODELL` |
| **Farben der Schwierigkeitsgrade** | `src/EINSTELLUNGEN.js` | Block `SCHWIERIGKEITS_FARBEN` |
| **Die 3 Personen / Charaktere** | `src/personas.js` | Liste `SCENARIOS` |
| **Charakter-Text einer Person** (wie sie spricht/reagiert) | `src/personas.js` | Feld `systemPrompt` der jeweiligen Person |
| **Bewertungs-Vorgaben einer Person** | `src/personas.js` | Feld `evaluatorKey` der jeweiligen Person |
| **Globale Regel für alle Personen** (z. B. „Charakter nicht verraten") | `src/personas.js` | `DEFAULT_GLOBAL_INSTRUCTIONS` (ganz unten) |
| **Kursinhalte für die Auswertung** (10 Techniken etc.) | `src/courseContent.js` | `COURSE_CONTEXT` |
| **KI-Anbieter / API-Keys** | `src/providers.js` | Normalerweise nichts ändern |

---

## 1. Passwort, Texte, Standard-Anbieter, Farben → `src/EINSTELLUNGEN.js`

Das ist die **wichtigste Datei für einfache Anpassungen**. Ganz oben steht ein
großer Kommentar-Block, der jede Einstellung erklärt. Beispiele:

- **PIN ändern:** `export const ADMIN_PIN = "1234";` → die `1234` ersetzen.
- **Titel ändern:** im Block `APP_TEXTE` die Felder `titel`, `titelFarbig`,
  `beschreibung` usw. anpassen.
- **Standard-Anbieter:** `export const STANDARD_ANBIETER = "anthropic";`
  (mögliche Werte: `"anthropic"`, `"openai"`, `"gemini"`, `"mistral"`).

---

## 2. Die Personen / Charaktere → `src/personas.js`

Oben in der Datei erklärt ein Kommentar-Block jedes Feld. Jede Person ist ein
Abschnitt in geschweiften Klammern `{ ... }`. Die zwei wichtigsten Felder:

- **`systemPrompt`** — bestimmt den Charakter: Hintergrund, Ängste, Ziele und
  wie die Person auf Überzeugungsversuche reagiert. Das ist der Text, der das
  Gespräch prägt.
- **`evaluatorKey`** — sagt der Auswertung, welche Techniken zu dieser Person
  passen und was „Erfolg" heißt (für Studierende unsichtbar).

Den Text finden Sie jeweils zwischen schrägen Backticks `` `...` ``.

---

## 3. Globale Zusatz-Anweisung → `src/personas.js` (unten)

Ganz unten in derselben Datei steht `DEFAULT_GLOBAL_INSTRUCTIONS`. Dieser Text
gilt für **alle** Personen gleichzeitig. Hier ist z. B. festgelegt, dass die
Personen ihren Charakter nicht zu offensichtlich preisgeben sollen.

---

## 4. Kursinhalte der Auswertung → `src/courseContent.js`

Der Text `COURSE_CONTEXT` ist die Grundlage, nach der die KI das Gespräch
bewertet (die 10 Techniken, die 7 Tipps, der Fall-Kontext). Anpassen, wenn sich
die Kursinhalte ändern.

---

## 5. Live im Browser ändern (ohne Code)

Vieles geht auch ohne Datei-Bearbeitung: Auf der Startseite die **Admin-PIN**
eingeben. Im Admin-Bereich lassen sich Personen und die globale Zusatz-Anweisung
direkt bearbeiten. **Achtung:** Diese Änderungen gelten nur vorübergehend im
aktuellen Browser und sind nach dem Neuladen weg. Für **dauerhafte** Änderungen
müssen die Dateien oben angepasst werden.

---

## 6. API-Keys → siehe separate PDF-Anleitung

Wie man einen Claude-API-Schlüssel erstellt und Guthaben auflädt, steht in der
PDF „Anleitung_Claude_API_Key". Wo der Schlüssel eingegeben wird, erklärt die
Datei `src/providers.js` im Kommentar-Block oben.
