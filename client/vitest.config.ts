import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.ts?(x)'],
    css: true,
    coverage: {
      reporter: ['text', 'lcov'],
      reportsDirectory: './coverage'
    }
  }
})

