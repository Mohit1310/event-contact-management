import { Button } from 'react-native-paper';
import { Alert } from 'react-native';
import { db } from '@/lib/db';

type DeleteResetButtonsProps = {
  eventId: number;
  onContactsReset: () => void;
};

export default function ResetButton({
  eventId,
  onContactsReset,
}: DeleteResetButtonsProps) {
  return (
    <>
      <Button
        mode="outlined"
        onPress={() =>
          Alert.alert(
            'Reset Contacts',
            'Are you sure you want to delete all contacts for this event?',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Yes',
                style: 'destructive',
                onPress: () => {
                  db.runSync('DELETE FROM contacts WHERE event_id = ?;', [
                    eventId,
                  ]);
                  onContactsReset();
                },
              },
            ]
          )
        }
        style={{ marginBottom: 8 }}
      >
        Delete All Contacts
      </Button>
    </>
  );
}
