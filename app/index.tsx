import { useEffect, useState } from 'react';
import { Alert, FlatList, View } from 'react-native';
import {
  IconButton,
  List,
  Dialog,
  Portal,
  Button,
  TextInput,
  FAB,
  Card,
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import { getEvents, deleteEvent, updateEvent, addEvent } from '../lib/db';
import { Event } from '@/lib/types';

export default function HomeScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [newName, setNewName] = useState('');
  const [dialogVisible, setDialogVisible] = useState(false);
  const [addDialogVisible, setAddDialogVisible] = useState(false);
  const [addName, setAddName] = useState('');
  const router = useRouter();

  async function loadEvents() {
    const data = await getEvents();
    setEvents(data);
  }

  useEffect(() => {
    loadEvents();
  }, []);

  const handleDelete = async (id: number) => {
    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this event and all its contacts?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            await deleteEvent(id);
            loadEvents();
          },
        },
      ]
    );
  };

  const handleEdit = (event: Event) => {
    setSelectedEvent(event);
    setNewName(event.name);
    setDialogVisible(true);
  };

  const saveEdit = async () => {
    if (selectedEvent) {
      await updateEvent(selectedEvent.id, newName);
      setDialogVisible(false);
      setSelectedEvent(null);
      loadEvents();
    }
  };

  const saveAdd = async () => {
    if (addName.trim()) {
      await addEvent(addName.trim());
      setAddDialogVisible(false);
      setAddName('');
      loadEvents();
    }
  };

  const renderItem = ({ item }: { item: Event }) => (
    <List.Item
      title={item.name}
      onPress={() => router.push(`/event/${item.id}`)}
      style={{
        backgroundColor: 'white',
        paddingVertical: 0,
        marginBottom: 8,
        borderRadius: 8,
        boxShadow: 'rgba(99, 99, 99, 0.2) 0px 2px 8px 0px',
      }}
      right={() => (
        <View style={{ flexDirection: 'row' }}>
          <IconButton icon="pencil" onPress={() => handleEdit(item)} />
          <IconButton
            icon="delete"
            onPress={() => handleDelete(item.id)}
            iconColor="red"
          />
        </View>
      )}
    />
  );

  return (
    <View style={{ flex: 1, marginHorizontal: 16, marginTop: 16 }}>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
      />

      {/* Edit Event Dialog */}
      <Portal>
        <Dialog
          visible={dialogVisible}
          onDismiss={() => setDialogVisible(false)}
        >
          <Dialog.Title>Edit Event</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Event name"
              value={newName}
              onChangeText={setNewName}
              autoFocus
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Cancel</Button>
            <Button onPress={saveEdit}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Add Event Dialog */}
      <Portal>
        <Dialog
          visible={addDialogVisible}
          onDismiss={() => setAddDialogVisible(false)}
        >
          <Dialog.Title>New Events</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Event name"
              value={addName}
              onChangeText={setAddName}
              autoFocus
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setAddDialogVisible(false)}>Cancel</Button>
            <Button onPress={saveAdd}>Add</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Floating Action Button */}
      <FAB
        icon="plus"
        style={{
          position: 'absolute',
          right: 0,
          bottom: 16,
        }}
        onPress={() => setAddDialogVisible(true)}
      />
    </View>
  );
}
