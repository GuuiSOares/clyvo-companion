import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

const DAY_LOG_CHANNEL = 'day-log';
export const DAY_LOG_NOTIFICATION = 'day-log-saved';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function ensurePermission() {
  const current = await Notifications.getPermissionsAsync();
  if (current.status === 'granted') return true;

  const requested = await Notifications.requestPermissionsAsync();
  return requested.status === 'granted';
}

export async function notifyDayLogSaved(petName: string) {
  try {
    const allowed = await ensurePermission();
    if (!allowed) return;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(DAY_LOG_CHANNEL, {
        name: 'Registro do dia',
        importance: Notifications.AndroidImportance.HIGH,
      });
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Registro do dia salvo',
        body: `O acompanhamento de ${petName} já está no prontuário para o veterinário.`,
        data: { type: DAY_LOG_NOTIFICATION },
        ...(Platform.OS === 'android' ? { channelId: DAY_LOG_CHANNEL } : {}),
      },
      trigger: null,
    });
  } catch {
    // O registro já foi salvo. A falha do aviso não desfaz o prontuário.
  }
}

export function listenForDayLogNotification(openCheckin: () => void) {
  return Notifications.addNotificationResponseReceivedListener((response) => {
    const type = response.notification.request.content.data?.type;
    if (type === DAY_LOG_NOTIFICATION) openCheckin();
  });
}
