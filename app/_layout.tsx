import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { db, initDb } from '@/lib/db';
import { Provider as PaperProvider } from 'react-native-paper';
import { Event } from '@/lib/types';

export default function RootLayout() {
  useEffect(() => {
    initDb();
  }, []);

  return (
    <PaperProvider>
      <Stack>
        <Stack.Screen
          name="index"
          options={{ title: 'Home', animation: 'none' }}
        />
        <Stack.Screen
          name="event/[id]/(tabs)"
          options={({ route }) => {
            // route.params.id comes as string
            const params = route.params as { id: string } | undefined;
            const eventId = params ? Number(params.id) : undefined;
            let title = 'Event Details';

            if (eventId) {
              try {
                const event = db.getFirstSync<Event>(
                  'SELECT name FROM events WHERE id = ?',
                  [eventId]
                );
                if (event) title = event.name;
              } catch {}
            }

            return {
              title,
              animation: 'slide_from_right',
            };
          }}
        />
      </Stack>
    </PaperProvider>
  );
}
