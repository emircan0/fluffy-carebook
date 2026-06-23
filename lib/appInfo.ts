import Constants from 'expo-constants';

export const appName = Constants.expoConfig?.name ?? 'YuvioPet';
export const appVersion = Constants.expoConfig?.version ?? '0.1.0';
export const appVersionLabel = `${appName} · v${appVersion}`;
