# Kronberg Überzeugungs-Simulator (PE/OE Aufgabe 2)

Chatbot-Plattform für die Case Study Kronberg Sitzsysteme. Studierende überzeugen
3 OEM-Schlüsselpersonen, bei „Projekt Fokus26" mitzuwirken, und erhalten eine
differenzierte Auswertung (Session 6 Überzeugungstechniken + Session 2 Kommunikation).

---

## Inhaltsverzeichnis
1. Was die App kann
2. Voraussetzungen (einmalig)
3. Schritt-für-Schritt: Deployment auf Vercel
4. Festen KI-Key hinterlegen (Kursbetrieb)
5. Code ändern und ins Repository pushen
6. Was wo im Code steht
7. Lokal testen (optional)
8. Häufige Probleme

---

## 1. Was die App kann

- 3 Kronberg-Personas (CTO Dr. Gaurav, COO Weller, Vertrieb Hartmann), die realistisch
  auf die 10 Überzeugungstechniken reagieren.
- Button „Gespräch auswerten": differenzierte Bewertung (Score 0-100, erkannte Techniken,
  Kommunikations-Check, Verbesserungsvorschläge).
- Admin Panel (PIN, Standard `1234`) zum Bearbeiten der Personas & Bewertungsschlüssel.
- Zwei Key-Modi: fester Key im Backend ODER eigener Key pro Nutzer.

---

## 2. Voraussetzungen (einmalig)

Du brauchst drei kostenlose Dinge:

1. GitHub-Konto - https://github.com/signup
2. Vercel-Konto - https://vercel.com/signup (am einfachsten "Continue with GitHub")
3. Git auf dem PC installiert - https://git-scm.com/downloads
   (Prüfen mit: `git --version` im Terminal/PowerShell)

Optional, je nach gewünschtem KI-Anbieter, ein API-Key:
- Anthropic: https://console.anthropic.com
- OpenAI: https://platform.openai.com/api-keys
- Google Gemini (kostenloses Kontingent): https://aistudio.google.com/app/apikey
- Mistral: https://console.mistral.ai/api-keys

---

## 3. Schritt-für-Schritt: Deployment auf Vercel

### 3.1 Code in ein GitHub-Repository bringen

Falls der Code noch nicht auf GitHub liegt:

1. Auf github.com einloggen -> oben rechts "+" -> "New repository"
2. Namen vergeben (z. B. `kronberg-simulator`), Private oder Public wählen,
   NICHT "Add a README" ankreuzen -> "Create repository"
3. GitHub zeigt nun eine URL wie `https://github.com/DEINNAME/kronberg-simulator.git`.
   Diese gleich kopieren.

Dann im Terminal/PowerShell, im Ordner mit dem entpackten Projekt
(dort wo `package.json` liegt):

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/DEINNAME/kronberg-simulator.git
git push -u origin main
```

Nach dem Refresh sollten auf GitHub `package.json`, `index.html` und der `src`-Ordner
im Hauptverzeichnis liegen (NICHT in einem Unterordner - siehe Problem-Abschnitt).

### 3.2 Mit Vercel verbinden und deployen

1. Auf https://vercel.com einloggen
2. "Add New..." -> "Project"
3. Bei "Import Git Repository" das eben erstellte Repo auswählen -> "Import"
4. Vercel erkennt automatisch Vite. Die Voreinstellungen passen:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
5. (Optional) Environment Variables für einen festen Key setzen -> siehe Abschnitt 4.
6. "Deploy" klicken.

Nach ca. 1 Minute ist die App live unter einer URL wie
`https://kronberg-simulator.vercel.app`. Diese Adresse kann geteilt werden.

> Ab jetzt deployt Vercel automatisch neu, sobald etwas nach `main` gepusht wird.

---

## 4. Festen KI-Key hinterlegen (Kursbetrieb)

Damit Studierende keinen eigenen Key eingeben müssen, einen zentralen Key hinterlegen:

1. Vercel -> das Projekt öffnen -> Settings -> Environment Variables
2. Diese Variablen anlegen (jeweils "Add another"):

   | Name (Key)            | Value (Beispiel)                       |
   |-----------------------|----------------------------------------|
   | VITE_FIXED_PROVIDER   | anthropic                              |
   | VITE_FIXED_API_KEY    | sk-ant-... (der echte Key)             |
   | VITE_FIXED_MODEL      | claude-haiku-4-5-20251001 (optional)   |

   Mögliche Werte für VITE_FIXED_PROVIDER: anthropic, openai, gemini, mistral.

3. WICHTIG: Environment Variables greifen erst nach einem neuen Deploy.
   -> Tab Deployments -> beim obersten Eintrag das "..."-Menü -> Redeploy.

Danach wird der Anbieter-Auswahlbildschirm übersprungen und alle nutzen diesen Key.
Zum Zurückschalten auf "eigener Key pro Nutzer": die drei Variablen löschen + Redeploy.

---

## 5. Code ändern und ins Repository pushen

Der typische Ablauf, wenn ihr etwas ändert (z. B. eine Persona anpasst):

### 5.1 Aktuellen Stand holen (falls im Team gearbeitet wird)
```bash
git pull
```

### 5.2 Dateien ändern
Mit einem Editor (z. B. VS Code) die gewünschte Datei bearbeiten, z. B.
`src/personas.js`. Speichern.

### 5.3 Änderungen ansehen (optional)
```bash
git status        # zeigt geänderte Dateien
git diff          # zeigt die konkreten Änderungen
```

### 5.4 Änderungen committen und pushen
```bash
git add .
git commit -m "Persona Dr. Gaurav natürlicher formuliert"
git push
```

