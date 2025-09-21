import { Alert } from 'react-native';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Contact } from './types';

/**
 * Build vCard string from contacts array
 */
export function buildVCard(contacts: Contact[]) {
  let vcard = '';
  contacts.forEach((c) => {
    vcard += `BEGIN:VCARD\nVERSION:3.0\nFN:${c.name}\nTEL;TYPE=CELL:${c.phone}\n`;
    if (c.note) vcard += `NOTE:${c.note}\n`;
    vcard += 'END:VCARD\n';
  });
  return vcard;
}

/**
 * Save vCard to app sandbox and return file URI
 */
export async function saveVCardFile(eventName: string, contacts: Contact[]) {
  if (!contacts.length) {
    Alert.alert('No contacts', 'There are no contacts to export.');
    return null;
  }

  const vcard = buildVCard(contacts);
  const safeName = (eventName || 'event').replace(/[^a-z0-9_.-]/gi, '_');
  const filename = `${safeName}-contacts.vcf`;

  try {
    const file = new File(Paths.document, filename);
    if (file.exists) file.delete();
    file.create();
    file.write(vcard);
    return file.uri;
  } catch (err) {
    console.error('Failed to save vCard:', err);
    Alert.alert('Error', 'Failed to save contacts.');
    return null;
  }
}

/**
 * Share contacts using vCard file
 */
export async function handleShareContacts(
  eventName: string,
  contacts: Contact[]
) {
  try {
    const fileUri = await saveVCardFile(eventName, contacts);
    if (!fileUri) return;

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri);
    } else {
      Alert.alert('Share Not Available', `File saved at: ${fileUri}`);
    }
  } catch (err) {
    console.error(err);
    Alert.alert('Error', 'Failed to share contacts.');
  }
}

/**
 * Download contacts (save vCard in sandbox)
 */
export async function handleDownloadContacts(
  eventName: string,
  contacts: Contact[]
) {
  try {
    const fileUri = await saveVCardFile(eventName, contacts);
    if (fileUri) return fileUri;
  } catch (err) {
    console.error(err);
    Alert.alert('Error', 'Failed to download contacts.');
    return null;
  }
}
