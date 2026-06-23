import { useEffect, useState } from 'react';
import { collection, doc, onSnapshot, type Unsubscribe } from 'firebase/firestore';

import { firestore, hasFirebaseConfig } from '../firebase';
import { useAuthStore } from '../../store/authStore';

type RealtimeStatus = 'idle' | 'listening' | 'error';

type UsePetRealtimeOptions = {
  petId?: string | null;
  enabled?: boolean;
  listenPet?: boolean;
  listenCareTasks?: boolean;
  listenCareEvents?: boolean;
  listenMembers?: boolean;
  listenReminders?: boolean;
  onPetChanged?: () => void;
  onCareTasksChanged?: () => void;
  onCareEventsChanged?: () => void;
  onMembersChanged?: () => void;
  onRemindersChanged?: () => void;
};

function listenAfterInitial(
  label: string,
  subscribe: (onChange: () => void, onError: (message: string) => void) => Unsubscribe,
  onChange: () => void,
  onError: (message: string) => void,
) {
  let hasInitialSnapshot = false;

  return subscribe(
    () => {
      if (!hasInitialSnapshot) {
        hasInitialSnapshot = true;
        return;
      }

      onChange();
    },
    (message) => onError(`${label}: ${message}`),
  );
}

export function usePetRealtime({
  enabled = true,
  listenCareEvents = true,
  listenCareTasks = true,
  listenMembers = true,
  listenPet = false,
  listenReminders = false,
  onCareEventsChanged,
  onCareTasksChanged,
  onMembersChanged,
  onPetChanged,
  onRemindersChanged,
  petId,
}: UsePetRealtimeOptions) {
  const user = useAuthStore((state) => state.user);
  const [status, setStatus] = useState<RealtimeStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !hasFirebaseConfig || !firestore || !petId || !user?.uid) {
      setStatus('idle');
      setError(null);
      return undefined;
    }

    const db = firestore;
    const unsubscribes: Unsubscribe[] = [];
    const handleError = (message: string) => {
      setStatus('error');
      setError(message);
    };

    setStatus('listening');
    setError(null);

    if (listenPet && onPetChanged) {
      unsubscribes.push(
        listenAfterInitial(
          'pet',
          (onChange, onError) =>
            onSnapshot(doc(db, 'pets', petId), onChange, (snapshotError) => {
              onError(snapshotError.message);
            }),
          onPetChanged,
          handleError,
        ),
      );
    }

    if (listenCareTasks && onCareTasksChanged) {
      unsubscribes.push(
        listenAfterInitial(
          'careTasks',
          (onChange, onError) =>
            onSnapshot(collection(db, 'pets', petId, 'careTasks'), onChange, (snapshotError) => {
              onError(snapshotError.message);
            }),
          onCareTasksChanged,
          handleError,
        ),
      );
    }

    if (listenCareEvents && onCareEventsChanged) {
      unsubscribes.push(
        listenAfterInitial(
          'careEvents',
          (onChange, onError) =>
            onSnapshot(collection(db, 'pets', petId, 'careEvents'), onChange, (snapshotError) => {
              onError(snapshotError.message);
            }),
          onCareEventsChanged,
          handleError,
        ),
      );
    }

    if (listenMembers && onMembersChanged) {
      unsubscribes.push(
        listenAfterInitial(
          'members',
          (onChange, onError) =>
            onSnapshot(collection(db, 'pets', petId, 'members'), onChange, (snapshotError) => {
              onError(snapshotError.message);
            }),
          onMembersChanged,
          handleError,
        ),
      );
    }

    if (listenReminders && onRemindersChanged) {
      unsubscribes.push(
        listenAfterInitial(
          'reminders',
          (onChange, onError) =>
            onSnapshot(collection(db, 'pets', petId, 'reminders'), onChange, (snapshotError) => {
              onError(snapshotError.message);
            }),
          onRemindersChanged,
          handleError,
        ),
      );
    }

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, [
    enabled,
    listenCareEvents,
    listenCareTasks,
    listenMembers,
    listenPet,
    listenReminders,
    onCareEventsChanged,
    onCareTasksChanged,
    onMembersChanged,
    onPetChanged,
    onRemindersChanged,
    petId,
    user?.uid,
  ]);

  return {
    error,
    isListening: status === 'listening',
    status,
  };
}
