import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { db, initDb } from '@/lib/db';
import { IconButton, Provider as PaperProvider } from 'react-native-paper';
import { Contact, Event } from '@/lib/types';
import { handleShareContacts } from '@/lib/vcard';
import ExportButtons from './event/components/ExportButtons';
import { StatusBar } from 'react-native';

export default function RootLayout() {
  useEffect(() => {
    initDb();
  }, []);

  return (
    <PaperProvider>
      <StatusBar barStyle="dark-content" />
      <Stack>
        <Stack.Screen
          name="index"
          options={{ title: 'Home', animation: 'none' }}
        />
        <Stack.Screen
          name="event/[id]"
          options={({ route }) => {
            // route.params.id comes as string
            const params = route.params as { id: string } | undefined;
            const eventId = params ? Number(params.id) : undefined;
            let title = 'Event Details';
            let event: Event;
            let contacts: Contact[] = [];

            if (eventId) {
              try {
                event =
                  db.getFirstSync<Event>(
                    'SELECT name FROM events WHERE id = ?',
                    [eventId]
                  ) ?? ({ id: eventId, name: 'Unknown Event' } as Event);
                contacts = db.getAllSync<Contact>(
                  'SELECT * FROM contacts WHERE event_id = ? ORDER BY id DESC;',
                  [eventId]
                );
                if (event) title = event.name;
              } catch {
                throw new Error('Event not found');
              }
            }

            return {
              title,
              animation: 'slide_from_right',
              headerRight: () => (
                <ExportButtons eventName={event.name} contacts={contacts} />
              ),
            };
          }}
        />
      </Stack>
    </PaperProvider>
  );
}
