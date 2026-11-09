import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Relative assets work on both GitHub Pages /qimen/ and 7men.puwa.online/.
  base: './',
})
