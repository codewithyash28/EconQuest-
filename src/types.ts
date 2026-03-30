export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  xp: number;
  coins: number;
  streak: number;
  lastLogin: string;
  completedQuests: string[];
  ownedItems: string[];
  achievements: string[];
  role?: 'student' | 'admin';
  onboardingCompleted?: boolean;
  completedTour?: boolean;
  preferences?: {
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    interests: string[];
  };
}

export interface Quest {
  id: string;
  title: string;
  category: 'Microeconomics' | 'Macroeconomics' | 'Personal Finance' | 'Behavioral Economics';
  description: string;
  xpReward: number;
  coinReward: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  lessons: Lesson[];
  quiz: QuizQuestion[];
  trackId?: string; // e.g., 'micro-101'
  order?: number; // Order within the track
  prerequisites?: string[]; // IDs of quests that must be completed first
  syllabusTag?: string; // e.g., 'Class 11 - CBSE: Unit 2'
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  videoUrl?: string;
  keyTakeaways?: string[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string; // Detailed feedback for the answer
  topicId?: string; // For analytics on weak topics
}

export interface UserEvent {
  id: string;
  userId: string;
  type: 'quest_started' | 'quest_completed' | 'quiz_failed' | 'streak_broken' | 'squad_created' | 'item_purchased' | 'achievement_unlocked' | 'review_completed';
  metadata: any;
  timestamp: string;
}

export interface QuestFeedback {
  id: string;
  questId: string;
  userId: string;
  rating: number; // 1-5
  comment?: string;
  timestamp: string;
}

export interface ReviewItem {
  id: string;
  userId: string;
  questionId: string;
  questId: string;
  nextReview: string; // ISO date
  interval: number; // in days
  easeFactor: number;
  repetitions: number;
}

export interface ShopItem {
  id: string;
  name: string;
  price: number;
  type: 'Badge' | 'Avatar' | 'Theme';
  description: string;
  imageUrl?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: string;
}

export interface StudyGroup {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  members: string[];
  challenges: string[];
  scheduledChallenges?: ScheduledChallenge[];
}

export interface ScheduledChallenge {
  id: string;
  questId: string;
  questTitle: string;
  scheduledFor: string;
  xpReward: number;
  completedBy: string[];
}

export interface GroupMessage {
  id: string;
  groupId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
}
