import { IconButton } from 'react-native-paper';
import { handleShareContacts, handleDownloadContacts } from '@/lib/vcard';
import { Contact } from '@/lib/types';
import { View } from 'react-native';

type ExportButtonsProps = {
  contacts: Contact[];
  eventName: string;
};

export default function ExportButtons({
  contacts,
  eventName,
}: ExportButtonsProps) {
  return (
    <View style={{ display: 'flex', flexDirection: 'row' }}>
      <IconButton
        icon="share-variant"
        size={20}
        onPress={() => handleShareContacts(eventName, contacts)}
      />
      {/* <IconButton
        icon="download"
        size={24}
        onPress={async () => {
          await handleDownloadContacts(eventName, contacts);
        }}
      /> */}
    </View>
  );
}
