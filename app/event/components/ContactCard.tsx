import { Contact } from '@/lib/types';
import { Card, Text } from 'react-native-paper';

type ContactCardProps = {
  contact: Contact;
};

export default function ContactCard({ contact }: ContactCardProps) {
  return (
    <Card style={{ marginBottom: 8 }}>
      <Card.Title title={contact.name} subtitle={contact.phone} />
      {contact.note ? (
        <Card.Content>
          <Text>{contact.note}</Text>
        </Card.Content>
      ) : null}
    </Card>
  );
}
