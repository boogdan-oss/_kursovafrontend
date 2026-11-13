import '@testing-library/jest-dom/vitest'

class MemoryStorage implements Storage {
  private items = new Map<string, string>()

  get length() {
    return this.items.size
  }

  clear() {
    this.items.clear()
  }

  getItem(key: string) {
    return this.items.get(key) ?? null
  }

  key(index: number) {
    return [...this.items.keys()][index] ?? null
  }

  removeItem(key: string) {
    this.items.delete(key)
  }

  setItem(key: string, value: string) {
    this.items.set(key, String(value))
  }
}

if (typeof globalThis.localStorage?.setItem !== 'function') {
  vi.stubGlobal('localStorage', new MemoryStorage())
}

if (typeof globalThis.sessionStorage?.setItem !== 'function') {
  vi.stubGlobal('sessionStorage', new MemoryStorage())
}

vi.mock('lightweight-charts', () => {
  const series = { setData: vi.fn() }
  const chart = {
    addSeries: vi.fn(() => series),
    removeSeries: vi.fn(),
    remove: vi.fn(),
    timeScale: () => ({ fitContent: vi.fn() }),
  }
  return {
    createChart: vi.fn(() => chart),
    LineSeries: 'Line',
    ColorType: { Solid: 'solid' },
  }
})

if (typeof globalThis.ResizeObserver === 'undefined') {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  vi.stubGlobal('ResizeObserver', ResizeObserverStub)
}
