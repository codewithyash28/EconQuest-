import { db, collection, addDoc, OperationType, handleFirestoreError } from '../firebase';
import { UserEvent } from '../types';

export const trackEvent = async (
  userId: string, 
  type: UserEvent['type'], 
  metadata: any = {}
) => {
  try {
    const event: Omit<UserEvent, 'id'> = {
      userId,
      type,
      metadata,
      timestamp: new Date().toISOString(),
    };
    await addDoc(collection(db, 'user_events'), event);
  } catch (error) {
    // Silent fail for analytics to not break UX, but log to console
    console.warn('Analytics tracking failed:', error);
  }
};
