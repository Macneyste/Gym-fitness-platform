/* global jest */
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
// expo-sqlite's localStorage polyfill needs the native module; Supabase is unconfigured in tests anyway.
jest.mock('expo-sqlite/localStorage/install', () => ({}));
