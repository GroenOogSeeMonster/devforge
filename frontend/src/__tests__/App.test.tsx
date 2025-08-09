import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '@/App';

const viAny: any = (globalThis as any).vi || (globalThis as any);
viAny.stubGlobal?.('localStorage', {
  getItem: vi.fn(() => null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
});

describe('App routing', () => {
  it('redirects to login when not authenticated', async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    );

    expect(await screen.findByText(/welcome back/i)).toBeTruthy();
  });
});


