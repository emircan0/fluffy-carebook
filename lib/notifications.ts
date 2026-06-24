import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { Platform } from 'react-native';

import i18n from './i18n';
import { firebaseConfigError } from './auth';
import { firestore, hasFirebaseConfig } from './firebase';
import type { NotificationPreferences, NotificationTokenPlatform } from '../types/app';

export type PushRegistrationResult = {
  status: 'registered' | 'denied' | 'unsupported';
  message: string;
  tokenId?: string;
  expoPushToken?: string;
};

export const pushMessages = {
  get missingAuth() { return i18n.t('notifications.missingAuth'); },
  get unsupportedWeb() { return i18n.t('notifications.unsupportedWeb'); },
  get denied() { return i18n.t('notifications.denied'); },
  get registered() { return i18n.t('notifications.registered'); },
  get tokenFailed() { return i18n.t('notifications.tokenFailed'); },
};

const REMINDER_CHANNEL_ID = 'reminders';

function requireFirestore() {
  if (!hasFirebaseConfig || !firestore) {
    throw new Error(firebaseConfigError);
  }

  return firestore;
}

export async function updateNotificationPreferences(
  userId: string,
  preferences: NotificationPreferences,
) {
  if (!userId) {
    throw new Error(pushMessages.missingAuth);
  }

  const db = requireFirestore();
  const userRef = doc(db, 'users', userId);

  await updateDoc(userRef, {
    notificationPreferences: preferences,
    notificationPreferencesUpdatedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

function getProjectId() {
  const constants = Constants as unknown as {
    easConfig?: { projectId?: string };
    expoConfig?: { extra?: { eas?: { projectId?: string } } };
  };

  return constants.easConfig?.projectId
    ?? constants.expoConfig?.extra?.eas?.projectId
    ?? process.env.EXPO_PUBLIC_EXPO_PROJECT_ID
    ?? null;
}

function getDeviceId() {
  const constants = Constants as unknown as {
    installationId?: string | null;
    sessionId?: string | null;
  };

  return constants.installationId ?? constants.sessionId ?? Platform.OS;
}

function tokenIdFromExpoPushToken(expoPushToken: string) {
  return `expo_${expoPushToken.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
}

function getPlatform(): NotificationTokenPlatform {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    return Platform.OS;
  }

  return 'web';
}

async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
    name: i18n.t('notifications.channelName'),
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

export function canUsePushNotifications() {
  if (Platform.OS === 'web') {
    return {
      canUse: false,
      reason: pushMessages.unsupportedWeb,
    };
  }

  return {
    canUse: true,
    reason: null,
  };
}

export async function getNotificationPermissionStatus() {
  const support = canUsePushNotifications();

  if (!support.canUse) {
    return 'unsupported' as const;
  }

  try {
    const permissions = await Notifications.getPermissionsAsync();
    return permissions.status;
  } catch {
    return 'undetermined' as const;
  }
}

export async function requestNotificationPermission() {
  const support = canUsePushNotifications();

  if (!support.canUse) {
    return {
      granted: false,
      status: 'unsupported' as const,
      message: support.reason ?? pushMessages.unsupportedWeb,
    };
  }

  await ensureAndroidChannel();

  const existing = await Notifications.getPermissionsAsync();
  const finalStatus = existing.granted
    ? existing
    : await Notifications.requestPermissionsAsync();

  if (!finalStatus.granted) {
    return {
      granted: false,
      status: finalStatus.status,
      message: pushMessages.denied,
    };
  }

  return {
    granted: true,
    status: finalStatus.status,
    message: null,
  };
}

export async function getExpoPushToken() {
  const support = canUsePushNotifications();

  if (!support.canUse) {
    throw new Error(support.reason ?? pushMessages.unsupportedWeb);
  }

  await ensureAndroidChannel();

  const projectId = getProjectId();
  const token = projectId
    ? await Notifications.getExpoPushTokenAsync({ projectId })
    : await Notifications.getExpoPushTokenAsync();

  return token.data;
}

export async function registerPushToken(userId: string): Promise<PushRegistrationResult> {
  if (!userId) {
    throw new Error(pushMessages.missingAuth);
  }

  const permission = await requestNotificationPermission();

  if (!permission.granted) {
    return {
      status: permission.status === 'unsupported' ? 'unsupported' : 'denied',
      message: permission.message ?? pushMessages.denied,
    };
  }

  try {
    const db = requireFirestore();
    const expoPushToken = await getExpoPushToken();
    const tokenId = tokenIdFromExpoPushToken(expoPushToken);
    const tokenRef = doc(db, 'notificationTokens', userId, 'tokens', tokenId);
    const existingToken = await getDoc(tokenRef);

    await setDoc(
      tokenRef,
      {
        id: tokenId,
        userId,
        expoPushToken,
        platform: getPlatform(),
        deviceId: getDeviceId(),
        isActive: true,
        createdAt: existingToken.exists() ? existingToken.data().createdAt : serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );

    return {
      status: 'registered',
      message: pushMessages.registered,
      tokenId,
      expoPushToken,
    };
  } catch (error) {
    const message = error instanceof Error && error.message
      ? error.message
      : pushMessages.tokenFailed;

    return {
      status: 'unsupported',
      message,
    };
  }
}

export async function deactivatePushToken(userId: string, expoPushToken: string) {
  if (!userId) {
    throw new Error(pushMessages.missingAuth);
  }

  const db = requireFirestore();
  const tokenId = tokenIdFromExpoPushToken(expoPushToken);
  const tokenRef = doc(db, 'notificationTokens', userId, 'tokens', tokenId);

  await updateDoc(tokenRef, {
    isActive: false,
    updatedAt: serverTimestamp(),
  });
}
