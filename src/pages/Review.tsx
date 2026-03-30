import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  History, 
  Brain, 
  ChevronRight, 
  CheckCircle2, 
  X, 
  Zap,
  HelpCircle,
  Sparkles,
  Calendar
} from 'lucide-react';
import { db, collection, getDocs, query, where, doc, getDoc, updateDoc, deleteDoc } from '../firebase';
import { UserProfile, ReviewItem, QuizQuestion, Quest } from '../types';
import { toast } from 'react-hot-toast';

import { ReviewSkeleton } from '../components/Skeleton';

export default function Review({ user }: { user: UserProfile }) {
  const [items, setItems] = useState<(ReviewItem & { question: QuizQuestion, questTitle: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const fetchReviewItems = async () => {
      try {
        const q = query(
          collection(db, 'reviewItems'),
          where('userId', '==', user.uid),
          where('nextReview', '<=', new Date().toISOString())
        );
        const snapshot = await getDocs(q);
        const reviewItems = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ReviewItem));

        const detailedItems = await Promise.all(reviewItems.map(async (item) => {
          const questDoc = await getDoc(doc(db, 'quests', item.questId));
          const questData = questDoc.data() as Quest;
          const question = questData.quiz.find(q => q.id === item.questionId);
          return {
            ...item,
            question: question!,
            questTitle: questData.title
          };
        }));

        setItems(detailedItems.filter(i => i.question));
      } catch (error) {
        console.error("Error fetching review items:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReviewItems();
  }, [user.uid]);

  const handleReview = async (quality: number) => {
    const item = items[currentIndex];
    
    // Simple Spaced Repetition Logic (SuperMemo-2 inspired)
    let newInterval = 1;
    let newEaseFactor = item.easeFactor;
    let newRepetitions = item.repetitions;

    if (quality >= 3) {
      if (newRepetitions === 0) newInterval = 1;
      else if (newRepetitions === 1) newInterval = 6;
      else newInterval = Math.round(item.interval * newEaseFactor);
      
      newRepetitions++;
      newEaseFactor = Math.max(1.3, newEaseFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
    } else {
      newRepetitions = 0;
      newInterval = 1;
    }

    const nextReview = new Date(Date.now() + newInterval * 86400000).toISOString();

    try {
      if (quality >= 4 && newRepetitions > 3) {
        // If mastered, remove from review
        await deleteDoc(doc(db, 'reviewItems', item.id));
      } else {
        await updateDoc(doc(db, 'reviewItems', item.id), {
          interval: newInterval,
          easeFactor: newEaseFactor,
          repetitions: newRepetitions,
          nextReview
        });
      }

      if (currentIndex < items.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setShowAnswer(false);
      } else {
        setCompleted(true);
        toast.success('Review session completed!');
      }
    } catch (error) {
      console.error("Error updating review item:", error);
      toast.error('Failed to update review progress.');
    }
  };

  if (loading) return <div className="max-w-7xl mx-auto pb-20"><ReviewSkeleton /></div>;

  if (items.length === 0 || completed) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 space-y-8">
        <div className="w-24 h-24 bg-purple-400/10 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-12 h-12 text-purple-400" />
        </div>
        <h2 className="text-4xl font-black uppercase italic tracking-tighter">Memory <span className="text-purple-400">Synced</span></h2>
        <p className="text-gray-500 font-medium">No items due for review. Your economic intuition is sharp!</p>
        <div className="pt-8">
          <button onClick={() => window.history.back()} className="px-8 py-4 bg-white/5 border border-white/10 rounded-full font-black uppercase text-xs tracking-widest hover:bg-white/10 transition-all">
            Return to Arena
          </button>
        </div>
      </div>
    );
  }

  const currentItem = items[currentIndex];

  return (
    <div className="max-w-3xl mx-auto space-y-12 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-black uppercase tracking-widest text-purple-400 mb-2">Spaced Repetition</h2>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic">Review <span className="text-purple-400">Session</span></h1>
        </div>
        <div className="flex items-center space-x-2 bg-purple-400/10 px-4 py-2 rounded-full border border-purple-400/20">
          <Calendar className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-black text-purple-400 uppercase tracking-widest">{currentIndex + 1} / {items.length}</span>
        </div>
      </div>

      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-10 rounded-[40px] bg-white/5 border border-white/10 shadow-2xl space-y-8"
      >
        <div className="flex items-center space-x-3 text-[10px] font-black uppercase tracking-widest text-gray-500">
          <History className="w-4 h-4" />
          <span>From: {currentItem.questTitle}</span>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold leading-tight">{currentItem.question.question}</h2>
          
          <div className="grid grid-cols-1 gap-4">
            {currentItem.question.options.map((opt, i) => (
              <div 
                key={i}
                className={`p-5 rounded-2xl border transition-all ${
                  showAnswer 
                    ? i === currentItem.question.correctAnswer
                      ? 'bg-green-500/20 border-green-500 text-green-400'
                      : 'bg-white/5 border-white/10 text-gray-600'
                    : 'bg-white/5 border-white/10 text-gray-400'
                }`}
              >
                {opt}
              </div>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {showAnswer && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 pt-8 border-t border-white/10"
            >
              <div className="p-6 bg-purple-400/5 rounded-3xl border border-purple-400/10 italic text-gray-400 text-sm leading-relaxed">
                <div className="flex items-center space-x-2 mb-2 text-purple-400">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Deep Insight</span>
                </div>
                {currentItem.question.explanation}
              </div>

              <div className="space-y-4">
                <p className="text-center text-[10px] font-black uppercase tracking-widest text-gray-500">How well did you remember this?</p>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: 'Forgot', val: 1, color: 'bg-red-500' },
                    { label: 'Hard', val: 3, color: 'bg-orange-500' },
                    { label: 'Good', val: 4, color: 'bg-blue-500' },
                    { label: 'Easy', val: 5, color: 'bg-green-500' }
                  ].map((btn) => (
                    <button
                      key={btn.val}
                      onClick={() => handleReview(btn.val)}
                      className={`py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all hover:scale-105 active:scale-95 ${btn.color} text-white`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!showAnswer && (
          <button
            onClick={() => setShowAnswer(true)}
            className="w-full py-6 bg-purple-400 text-white rounded-3xl font-black uppercase tracking-widest text-sm hover:bg-purple-500 transition-all shadow-lg shadow-purple-400/20 flex items-center justify-center space-x-3"
          >
            <span>Reveal Answer</span>
            <Zap className="w-5 h-5" />
          </button>
        )}
      </motion.div>
    </div>
  );
}
