import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, FlatList, Alert } from 'react-native';
import { db } from '@/lib/db';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Text, TextInput, Button, Card, Snackbar } from 'react-native-paper';

export default function EventPage() {
  const { id } = useLocalSearchParams();
  const eventId = Number(id);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [contacts, setContacts] = useState<any[]>([]);
  const [eventName, setEventName] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');

  function loadContacts() {
    const result = db.getAllSync(
      'SELECT * FROM contacts WHERE event_id = ? ORDER BY id DESC;',
      [eventId]
    );
    setContacts(result);

    const event: EventType = db.getFirstSync(
      'SELECT name FROM events WHERE id = ?;',
      [eventId]
    );
    if (event) setEventName(event.name);
  }

  function addContact() {
    if (!name.trim() || !phone.trim()) return;
    db.runSync(
      'INSERT INTO contacts (event_id, name, phone, note) VALUES (?, ?, ?, ?);',
      [eventId, name, phone, note]
    );
    setName('');
    setPhone('');
    setNote('');
    loadContacts();
  }

  function buildVCard(contacts: any[]) {
    let vcard = '';
    contacts.forEach((c) => {
      vcard += `BEGIN:VCARD\nVERSION:3.0\nFN:${c.name}\nTEL;TYPE=CELL:${c.phone}\n`;
      if (c.note) vcard += `NOTE:${c.note}\n`;
      vcard += 'END:VCARD\n';
    });
    return vcard;
  }

  async function saveVCardFile(eventName: string, contacts: any[]) {
    if (!contacts.length) {
      Alert.alert('No contacts', 'There are no contacts to export.');
      return null;
    }

    const vcard = buildVCard(contacts);
    const safeName = (eventName || 'event').replace(/[^a-z0-9_.-]/gi, '_');
    const filename = `${safeName}-contacts.vcf`;

    const file = new File(Paths.document, filename);

    try {
      if (file.exists) file.delete();
    } catch {}

    file.create();
    file.write(vcard);

    return file.uri;
  }

  // 👉 Share button
  async function handleShareContacts(eventName: string, contacts: any[]) {
    try {
      const fileUri = await saveVCardFile(eventName, contacts);
      if (!fileUri) return;

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert('Not supported', `File saved at: ${fileUri}`);
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to share contacts.');
    }
  }

  // 👉 Download button
  async function handleDownloadContacts(eventName: string, contacts: any[]) {
    try {
      const fileUri = await saveVCardFile(eventName, contacts);
      if (fileUri) {
        setSnackbarMsg(`Saved to: ${fileUri}`);
        setSnackbarVisible(true);
      }
    } catch (err) {
      console.error(err);
      setSnackbarMsg('Failed to download contacts.');
      setSnackbarVisible(true);
    }
  }

  useEffect(() => {
    loadContacts();
  }, []);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text variant="titleLarge" style={{ marginBottom: 12 }}>
        Add Contact
      </Text>
      <TextInput
        label="Name"
        value={name}
        onChangeText={setName}
        style={{ marginBottom: 8 }}
      />
      <TextInput
        label="Phone"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        style={{ marginBottom: 8 }}
      />
      <TextInput
        label="Note (optional)"
        value={note}
        onChangeText={setNote}
        style={{ marginBottom: 8 }}
      />
      <Button
        mode="contained"
        onPress={addContact}
        style={{ marginBottom: 16 }}
      >
        Save Contact
      </Button>

      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          marginBottom: 8,
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <View></View>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 5,
          }}
        >
          <Button
            mode="contained-tonal"
            onPress={() => handleShareContacts(eventName, contacts)}
          >
            Share
          </Button>

          <Button
            mode="contained-tonal"
            onPress={() => handleDownloadContacts(eventName, contacts)}
          >
            Download
          </Button>
        </View>
      </View>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={4000}
        action={{
          label: 'Close',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMsg}
      </Snackbar>

      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Card style={{ marginBottom: 8 }}>
            <Card.Title title={item.name} subtitle={item.phone} />
            {item.note ? (
              <Card.Content>
                <Text>{item.note}</Text>
              </Card.Content>
            ) : null}
          </Card>
        )}
      />
    </View>
  );
}
