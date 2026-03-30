import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Trophy, Zap, Coins, Star, CheckCircle2, Lock, Sparkles, Award, Target, Flame } from 'lucide-react';
import { UserProfile, Achievement } from '../types';

const achievements: Achievement[] = [
  { id: 'first_quest', title: 'First Steps', description: 'Complete your first economics quest.', icon: 'Zap', requirement: '1 Completed Quest' },
  { id: 'streak_3', title: 'Consistent Student', description: 'Maintain a 3-day login streak.', icon: 'Flame', requirement: '3 Day Streak' },
  { id: 'xp_1000', title: 'Econ Novice', description: 'Reach 1,000 total XP.', icon: 'Target', requirement: '1,000 XP' },
  { id: 'coins_500', title: 'Wealth Builder', description: 'Earn 500 total coins.', icon: 'Coins', requirement: '500 Coins' },
  { id: 'all_micro', title: 'Micro Master', description: 'Complete all Microeconomics quests.', icon: 'Star', requirement: 'All Micro Quests' },
  { id: 'shop_item', title: 'Big Spender', description: 'Purchase your first item from the shop.', icon: 'ShoppingBag', requirement: '1 Shop Item' },
];

export default function Achievements({ user }: { user: UserProfile }) {
  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-sm font-black uppercase tracking-widest text-purple-400 mb-2">Arena Hall of Fame</h2>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic">
            Your <span className="text-purple-400">Legacy</span>
          </h1>
        </div>
        <div className="flex items-center space-x-3 bg-purple-400/10 p-6 rounded-3xl border border-purple-400/20">
          <Trophy className="w-8 h-8 text-purple-400" />
          <div className="flex flex-col">
            <span className="text-xs uppercase font-black text-gray-500">Unlocked</span>
            <span className="text-3xl font-black text-purple-400">{user.achievements.length} / {achievements.length}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {achievements.map((achievement, i) => {
          const isUnlocked = user.achievements.includes(achievement.id);
          const Icon = achievement.icon === 'Zap' ? Zap : 
                       achievement.icon === 'Flame' ? Flame : 
                       achievement.icon === 'Target' ? Target : 
                       achievement.icon === 'Coins' ? Coins : 
                       achievement.icon === 'Star' ? Star : Award;

          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className={`relative p-8 rounded-[40px] border transition-all ${
                isUnlocked 
                  ? 'bg-purple-400/10 border-purple-400/50 shadow-[0_0_30px_rgba(168,85,247,0.1)]' 
                  : 'bg-white/5 border-white/10 opacity-50 grayscale'
              }`}
            >
              <div className="flex items-start justify-between mb-8">
                <div className={`p-4 rounded-2xl ${isUnlocked ? 'bg-purple-400 text-black' : 'bg-white/10 text-gray-500'}`}>
                  <Icon className="w-8 h-8" />
                </div>
                {isUnlocked ? (
                  <CheckCircle2 className="w-6 h-6 text-purple-400" />
                ) : (
                  <Lock className="w-6 h-6 text-gray-600" />
                )}
              </div>

              <h3 className={`text-2xl font-black mb-3 uppercase italic tracking-tight ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>
                {achievement.title}
              </h3>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                {achievement.description}
              </p>

              <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] uppercase font-black text-gray-500">Requirement</span>
                <span className={`text-[10px] uppercase font-black ${isUnlocked ? 'text-purple-400' : 'text-gray-600'}`}>
                  {achievement.requirement}
                </span>
              </div>

              {!isUnlocked && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/40 rounded-[40px] backdrop-blur-sm">
                  <span className="text-xs font-black uppercase tracking-widest text-white">Keep playing to unlock</span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
