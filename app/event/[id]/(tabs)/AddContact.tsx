import { useEffect, useState } from 'react';
import { View, FlatList, Text } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { db } from '@/lib/db';
import SnackbarMessage from '../../components/SnackbarMessage';
import { Contact } from '@/lib/types';
import { useLocalSearchParams } from 'expo-router';

export default function AddContact() {
  const { eventId } = useLocalSearchParams();
  const eventIdNumber = Number(eventId);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');

  const loadContacts = () => {
    const result = db.getAllSync<Contact>(
      'SELECT * FROM contacts WHERE event_id = ? ORDER BY id DESC;',
      [eventIdNumber]
    );
    setContacts(result);
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const addContact = () => {
    if (!name.trim()) {
      setSnackbarMsg('Name is required');
      setSnackbarVisible(true);
      return;
    }

    db.runSync(
      'INSERT INTO contacts (event_id, name, phone, note) VALUES (?, ?, ?, ?)',
      [eventIdNumber, name, phone, note]
    );

    setName('');
    setPhone('');
    setNote('');
    loadContacts();

    setSnackbarMsg('Contact added');
    setSnackbarVisible(true);
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <TextInput
        label="Name"
        value={name}
        onChangeText={setName}
        style={{ marginBottom: 12 }}
      />
      <TextInput
        label="Phone"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        style={{ marginBottom: 12 }}
      />
      <TextInput
        label="Note"
        value={note}
        onChangeText={setNote}
        style={{ marginBottom: 12 }}
      />
      <Button mode="contained" onPress={addContact}>
        Add Contact
      </Button>

      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View
            style={{
              paddingVertical: 8,
              borderBottomWidth: 1,
              borderBottomColor: '#eee',
            }}
          >
            <Text>
              {item.name} {item.phone ? `- ${item.phone}` : ''}
            </Text>
          </View>
        )}
        style={{ marginTop: 16 }}
      />

      <SnackbarMessage
        visible={snackbarVisible}
        message={snackbarMsg}
        onDismiss={() => setSnackbarVisible(false)}
      />
    </View>
  );
}
