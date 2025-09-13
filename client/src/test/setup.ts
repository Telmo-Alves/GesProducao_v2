// Client test setup for Vitest (jsdom)
// Add any global test setup here. Keep lightweight by default.

// Extend expect with jest-dom matchers
import '@testing-library/jest-dom/vitest'

// Example: mock base URL if needed
// Object.defineProperty(window, 'importMetaEnv', { value: { VITE_API_URL: 'http://localhost:3001/api' } });
