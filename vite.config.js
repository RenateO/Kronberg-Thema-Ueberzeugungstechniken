import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Fuer GitHub Pages laeuft die App unter https://USER.github.io/REPONAME/
// Daher muss "base" auf "/REPONAME/" gesetzt werden.
// Wird ueber die Umgebungsvariable VITE_BASE gesteuert (vom GitHub-Workflow gesetzt).
// Fuer Vercel oder lokale Nutzung bleibt base "/".
export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
})
