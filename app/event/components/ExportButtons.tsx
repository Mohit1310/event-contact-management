import { Button, IconButton, useTheme } from 'react-native-paper';
import { handleShareContacts, handleDownloadContacts } from '@/lib/vcard';
import { Contact } from '@/lib/types';
import { View } from 'react-native';

type ExportButtonsProps = {
  contacts: Contact[];
  eventName: string;
  setSnackbarMsg: (msg: string) => void;
  setSnackbarVisible: (visible: boolean) => void;
};

export default function ExportButtons({
  contacts,
  eventName,
  setSnackbarMsg,
  setSnackbarVisible,
}: ExportButtonsProps) {
  const theme = useTheme();
  return (
    <View style={{ display: 'flex', flexDirection: 'row', gap: 8 }}>
      <IconButton
        icon="share-variant"
        size={28}
        onPress={() => handleShareContacts(eventName, contacts)}
        style={{
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
          boxShadow: 'rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;',
          // borderRadius: '10px',
        }}
      />
      {/* <IconButton
        icon="download"
        size={28}
        onPress={async () => {
          const uri = await handleDownloadContacts(eventName, contacts);
          if (uri) {
            setSnackbarMsg(`Saved to: ${uri}`);
            setSnackbarVisible(true);
          }
        }}
        style={{ flexShrink: 0, height: 32, width: 'auto' }}
      /> */}
    </View>
  );
}
