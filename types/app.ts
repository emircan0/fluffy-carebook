export type PetRole = 'owner' | 'editor' | 'viewer';

export type MemberStatus = 'active' | 'removed';

export type InviteStatus = 'pending' | 'accepted' | 'expired' | 'cancelled';

export type PetSpecies = 'cat' | 'dog' | 'bird' | 'rabbit' | 'other';

export type PetGender = 'male' | 'female' | 'unknown';

export type Pet = {
  id: string;
  name: string;
  species: PetSpecies;
  breed: string | null;
  gender: PetGender;
  birthDate: string | null;
  microchipNo: string | null;
  photoUrl: string | null;
  notes: string | null;
  ownerId: string;
  createdAt: unknown;
  updatedAt: unknown;
  deletedAt: unknown | null;
};

export type PetMember = {
  userId: string;
  role: PetRole;
  status: MemberStatus;
  invitedBy: string | null;
  joinedAt: unknown;
  updatedAt: unknown;
};

export type PetMemberWithProfile = PetMember & {
  email: string | null;
  fullName: string | null;
  avatarUrl: string | null;
};

export type PetInvite = {
  id: string;
  token: string;
  petId: string;
  petName: string;
  invitedBy: string;
  invitedByName: string | null;
  role: Extract<PetRole, 'editor' | 'viewer'>;
  status: InviteStatus;
  acceptedBy: string | null;
  createdAt: unknown;
  expiresAt: unknown;
  acceptedAt: unknown | null;
};

export type CareEventType =
  | 'food'
  | 'medicine'
  | 'litter'
  | 'water'
  | 'walk'
  | 'bath'
  | 'grooming'
  | 'play'
  | 'training'
  | 'teeth'
  | 'other';

export type CareScheduleType = 'none' | 'daily' | 'weekly' | 'monthly';

export type CareEventStatus = 'done' | 'skipped';

export type CareTask = {
  id: string;
  petId: string;
  title: string;
  eventType: CareEventType;
  scheduleType: CareScheduleType;
  dueTime: string | null;
  isActive: boolean;
  allowMultiplePerDay: boolean;
  notifyEnabled: boolean;
  createdBy: string;
  createdAt: unknown;
  updatedAt: unknown;
  deletedAt: unknown | null;
};

export type CareEvent = {
  id: string;
  petId: string;
  taskId: string;
  taskTitle: string;
  userId: string;
  userName: string | null;
  eventType: CareEventType;
  status: CareEventStatus;
  doneAt: unknown;
  occurrenceKey: string | null;
  clientEventId: string;
  note: string | null;
  createdAt: unknown;
};

export type ReminderType =
  | 'vaccine'
  | 'internal_parasite'
  | 'external_parasite'
  | 'medicine'
  | 'vet'
  | 'other';

export type NotificationPreferences = Record<ReminderType, boolean>;

export type ReminderRecurrence = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';



export type Reminder = {
  id: string;
  petId: string;
  title: string;
  reminderType: ReminderType;
  remindAt: unknown;
  recurrence: ReminderRecurrence;
  notifyEnabled: boolean;
  isActive: boolean;
  isCompleted?: boolean;
  completedAt?: unknown;
  completedBy?: string;
  completedByName?: string;
  createdBy: string;
  createdAt: unknown;
  updatedAt: unknown;
  deletedAt: unknown | null;
};

export type NotificationTokenPlatform = 'ios' | 'android' | 'web';

export type NotificationToken = {
  id: string;
  userId: string;
  expoPushToken: string;
  platform: NotificationTokenPlatform;
  deviceId: string | null;
  isActive: boolean;
  createdAt: unknown;
  updatedAt: unknown;
};

export * from './expense';
export * from './measurement';
