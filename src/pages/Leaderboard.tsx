import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Trophy, Zap, Coins, Star, Users, Search, TrendingUp, Award } from 'lucide-react';
import { db, collection, getDocs, query, orderBy, limit } from '../firebase';
import { UserProfile } from '../types';

export default function Leaderboard() {
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const q = query(collection(db, 'users'), orderBy('xp', 'desc'), limit(50));
      const querySnapshot = await getDocs(q);
      const studentsData = querySnapshot.docs.map(doc => doc.data() as UserProfile);
      setStudents(studentsData);
      setLoading(false);
    };
    fetchLeaderboard();
  }, []);

  const filteredStudents = students.filter(s => 
    s.displayName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-sm font-black uppercase tracking-widest text-yellow-400 mb-2">Global Arena</h2>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic">
            Top <span className="text-yellow-400">Legends</span>
          </h1>
        </div>
        <div className="flex items-center space-x-3 bg-yellow-400/10 p-6 rounded-3xl border border-yellow-400/20">
          <Trophy className="w-8 h-8 text-yellow-400" />
          <div className="flex flex-col">
            <span className="text-xs uppercase font-black text-gray-500">Total Players</span>
            <span className="text-3xl font-black text-yellow-400">{students.length}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-white/5 p-6 rounded-3xl border border-white/10">
        <div className="flex items-center space-x-4">
          <TrendingUp className="w-6 h-6 text-yellow-400" />
          <h3 className="text-xl font-black uppercase tracking-widest italic">Global Rankings</h3>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-full pl-12 pr-6 py-3 text-sm focus:outline-none focus:border-yellow-400 transition-colors"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-[40px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-gray-500">Rank</th>
                  <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-gray-500">Student</th>
                  <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-gray-500">Level</th>
                  <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-gray-500 text-right">XP</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student, i) => (
                  <motion.tr
                    key={student.uid}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-3">
                        {i === 0 ? <Award className="w-6 h-6 text-yellow-400" /> : 
                         i === 1 ? <Award className="w-6 h-6 text-gray-400" /> : 
                         i === 2 ? <Award className="w-6 h-6 text-orange-400" /> : 
                         <span className="text-lg font-black text-gray-500 w-6 text-center">{i + 1}</span>}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center font-black text-yellow-400">
                          {student.displayName?.[0]}
                        </div>
                        <span className="font-bold group-hover:text-yellow-400 transition-colors">{student.displayName}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs font-black text-gray-400">
                        LVL {Math.floor(student.xp / 1000) + 1}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end space-x-2 text-yellow-400">
                        <Zap className="w-4 h-4" />
                        <span className="font-black text-lg">{student.xp.toLocaleString()}</span>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
