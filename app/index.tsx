import { useEffect, useState } from 'react';
import { FlatList, View } from 'react-native';
import { db } from '@/lib/db';
import {
  FAB,
  Text,
  Portal,
  Dialog,
  Button,
  TextInput,
} from 'react-native-paper';
import { useRouter } from 'expo-router';

export default function Home() {
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [visible, setVisible] = useState(false);
  const [eventName, setEventName] = useState('');

  function loadEvents() {
    const result = db.getAllSync(
      'SELECT * FROM events ORDER BY created_at DESC;'
    );
    setEvents(result);
  }

  function addEvent() {
    if (!eventName.trim()) return;
    db.runSync('INSERT INTO events (name) VALUES (?);', [eventName]);
    setEventName('');
    setVisible(false);
    loadEvents();
  }

  useEffect(() => {
    loadEvents();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Text
            style={{ padding: 16, fontSize: 18 }}
            onPress={() => router.push(`/event/${item.id}`)}
          >
            {item.name}
          </Text>
        )}
      />

      <Portal>
        <Dialog visible={visible} onDismiss={() => setVisible(false)}>
          <Dialog.Title>New Event</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Event Name"
              value={eventName}
              onChangeText={setEventName}
              autoFocus={true}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setVisible(false)}>Cancel</Button>
            <Button onPress={addEvent}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <FAB
        icon="plus"
        style={{ position: 'absolute', bottom: 20, right: 20 }}
        onPress={() => setVisible(true)}
      />
    </View>
  );
}
