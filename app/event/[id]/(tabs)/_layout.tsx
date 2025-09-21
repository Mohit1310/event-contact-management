import { Tabs, useLocalSearchParams } from 'expo-router';
import { Icon } from 'react-native-paper';

export default function EventTabsLayout() {
  const { id } = useLocalSearchParams(); // get id from parent route
  console.log('🚀 ~ EventTabsLayout ~ id:', id);
  const eventId = Number(id); // convert to number
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: 'blue',
        tabBarInactiveTintColor: 'gray',
      }}
    >
      <Tabs.Screen
        name="AddContact"
        options={{
          title: 'Add Contact',
          tabBarIcon: ({ color, size }) => (
            <Icon source="plus-box" size={size} color={color} />
          ),
        }}
        initialParams={{ eventId }} // pass eventId as initial param to the screen
      />
      <Tabs.Screen
        name="DeleteContacts"
        options={{
          title: 'Delete Contacts',
          tabBarIcon: ({ color, size }) => (
            <Icon source="delete" size={size} color={color} />
          ),
        }}
        initialParams={{ eventId }} // pass eventId as initial param to the screen
      />
    </Tabs>
  );
}
