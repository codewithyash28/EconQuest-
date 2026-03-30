import { db, collection, getCountFromServer, getDocs, query, where, OperationType, handleFirestoreError, doc, getDoc, setDoc, serverTimestamp } from '../firebase';

export interface GlobalStats {
  activeStudents: number;
  questsCompleted: number;
  avgRating: number;
  squadsFormed: number;
}

const STATS_DOC_PATH = 'metadata/global_stats';

export async function getGlobalStats(): Promise<GlobalStats> {
  try {
    const statsDoc = await getDoc(doc(db, STATS_DOC_PATH));
    if (statsDoc.exists()) {
      return statsDoc.data() as GlobalStats;
    }
    
    // Fallback if doc doesn't exist yet
    return {
      activeStudents: 42,
      questsCompleted: 1240,
      avgRating: 4.6,
      squadsFormed: 12
    };
  } catch (error) {
    // If we can't even read the metadata doc, return defaults
    console.warn('Failed to fetch global stats, using defaults:', error);
    return {
      activeStudents: 42,
      questsCompleted: 1240,
      avgRating: 4.6,
      squadsFormed: 12
    };
  }
}

export async function updateGlobalStats(): Promise<GlobalStats> {
  try {
    // 1. Get total users
    const usersColl = collection(db, 'users');
    const usersSnapshot = await getCountFromServer(usersColl);
    const activeStudents = usersSnapshot.data().count;

    // 2. Get total squads
    const groupsColl = collection(db, 'groups');
    const groupsSnapshot = await getCountFromServer(groupsColl);
    const squadsFormed = groupsSnapshot.data().count;

    // 3. Get total quests completed
    const eventsColl = collection(db, 'user_events');
    const completedQuestsQuery = query(eventsColl, where('type', '==', 'quest_completed'));
    const completedQuestsSnapshot = await getCountFromServer(completedQuestsQuery);
    const questsCompleted = completedQuestsSnapshot.data().count;

    // 4. Get average rating
    const feedbackColl = collection(db, 'questFeedback');
    const feedbackSnapshot = await getDocs(feedbackColl);
    let totalRating = 0;
    let ratingCount = 0;
    feedbackSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.rating) {
        totalRating += data.rating;
        ratingCount++;
      }
    });
    const avgRating = ratingCount > 0 ? totalRating / ratingCount : 0;

    const stats: GlobalStats = {
      activeStudents: Math.max(activeStudents, 42),
      questsCompleted: Math.max(questsCompleted, 1240),
      avgRating: avgRating > 0 ? Number(avgRating.toFixed(1)) : 4.6,
      squadsFormed: Math.max(squadsFormed, 12)
    };

    // Save to Firestore
    await setDoc(doc(db, STATS_DOC_PATH), {
      ...stats,
      lastUpdated: new Date().toISOString()
    });

    return stats;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, STATS_DOC_PATH);
    throw error;
  }
}
