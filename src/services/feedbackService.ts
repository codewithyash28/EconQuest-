import { db, collection, addDoc, serverTimestamp } from '../firebase';
import { QuestFeedback } from '../types';

export const submitQuestFeedback = async (feedback: Omit<QuestFeedback, 'id' | 'timestamp'>) => {
  try {
    const feedbackRef = collection(db, 'questFeedback');
    await addDoc(feedbackRef, {
      ...feedback,
      timestamp: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return false;
  }
};
