import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/r4r-bathrooms/',
  server: {
    historyApiFallback: true,
  },
})
