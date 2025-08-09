import { renderHook } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const client = new QueryClient();
  return <QueryClientProvider client={client}><AuthProvider>{children}</AuthProvider></QueryClientProvider>;
};

describe('useAuth', () => {
  beforeEach(() => {
    vi.spyOn(window.localStorage.__proto__ as any, 'getItem').mockImplementation(() => null);
    vi.spyOn(window.localStorage.__proto__ as any, 'setItem').mockImplementation(() => {});
    vi.spyOn(window.localStorage.__proto__ as any, 'removeItem').mockImplementation(() => {});
  });

  it('initializes unauthenticated by default', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.isAuthenticated).toBe(false);
  });
});


