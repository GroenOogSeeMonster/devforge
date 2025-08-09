import '@testing-library/jest-dom/vitest';

// Mock ResizeObserver for RTL + Monaco + resizable panels
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// @ts-ignore
global.ResizeObserver = ResizeObserverMock;


