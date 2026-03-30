import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Zap, Coins, ChevronRight, Star, Filter, Search, PlayCircle, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { db, collection, getDocs } from '../firebase';
import { Quest, UserProfile } from '../types';
import { QuestSkeleton } from '../components/Skeleton';

export default function Quests({ user }: { user: UserProfile }) {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchQuests = async () => {
      const querySnapshot = await getDocs(collection(db, 'quests'));
      const questsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Quest));
      setQuests(questsData);
      setLoading(false);
    };
    fetchQuests();
  }, []);

  const filteredQuests = quests.filter(q => 
    (filter === 'All' || q.category === filter) &&
    (q.title.toLowerCase().includes(search.toLowerCase()) || q.description.toLowerCase().includes(search.toLowerCase()))
  );

  const categories = ['Microeconomics', 'Macroeconomics', 'Personal Finance', 'Behavioral Economics'];

  const getTrackProgress = (category: string) => {
    const categoryQuests = quests.filter(q => q.category === category);
    if (categoryQuests.length === 0) return 0;
    const completed = categoryQuests.filter(q => user.completedQuests.includes(q.id)).length;
    return (completed / categoryQuests.length) * 100;
  };

  return (
    <div className="space-y-16 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-sm font-black uppercase tracking-widest text-yellow-400 mb-2">Quest Arena</h2>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic">
            Choose your <span className="text-yellow-400">Path</span>
          </h1>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-white/5 p-8 rounded-[2.5rem] border border-white/10">
        <div className="flex flex-wrap gap-3">
          {['All', ...categories].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                filter === cat ? 'bg-yellow-400 text-black shadow-[0_10px_20px_rgba(250,196,21,0.2)]' : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search quests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-sm focus:outline-none focus:border-yellow-400 transition-colors font-medium"
          />
        </div>
      </div>

      {/* Tracks Section */}
      {filter === 'All' && !search && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {categories.map((cat, i) => (
            <motion.div
              key={cat}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Trophy className="w-24 h-24 text-yellow-400" />
              </div>
              <div className="relative z-10">
                <h3 className="text-3xl font-black uppercase tracking-tighter italic mb-2">{cat} Path</h3>
                <p className="text-gray-500 text-sm font-medium mb-6">Master the core principles of {cat.toLowerCase()}.</p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                    <span>Track Progress</span>
                    <span>{Math.round(getTrackProgress(cat))}%</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${getTrackProgress(cat)}%` }}
                      className="h-full bg-yellow-400 rounded-full"
                    />
                  </div>
                </div>
                <button 
                  onClick={() => setFilter(cat)}
                  className="mt-8 px-6 py-3 bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-white/10"
                >
                  Explore Quests
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Quest Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <QuestSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredQuests.map((quest, i) => (
            <motion.div
              key={quest.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="group relative"
            >
              <Link to={`/quests/${quest.id}`} className="block h-full">
                <div className="h-full p-8 rounded-[2.5rem] bg-white/5 border border-white/10 hover:border-yellow-400/50 transition-all flex flex-col relative overflow-hidden">
                  {/* Status Badge */}
                  {user.completedQuests.includes(quest.id) && (
                    <div className="absolute top-6 right-6 p-2 bg-green-500 text-black rounded-full shadow-lg z-20">
                      <Trophy className="w-4 h-4" />
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-6">
                    <div className="flex flex-col space-y-2">
                      <span className="text-[9px] uppercase font-black px-3 py-1.5 bg-white/10 text-gray-400 rounded-full border border-white/10 tracking-widest w-fit">
                        {quest.category}
                      </span>
                      {quest.syllabusTag && (
                        <span className="text-[8px] uppercase font-black text-blue-400/70 tracking-widest">
                          {quest.syllabusTag}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-1.5 text-gray-500">
                      <Star className={`w-3.5 h-3.5 ${quest.difficulty === 'Advanced' ? 'text-red-400' : quest.difficulty === 'Intermediate' ? 'text-orange-400' : 'text-green-400'}`} />
                      <span className="text-[9px] uppercase font-black tracking-widest">{quest.difficulty}</span>
                    </div>
                  </div>

                  <h3 className="text-2xl font-black mb-4 group-hover:text-yellow-400 transition-colors leading-tight uppercase italic tracking-tighter">
                    {quest.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-8 line-clamp-3 flex-1 leading-relaxed font-medium">
                    {quest.description}
                  </p>

                  <div className="flex items-center justify-between pt-6 border-t border-white/5">
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2 text-yellow-400">
                        <Zap className="w-4 h-4" />
                        <span className="font-black text-sm">{quest.xpReward}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-blue-400">
                        <Coins className="w-4 h-4" />
                        <span className="font-black text-sm">{quest.coinReward}</span>
                      </div>
                    </div>
                    <div className="p-3 bg-yellow-400 text-black rounded-2xl transform group-hover:translate-x-1 transition-transform shadow-lg">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && filteredQuests.length === 0 && (
        <div className="text-center py-32">
          <Search className="w-16 h-16 mx-auto mb-6 text-gray-600 opacity-20" />
          <h3 className="text-2xl font-black text-gray-500 uppercase italic">No quests found in this sector</h3>
          <button onClick={() => {setFilter('All'); setSearch('');}} className="mt-4 text-yellow-400 hover:underline font-black uppercase text-sm">Reset Filters</button>
        </div>
      )}
    </div>
  );
}