Sekunden später startet Vercel automatisch ein neues Deployment. Im Vercel-Dashboard
unter Deployments lässt sich der Fortschritt verfolgen. Nach ~1 Minute ist die
Änderung live unter derselben URL.

### 5.5 Kurzreferenz der wichtigsten git-Befehle
```bash
git status                       # Was hat sich geändert?
git add .                        # Alle Änderungen vormerken
git add src/personas.js          # Nur eine bestimmte Datei vormerken
git commit -m "Beschreibung"     # Änderungen mit Nachricht festhalten
git push                         # Zu GitHub hochladen -> löst Vercel-Deploy aus
git pull                         # Änderungen anderer herunterladen
git log --oneline                # Verlauf der Commits ansehen
```

---

## 6. Was wo im Code steht

| Datei                  | Inhalt / was man hier ändert                                    |
|------------------------|-----------------------------------------------------------------|
| src/personas.js        | Die 3 Personas: systemPrompt (Charakter) und evaluatorKey (Bewertung). |
| src/personas.js (unten)| DEFAULT_GLOBAL_INSTRUCTIONS: Zusatz-Regeln fuer ALLE Personas (z.B. Charakter nicht zu offensichtlich preisgeben). Auch live im Admin Panel unter 'Zusatz-Anweisungen'. |
| src/courseContent.js   | Kursinhalte (10 Techniken, 7 Tipps, Case-Kontext) fürs Feedback. |
| src/providers.js       | KI-Anbieter, Modelle, Backend-Key-Logik.                        |
| src/App.jsx            | Oberfläche, Chat, Auswertung, Admin Panel. PIN: const ADMIN_PIN. |

Personas lassen sich auch ohne Code live im Admin Panel ändern (PIN auf Startseite
eingeben). Solche Live-Änderungen gelten aber nur im aktuellen Browser und sind nach
einem Reload weg - für dauerhafte Änderungen den Text in src/personas.js eintragen
und pushen (Abschnitt 5).

---

## 7. Lokal testen (optional)

Vor dem Pushen kann man alles auf dem eigenen PC ausprobieren:

```bash
npm install      # einmalig, lädt Abhängigkeiten
npm run dev      # startet lokalen Server, meist http://localhost:5173
```

Im Browser öffnen, testen. Beenden mit Strg + C im Terminal.
Für einen Produktions-Testbuild:
```bash
npm run build    # erstellt den dist-Ordner wie bei Vercel
```

---

---

## 9. Alternative: Deployment auf GitHub Pages (kostenlos, ohne Vercel)

GitHub Pages ist eine kostenlose Hosting-Option direkt von GitHub. Wichtig:
GitHub Pages ist rein statisch und unterstuetzt KEINE Environment Variables.
Das heisst: Ein fester zentraler Key ist hier NICHT moeglich (er waere im
oeffentlichen Code sichtbar). Auf GitHub Pages gibt darum JEDER Nutzer seinen
eigenen Key ein (Setup-Screen). Fuer einen festen zentralen Key bitte Vercel
nutzen (Abschnitt 4).

### 9.1 Einrichtung (einmalig)

1. Code wie in Abschnitt 3.1 zu GitHub pushen.
2. Auf GitHub: Repo -> Settings -> Pages.
3. Unter "Build and deployment" -> "Source" -> "GitHub Actions" auswaehlen.
   (NICHT "Deploy from a branch".)
4. Fertig. Der mitgelieferte Workflow (.github/workflows/deploy.yml) baut die App
   automatisch und setzt den Pfad korrekt auf den Repo-Namen.

### 9.2 Deployen

Einfach pushen:
```bash
git add .
git commit -m "Deploy"
git push
```
Unter Repo -> Actions sieht man den Build laufen. Nach ~1-2 Minuten ist die App live unter:
```
https://DEINNAME.github.io/REPONAME/
```
Die genaue URL steht auch unter Settings -> Pages.

### 9.3 Aktualisieren
Genau wie bei Vercel: aendern, committen, `git push`. Der Workflow deployt automatisch neu.

### 9.4 Hinweis zum Pfad
Der Workflow setzt den Basis-Pfad automatisch auf den Repo-Namen. Falls die Seite
weiss/leer bleibt: pruefen ob unter Settings -> Pages als Source wirklich
"GitHub Actions" gewaehlt ist, und ob der Action-Build gruen durchgelaufen ist.

---

## 8. Häufige Probleme

404 NOT_FOUND nach dem Deploy
Die Projektdateien liegen in einem Unterordner statt im Repo-Hauptverzeichnis.
Entweder die Dateien eine Ebene hochziehen, oder in Vercel unter
Settings -> Build & Deployment -> Root Directory den Unterordner angeben.
Im Hauptverzeichnis müssen package.json und index.html direkt liegen.

"Kein API-Key gefunden" / Fehler beim Laden der Antwort
Entweder kein eigener Key eingegeben (Setup-Screen erscheint beim ersten Start),
oder fester Key gesetzt aber Redeploy vergessen (Abschnitt 4, Schritt 3).
Bei Fehler 429: Rate Limit erreicht, kurz warten (v. a. beim Gemini-Free-Tier).

git push fragt nach Login
GitHub verlangt statt Passwort einen Personal Access Token. Unter
github.com -> Settings -> Developer settings -> Personal access tokens generieren
und als Passwort verwenden. Alternativ GitHub Desktop nutzen (grafisch, ohne Terminal):
https://desktop.github.com

Änderung ist nicht live
Prüfen ob git push erfolgreich war und ob im Vercel-Dashboard unter Deployments
ein neuer Build läuft/erfolgreich war. Browser-Cache per Strg+F5 leeren.
