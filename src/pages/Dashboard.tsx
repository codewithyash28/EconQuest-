import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Zap, 
  Coins, 
  Trophy, 
  TrendingUp, 
  BookOpen, 
  PlayCircle, 
  ChevronRight, 
  Star, 
  Flame, 
  Target, 
  Clock,
  ArrowUpRight,
  BarChart3,
  Brain,
  Sparkles
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import { UserProfile, Quest } from '../types';
import { db, collection, getDocs, query, limit, where } from '../firebase';
import { trackEvent } from '../services/analyticsService';
import { DashboardSkeleton } from '../components/Skeleton';

const data = [
  { name: 'Mon', xp: 400 },
  { name: 'Tue', xp: 300 },
  { name: 'Wed', xp: 600 },
  { name: 'Thu', xp: 800 },
  { name: 'Fri', xp: 500 },
  { name: 'Sat', xp: 900 },
  { name: 'Sun', xp: 1200 },
];

export default function Dashboard({ user }: { user: UserProfile }) {
  const navigate = useNavigate();
  const [recommendedQuest, setRecommendedQuest] = useState<Quest | null>(null);
  const [recentQuests, setRecentQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewCount, setReviewCount] = useState(0);
  const [weakestTopic, setWeakestTopic] = useState<string | null>(null);

  const currentLevel = Math.floor(user.xp / 1000) + 1;
  const xpInCurrentLevel = user.xp % 1000;
  const progressToNextLevel = (xpInCurrentLevel / 1000) * 100;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch recommended quest (one not completed yet)
        const allQuestsQuery = query(collection(db, 'quests'), limit(10));
        const allQuestsSnapshot = await getDocs(allQuestsQuery);
        const allQuests = allQuestsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Quest));
        
        const nextQuest = allQuests.find(q => !user.completedQuests.includes(q.id));
        setRecommendedQuest(nextQuest || allQuests[0]);

        // Fetch other recent quests
        setRecentQuests(allQuests.filter(q => q.id !== nextQuest?.id).slice(0, 2));

        // Fetch review count and weakest topic
        const reviewQ = query(
          collection(db, 'reviewItems'),
          where('userId', '==', user.uid)
        );
        const reviewSnapshot = await getDocs(reviewQ);
        const items = reviewSnapshot.docs.map(doc => doc.data());
        
        const dueItems = items.filter(item => item.nextReview <= new Date().toISOString());
        setReviewCount(dueItems.length);

        if (items.length > 0) {
          // Simple logic: topic with most review items is the weakest
          const topicCounts: Record<string, number> = {};
          items.forEach(item => {
            const q = allQuests.find(quest => quest.id === item.questId);
            if (q) {
              topicCounts[q.category] = (topicCounts[q.category] || 0) + 1;
            }
          });
          const weakest = Object.entries(topicCounts).sort((a, b) => b[1] - a[1])[0];
          if (weakest) setWeakestTopic(weakest[0]);
        }
        
        trackEvent(user.uid, 'quest_started', { page: 'dashboard' });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.uid, user.completedQuests]);

  if (loading) return <div className="max-w-7xl mx-auto pb-20"><DashboardSkeleton /></div>;

  return (
    <div className="space-y-12 pb-20">
      {/* Welcome Header & Level Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center" data-tour="dashboard">
        <div>
          <h2 className="text-sm font-black uppercase tracking-widest text-yellow-400 mb-2">Arena Dashboard</h2>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-none mb-4">
            Welcome back, <br />
            <span className="text-yellow-400">{user.displayName?.split(' ')[0]}</span>
          </h1>
          <p className="text-gray-500 text-lg font-medium max-w-md">
            You're on a <span className="text-white font-bold">{user.streak} day streak</span>! Keep the momentum going and conquer the next challenge.
          </p>
        </div>

        <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 relative overflow-hidden group" data-tour="stats">
          <div className="absolute top-0 right-0 p-6">
            <Zap className="w-12 h-12 text-yellow-400/20 group-hover:scale-110 transition-transform" />
          </div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-end mb-4">
              <div>
                <span className="text-xs uppercase font-black text-gray-500 block mb-1">Current Rank</span>
                <span className="text-4xl font-black italic uppercase tracking-tighter">Level {currentLevel}</span>
              </div>
              <div className="text-right">
                <span className="text-xs uppercase font-black text-gray-500 block mb-1">Next Level</span>
                <span className="text-xl font-black text-white/50">{user.xp + (1000 - xpInCurrentLevel)} XP Needed</span>
              </div>
            </div>

            {/* Massive Progress Bar */}
            <div className="h-6 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 p-1">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressToNextLevel}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-[0_0_20px_rgba(250,196,21,0.3)]"
              />
            </div>
            <div className="flex justify-between mt-2 text-[10px] uppercase font-black tracking-widest text-gray-500">
              <span>{xpInCurrentLevel} XP</span>
              <span>1000 XP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary CTA: Recommended Quest */}
      {recommendedQuest && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          data-tour="recommended"
          className="relative p-1 rounded-[3rem] bg-gradient-to-br from-yellow-400 via-orange-500 to-purple-600 group shadow-2xl"
        >
          <div className="bg-[#0a0a0a] rounded-[2.8rem] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <span className="px-3 py-1 bg-yellow-400 text-black text-[10px] font-black uppercase tracking-widest rounded-full">
                  Recommended For You
                </span>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                  {recommendedQuest.difficulty} • {recommendedQuest.category}
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic mb-4 group-hover:text-yellow-400 transition-colors">
                {recommendedQuest.title}
              </h2>
              <p className="text-gray-400 text-lg max-w-xl mb-6">
                {recommendedQuest.description}
              </p>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  <span className="font-black text-xl">{recommendedQuest.xpReward} XP</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Coins className="w-5 h-5 text-blue-400" />
                  <span className="font-black text-xl">{recommendedQuest.coinReward} Coins</span>
                </div>
              </div>
            </div>
            
            <Link 
              to={`/quests/${recommendedQuest.id}`}
              className="w-full md:w-auto px-12 py-6 bg-yellow-400 text-black font-black uppercase tracking-widest text-xl rounded-3xl hover:scale-105 active:scale-95 transition-all shadow-[0_20px_40px_rgba(250,196,21,0.2)] flex items-center justify-center space-x-3"
            >
              <span>Start Quest</span>
              <PlayCircle className="w-6 h-6" />
            </Link>
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {/* Today's Focus Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-3xl bg-purple-400 text-black flex flex-col justify-between h-40 shadow-2xl shadow-purple-400/20 group cursor-pointer overflow-hidden relative"
          onClick={() => navigate('/review')}
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Brain className="w-20 h-20" />
          </div>
          <div className="flex items-center justify-between relative z-10">
            <div className="p-2 rounded-xl bg-black/10">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="px-2 py-0.5 bg-black/10 rounded-full text-[8px] font-black uppercase tracking-widest">
              Priority
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-[10px] uppercase font-black opacity-60 mb-1">
              {weakestTopic ? `Weakest: ${weakestTopic}` : "Today's Focus"}
            </p>
            <p className="text-xl font-black italic tracking-tighter leading-none">
              {reviewCount > 0 ? `${reviewCount} Concepts to Review` : "All Synced Up!"}
            </p>
          </div>
        </motion.div>

        {[
          { label: 'Total XP', value: user.xp, icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
          { label: 'Coins', value: user.coins, icon: Coins, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { label: 'Quests Done', value: user.completedQuests.length, icon: BookOpen, color: 'text-green-400', bg: 'bg-green-400/10' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-3xl bg-white/5 border border-white/10 flex flex-col md:flex-row items-center md:items-start space-y-3 md:space-y-0 md:space-x-4 text-center md:text-left"
          >
            <div className={`p-4 rounded-2xl ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-black text-gray-500 tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black tracking-tight">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Progress Chart */}
        <div className="lg:col-span-2 p-8 rounded-[2.5rem] bg-white/5 border border-white/10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <BarChart3 className="w-6 h-6 text-yellow-400" />
              <h3 className="text-xl font-black uppercase tracking-widest italic">XP Progression</h3>
            </div>
            <div className="flex items-center space-x-2 text-[10px] font-black uppercase text-gray-500 tracking-widest">
              <span className="px-3 py-1 bg-yellow-400 text-black rounded-full">Weekly</span>
              <span className="px-3 py-1 hover:bg-white/5 rounded-full cursor-pointer transition-colors">Monthly</span>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fac415" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#fac415" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#ffffff50" 
                  fontSize={10} 
                  fontWeight="bold"
                  tickLine={false} 
                  axisLine={false} 
                  dy={10}
                />
                <YAxis 
                  stroke="#ffffff50" 
                  fontSize={10} 
                  fontWeight="bold"
                  tickLine={false} 
                  axisLine={false} 
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ffffff20', borderRadius: '16px', padding: '12px' }}
                  itemStyle={{ color: '#fac415', fontWeight: '900', textTransform: 'uppercase', fontSize: '12px' }}
                  cursor={{ stroke: '#fac415', strokeWidth: 2, strokeDasharray: '5 5' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="xp" 
                  stroke="#fac415" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorXp)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Other Quests */}
        <div className="space-y-8">
          <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black uppercase tracking-widest italic">Other Quests</h3>
              <Link to="/quests" className="text-[10px] font-black uppercase text-yellow-400 hover:underline tracking-widest">View All</Link>
            </div>
            {recentQuests.length > 0 ? (
              <div className="space-y-4">
                {recentQuests.map((quest) => (
                  <Link 
                    key={quest.id} 
                    to={`/quests/${quest.id}`}
                    className="block p-5 rounded-3xl bg-white/5 border border-white/5 hover:border-yellow-400/50 transition-all group relative overflow-hidden"
                  >
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] uppercase font-black px-2 py-0.5 bg-white/10 text-gray-400 rounded tracking-widest">
                          {quest.category}
                        </span>
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 text-yellow-400" />
                          <span className="text-[9px] uppercase font-black text-gray-500 tracking-widest">{quest.difficulty}</span>
                        </div>
                      </div>
                      <h4 className="font-black text-lg mb-2 group-hover:text-yellow-400 transition-colors leading-tight">{quest.title}</h4>
                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-500">
                        <div className="flex items-center space-x-2">
                          <Zap className="w-3 h-3 text-yellow-400" />
                          <span>{quest.xpReward} XP</span>
                        </div>
                        <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="text-xs uppercase font-black tracking-widest">No quests available yet.</p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4">
            <button className="p-6 rounded-[2rem] bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-all text-center group">
              <TrendingUp className="w-8 h-8 text-blue-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest block">Market Sim</span>
            </button>
            <button className="p-6 rounded-[2rem] bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 transition-all text-center group">
              <Star className="w-8 h-8 text-purple-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest block">Daily Quiz</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
