import { renderRouter, screen, waitFor } from 'expo-router/testing-library';

jest.setTimeout(120_000);

/**
 * Boots the real `src/app` directory (root layout with fonts, splash and
 * providers). Run on both platforms: `npm test` (iOS) and `npm run test:android`.
 * Guards against native modules that crash the app at import time.
 */
it('boots the real app and lands on Welcome', async () => {
  const errors: unknown[][] = [];
  const spy = jest.spyOn(console, 'error').mockImplementation((...args) => {
    errors.push(args);
  });
  try {
    await renderRouter('./src/app', { initialUrl: '/' }); // resolved from the project root
    await waitFor(() => expect(screen).toHavePathname('/welcome'), { timeout: 20_000 });
    expect(screen.getByText('Bilow hadda')).toBeTruthy();
    expect(errors).toEqual([]);
  } finally {
    spy.mockRestore();
  }
});
