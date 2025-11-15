export type UserSettings = {
  userId: string;
  capitalDefault: number;
  leverage: number;
  preferredExchanges: string[];
  alertChannel: 'email' | 'telegram';
  alertOptedOut: boolean;
};
