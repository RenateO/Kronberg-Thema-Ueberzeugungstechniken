// ╔═══════════════════════════════════════════════════════════════════════╗
// ║  📊  KURSINHALTE FÜR DIE AUSWERTUNG  —  HIER DIE BEWERTUNGSBASIS ÄNDERN ║
// ║                                                                         ║
// ║  Dieser Text (COURSE_CONTEXT) wird bei jeder "Gespräch auswerten"-      ║
// ║  Bewertung an die KI mitgeschickt. Er enthält die 10 Überzeugungs-      ║
// ║  techniken, die 7 Tipps und den Fall-Kontext. Passen Sie ihn an, wenn   ║
// ║  sich Kursinhalte ändern. Text steht zwischen den Backticks ` ... `.    ║
// ╚═══════════════════════════════════════════════════════════════════════╝

export const COURSE_CONTEXT = `
KURSINHALTE PE/OE (Session 2 & 6) — verbindliche Bewertungsgrundlage:

DIE 10 ÜBERZEUGUNGSTECHNIKEN (eingeteilt in Push / Push-Pull / Pull):
PUSH (drücken):
- Druck: Konsequenzen/Sanktionen nennen.
- Autorität: Legitimation von oben nutzen (z.B. CEO-Auftrag, Hierarchie).
- Rationale Überzeugung: logisch mit Fakten, Zahlen, Daten argumentieren.
PUSH/PULL:
- Tauschgeschäft: Geben und Nehmen ("Du gibst X, wir liefern Y").
- Koalition: Netzwerke/Verbündete einbinden.
- Selbstbild: an das Bedürfnis appellieren, konsistent/öffentlich gut dazustehen.
PULL (ziehen):
- Appell an Werte: an die Werte des Gegenübers appellieren.
- Persönlicher Appell: um einen persönlichen Gefallen bitten.
- Konsultation: das Gegenüber um Rat/Feedback/Mitgestaltung bitten.
- Rollenvorbild: durch eigenes Handeln vorleben.

7 TIPPS ZUM ERFOLGREICHEN ÜBERZEUGEN:
1. Bezugsrahmen des anderen verstehen (Eisberg-Modell: Ziele, Werte, Bedürfnisse, Ängste unter der Oberfläche).
2. Aktiv zuhören.
3. Wertschätzung zeigen.
4. Gemeinsamkeiten herausarbeiten.
5. Lösungsorientiert denken.
6. Mit PULL-Techniken STARTEN und erst später (falls nötig) zu Push eskalieren.
7. Eigenes Technik-Spektrum erweitern (nicht nur 1 Technik nutzen).

VERTRAUEN (4 Komponenten): Glaubwürdigkeit, Verlässlichkeit, Offenheit, niedrige Selbstorientierung.

INTEGER ÜBERZEUGEN vs. MANIPULIEREN: lautere Absichten + langfristige Beziehung
statt Instrumentalisierung für kurzfristigen Gewinn.

CASE-KONTEXT: Kronberg Sitzsysteme GmbH, familiengeführter Tier-1 Automobilzulieferer (Ingolstadt,
1.500 MA, Sitze für Audi/BMW/Mercedes). EBIT gesunken (20→18→13 Mio.€), OEM-Strafen gestiegen
(10 Mio.€ 2024), Materialkosten +21%. "Projekt Fokus26": EBIT bis 2028 auf 26 Mio.€ verdoppeln.
Der Studierende spielt einen internen Projektleiter (KEINE disziplinarische Macht über die Person),
der die Person überzeugen will, bei Fokus26 mitzuwirken.
`;

export const TECHNIQUES = [
  "Druck", "Autorität", "Rationale Überzeugung", "Tauschgeschäft", "Koalition",
  "Selbstbild", "Appell an Werte", "Persönlicher Appell", "Konsultation", "Rollenvorbild"
];
