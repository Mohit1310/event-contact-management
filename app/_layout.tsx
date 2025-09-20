import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { initDb } from '../lib/db';
import { Provider as PaperProvider } from 'react-native-paper';

export default function RootLayout() {
  useEffect(() => {
    initDb();
  }, []);

  return (
    <PaperProvider>
      <Stack />
    </PaperProvider>
  );
}
