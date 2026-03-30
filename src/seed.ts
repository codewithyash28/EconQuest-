import { db, collection, getDocs, setDoc, doc } from './firebase';
import { Quest, ShopItem } from './types';

const sampleQuests: Quest[] = [
  {
    id: 'micro_1',
    title: 'The Invisible Hand',
    category: 'Microeconomics',
    description: 'Explore how supply and demand interact to create market equilibrium. Understand the forces that drive prices and quantities in a free market.',
    xpReward: 500,
    coinReward: 100,
    difficulty: 'Beginner',
    lessons: [
      { id: 'l1', title: 'What is Demand?', content: 'Demand is the quantity of a good that consumers are willing and able to purchase at various prices. The Law of Demand states that as price increases, quantity demanded decreases.' },
      { id: 'l2', title: 'The Law of Supply', content: 'Supply is the quantity of a good that producers are willing and able to sell at various prices. The Law of Supply states that as price increases, quantity supplied increases.' }
    ],
    quiz: [
      { id: 'q1', question: 'What happens to quantity demanded when price rises?', options: ['Increases', 'Decreases', 'Stays the same', 'Becomes zero'], correctAnswer: 1, explanation: 'The Law of Demand states that as price increases, quantity demanded decreases.' },
      { id: 'q2', question: 'Who coined the term "Invisible Hand"?', options: ['John Maynard Keynes', 'Adam Smith', 'Karl Marx', 'Milton Friedman'], correctAnswer: 1, explanation: 'Adam Smith used the term "Invisible Hand" in his book "The Wealth of Nations".' }
    ],
    trackId: 'micro-101',
    order: 1
  },
  {
    id: 'macro_1',
    title: 'The GDP Giant',
    category: 'Macroeconomics',
    description: 'Learn how to measure the total output of an economy. Understand the components of Gross Domestic Product and why it matters for national growth.',
    xpReward: 600,
    coinReward: 150,
    difficulty: 'Intermediate',
    lessons: [
      { id: 'l1', title: 'Components of GDP', content: 'GDP = Consumption + Investment + Government Spending + Net Exports (C + I + G + NX).' }
    ],
    quiz: [
      { id: 'q1', question: 'Which of the following is NOT a component of GDP?', options: ['Consumption', 'Investment', 'Stock Market Prices', 'Net Exports'], correctAnswer: 2, explanation: 'Stock market prices are not part of GDP; only final goods and services are measured.' }
    ],
    trackId: 'macro-101',
    order: 1
  }
];

const sampleShopItems: ShopItem[] = [
  { id: 'badge_econ_pro', name: 'Econ Pro Badge', price: 200, type: 'Badge', description: 'Show off your economic expertise with this exclusive gold badge.' },
  { id: 'avatar_adam_smith', name: 'Adam Smith Avatar', price: 500, type: 'Avatar', description: 'Unlock the legendary father of modern economics as your profile avatar.' },
  { id: 'theme_neon', name: 'Neon Arena Theme', price: 1000, type: 'Theme', description: 'Transform your dashboard with a high-contrast neon aesthetic.' }
];

export const seedFirestore = async () => {
  const questsSnapshot = await getDocs(collection(db, 'quests'));
  if (questsSnapshot.empty) {
    for (const quest of sampleQuests) {
      await setDoc(doc(db, 'quests', quest.id), quest);
    }
    console.log('Quests seeded!');
  }

  const shopSnapshot = await getDocs(collection(db, 'shopItems'));
  if (shopSnapshot.empty) {
    for (const item of sampleShopItems) {
      await setDoc(doc(db, 'shopItems', item.id), item);
    }
    console.log('Shop items seeded!');
  }
};
