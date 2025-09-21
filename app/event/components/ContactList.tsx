import { FlatList } from 'react-native';
import { Card, Text } from 'react-native-paper';

type ContactListProps = {
  contacts: any[];
};

export default function ContactList({ contacts }: ContactListProps) {
  return (
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
  );
}
