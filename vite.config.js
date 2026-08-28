import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/lifarobots/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/teste/preparo.js'],
    globals: true,
    include: ['src/**/*.teste.{js,jsx}'],
  },
})
