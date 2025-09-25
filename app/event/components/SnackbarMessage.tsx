import { Snackbar, useTheme } from 'react-native-paper';

type SnackbarMessageProps = {
  visible: boolean;
  message: string;
  onDismiss: () => void;
};

export default function SnackbarMessage({
  visible,
  message,
  onDismiss,
}: SnackbarMessageProps) {
  return (
    <Snackbar
      visible={visible}
      onDismiss={onDismiss}
      duration={4000}
      action={{ label: 'Close', onPress: onDismiss }}
    >
      {message}
    </Snackbar>
  );
}
