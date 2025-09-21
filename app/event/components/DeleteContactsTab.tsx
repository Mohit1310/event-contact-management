import { useEffect, useState } from 'react';
import { FlatList, View } from 'react-native';
import { List, Checkbox, Button, IconButton } from 'react-native-paper';
import { db } from '@/lib/db';
import SnackbarMessage from './SnackbarMessage';
import { Contact } from '@/lib/types';

export default function DeleteContactsTab({ eventId }: { eventId: number }) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');

  const loadContacts = () => {
    const result = db.getAllSync<Contact>(
      'SELECT * FROM contacts WHERE event_id = ? ORDER BY id DESC;',
      [eventId]
    );
    setContacts(result);
    setSelectedIds([]);
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const toggleSelect = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((cid) => cid !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const deleteContacts = (ids: number[]) => {
    if (!ids.length) return;
    db.runSync(
      `DELETE FROM contacts WHERE id IN (${ids.map(() => '?').join(',')});`,
      ids
    );
    loadContacts();
    setSnackbarMsg(`${ids.length} contact(s) deleted`);
    setSnackbarVisible(true);
  };

  const renderItem = ({ item }: { item: Contact }) => (
    <List.Item
      title={item.name}
      description={item.phone || undefined}
      left={() => (
        <Checkbox
          status={selectedIds.includes(item.id) ? 'checked' : 'unchecked'}
          onPress={() => toggleSelect(item.id)}
        />
      )}
      right={() => (
        <IconButton icon="delete" onPress={() => deleteContacts([item.id])} />
      )}
    />
  );

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListHeaderComponent={
          contacts.length ? (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 8,
              }}
            >
              <Button onPress={() => setSelectedIds(contacts.map((c) => c.id))}>
                Select All
              </Button>
              <Button
                onPress={() => deleteContacts(selectedIds)}
                disabled={!selectedIds.length}
              >
                Delete Selected
              </Button>
              <Button onPress={() => setSelectedIds([])}>Clear</Button>
            </View>
          ) : null
        }
      />

      <SnackbarMessage
        visible={snackbarVisible}
        message={snackbarMsg}
        onDismiss={() => setSnackbarVisible(false)}
      />
    </View>
  );
}
