import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, BookOpen, Users, ShoppingBag, Trophy, X, ChevronRight } from 'lucide-react';
import { UserProfile } from '../types';
import { db, doc, updateDoc, OperationType, handleFirestoreError } from '../firebase';
import { trackEvent } from '../services/analyticsService';

interface Step {
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

const steps: Step[] = [
  {
    title: "Welcome to EconQuest!",
    description: "Your journey to mastering economics starts here. Let's take a quick tour of the arena.",
    icon: Zap,
    color: "text-yellow-400"
  },
  {
    title: "Quests & Missions",
    description: "Complete quests to earn XP and Coins. Each quest is a step towards becoming an Econ Master.",
    icon: BookOpen,
    color: "text-blue-400"
  },
  {
    title: "Join a Squad",
    description: "Learning is better together. Join a Study Squad to chat, collaborate, and complete group missions.",
    icon: Users,
    color: "text-green-400"
  },
  {
    title: "The Bazaar",
    description: "Spend your hard-earned coins on exclusive badges, avatars, and themes in the Shop.",
    icon: ShoppingBag,
    color: "text-purple-400"
  },
  {
    title: "Achievements",
    description: "Unlock rare achievements as you progress. Show off your skills on the global leaderboard!",
    icon: Trophy,
    color: "text-orange-400"
  }
];

export default function WelcomeTour({ user, onComplete }: { user: UserProfile, onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Complete onboarding
      try {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, { onboardingCompleted: true });
        trackEvent(user.uid, 'achievement_unlocked', { achievementId: 'first_steps', title: 'First Steps' });
        onComplete();
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, 'users');
      }
    }
  };

  const step = steps[currentStep];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg bg-[#1a1a1a] border border-white/10 rounded-[2.5rem] p-8 md:p-12 overflow-hidden"
        >
          {/* Background Glow */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-yellow-400/10 blur-[100px] rounded-full" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-400/10 blur-[100px] rounded-full" />

          <div className="relative z-10">
            <div className="flex justify-between items-start mb-8">
              <div className={`p-4 rounded-3xl bg-white/5 border border-white/10 ${step.color}`}>
                <step.icon className="w-8 h-8" />
              </div>
              <button 
                onClick={onComplete}
                className="p-2 rounded-full hover:bg-white/5 transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <h2 className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic mb-4">
              {step.title}
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed mb-10">
              {step.description}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                {steps.map((_, i) => (
                  <div 
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === currentStep ? "w-8 bg-yellow-400" : "w-2 bg-white/10"
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={handleNext}
                className="flex items-center space-x-2 px-6 py-3 bg-yellow-400 text-black font-black uppercase tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-all"
              >
                <span>{currentStep === steps.length - 1 ? "Start Quest" : "Next"}</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
