import { useState, useCallback } from 'react';
import { View, FlatList, Text, TouchableOpacity, Alert } from 'react-native';
import {
  TextInput,
  Button,
  FAB,
  Portal,
  Dialog,
  Provider,
  IconButton,
} from 'react-native-paper';
import { db, deleteContact } from '@/lib/db';
import SnackbarMessage from './components/SnackbarMessage';
import { Contact } from '@/lib/types';
import { useLocalSearchParams, useFocusEffect } from 'expo-router';

export default function Event() {
  const { id } = useLocalSearchParams();
  const eventId = Number(id);

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form state (used in modal)
  const [formVisible, setFormVisible] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');

  const loadContacts = () => {
    const result = db.getAllSync<Contact>(
      'SELECT * FROM contacts WHERE event_id = ? ORDER BY id DESC;',
      [eventId]
    );
    setContacts(result);
    setSelectedIds([]);
    setSelectionMode(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadContacts();
    }, [eventId])
  );

  const saveContact = () => {
    if (!name.trim()) {
      setSnackbarMsg('Name is required');
      setSnackbarVisible(true);
      return;
    }

    if (isEditMode && editingId !== null) {
      // UPDATE existing
      db.runSync(
        'UPDATE contacts SET name = ?, phone = ?, note = ? WHERE id = ?',
        [name, phone, note, editingId]
      );
      setSnackbarMsg('Contact updated');
    } else {
      // INSERT new
      db.runSync(
        'INSERT INTO contacts (event_id, name, phone, note) VALUES (?, ?, ?, ?)',
        [eventId, name, phone, note]
      );
      setSnackbarMsg('Contact added');
    }

    // Reset state
    setName('');
    setPhone('');
    setNote('');
    setFormVisible(false);
    setIsEditMode(false);
    setEditingId(null);

    loadContacts();
    setSnackbarVisible(true);
  };

  const toggleSelect = (id: number) => {
    if (selectedIds.includes(id)) {
      const newSelected = selectedIds.filter((cid) => cid !== id);
      setSelectedIds(newSelected);
      if (!newSelected.length) setSelectionMode(false);
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const deleteSelected = () => {
    if (!selectedIds.length) return;
    db.runSync(
      `DELETE FROM contacts WHERE id IN (${selectedIds
        .map(() => '?')
        .join(',')});`,
      selectedIds
    );
    loadContacts();
    setSnackbarMsg(`${selectedIds.length} contact(s) deleted`);
    setSnackbarVisible(true);
  };

  const selectAll = () => {
    if (selectedIds.length === contacts.length) {
      setSelectedIds([]);
      setSelectionMode(false);
    } else {
      setSelectedIds(contacts.map((c) => c.id));
      setSelectionMode(true);
    }
  };

  const handleEditContact = (contactId: number) => {
    const contact = db.getFirstSync<Contact>(
      'SELECT * FROM contacts WHERE id = ?',
      [contactId]
    );
    if (!contact) return;
    setName(contact.name);
    setPhone(contact.phone);
    setNote(contact.note || '');
    setFormVisible(true);
    setIsEditMode(true);
    setEditingId(contact.id);
    loadContacts();
  };

  const handleDelete = async (id: number) => {
    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this contact?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            await deleteContact(id);
            loadContacts();
          },
        },
      ]
    );
    setSnackbarMsg('Contact deleted');
    setSnackbarVisible(true);
  };

  const handleDialogDismiss = () => {
    setFormVisible(false);
    setIsEditMode(false);
    setEditingId(null);
    setName('');
    setPhone('');
    setNote('');
  };

  const renderItem = ({ item }: { item: Contact }) => {
    const isSelected = selectedIds.includes(item.id);

    return (
      <TouchableOpacity
        onLongPress={() => {
          if (!selectionMode) {
            setSelectionMode(true);
            toggleSelect(item.id);
          }
        }}
        onPress={() => {
          if (selectionMode) {
            toggleSelect(item.id);
          }
        }}
        style={{
          padding: 12,
          backgroundColor: isSelected ? '#fcd7d7' : 'white',
          marginVertical: 4,
          borderRadius: 8,
          borderWidth: isSelected ? 2 : 1,
          borderColor: isSelected ? '#ff0000' : '#ddd',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <View style={{ flexDirection: 'column', gap: 4 }}>
          <Text style={{ fontSize: 18 }}>{item.name}</Text>
          <Text style={{ fontSize: 16 }}>{item.phone}</Text>
          {item.note ? <Text style={{ fontSize: 14 }}>{item.note}</Text> : null}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <IconButton
            icon={'pencil'}
            size={28}
            onPress={() => handleEditContact(item.id)}
          />
          <IconButton
            icon={'delete'}
            size={28}
            iconColor="red"
            onPress={() => handleDelete(item.id)}
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Provider>
      <View style={{ flex: 1, padding: 16 }}>
        {selectionMode && (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <Button onPress={selectAll}>
              {selectedIds.length === contacts.length
                ? 'Unselect All'
                : 'Select All'}
            </Button>
            <Button onPress={deleteSelected} disabled={!selectedIds.length}>
              Delete Selected
            </Button>
            <Button onPress={() => setSelectedIds([])}>Clear</Button>
          </View>
        )}

        <FlatList
          data={contacts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
        />

        {/* Floating Action Button */}
        <FAB
          style={{ position: 'absolute', bottom: 24, right: 24 }}
          icon="plus"
          onPress={() => setFormVisible(true)}
        />

        {/* Modal for adding/editing a contact */}
        <Portal>
          <Dialog visible={formVisible} onDismiss={handleDialogDismiss}>
            <Dialog.Title>{isEditMode ? 'Edit' : 'Add'} Contact</Dialog.Title>
            <Dialog.Content
              style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
            >
              <TextInput label="Name" value={name} onChangeText={setName} />
              <TextInput
                label="Phone"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
              <TextInput
                label="Note (Optional)"
                value={note}
                onChangeText={setNote}
              />
            </Dialog.Content>
            <Dialog.Actions>
              <Button
                mode="contained-tonal"
                onPress={handleDialogDismiss}
                style={{ paddingHorizontal: 8 }}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={saveContact}
                style={{ paddingHorizontal: 8 }}
              >
                {isEditMode ? 'Save' : 'Add'}
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>

        <SnackbarMessage
          visible={snackbarVisible}
          message={snackbarMsg}
          onDismiss={() => setSnackbarVisible(false)}
        />
      </View>
    </Provider>
  );
}
