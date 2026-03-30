import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  Users, 
  BookOpen, 
  ShoppingBag, 
  TrendingUp, 
  Zap, 
  Coins, 
  BarChart3, 
  ArrowUpRight, 
  ArrowDownRight,
  Settings,
  Plus,
  Edit,
  Trash2,
  ChevronRight,
  X,
  PlusCircle,
  Star,
  CheckCircle2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { db, collection, getDocs, query, limit, doc, deleteDoc, addDoc, OperationType, handleFirestoreError } from '../firebase';
import { UserProfile, Quest, ShopItem, QuizQuestion } from '../types';
import { toast } from 'react-hot-toast';

import { getGlobalStats, GlobalStats, updateGlobalStats } from '../services/statsService';

export default function AdminDashboard({ user }: { user: UserProfile }) {
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalQuests: 0,
    totalShopItems: 0,
    totalEarnings: 0
  });
  const [recentQuests, setRecentQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const navigate = useNavigate();

  // New Quest State
  const [newQuest, setNewQuest] = useState({
    title: '',
    description: '',
    category: 'Microeconomics',
    difficulty: 'Beginner',
    xpReward: 100,
    coinReward: 50,
    trackId: 'micro-101',
    syllabusTag: '',
    order: 1,
    prerequisites: [] as string[],
    lessons: [{ title: '', content: '' }],
    quiz: [{ id: Math.random().toString(36).substr(2, 9), question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' }] as QuizQuestion[]
  });

  const handleRefreshStats = async () => {
    setRefreshing(true);
    try {
      const newStats = await updateGlobalStats();
      setGlobalStats(newStats);
      toast.success('Platform stats updated!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update stats.');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }

    const fetchAllData = async () => {
      try {
        const gStats = await getGlobalStats();
        setGlobalStats(gStats);

        const usersSnapshot = await getDocs(collection(db, 'users'));
        const questsSnapshot = await getDocs(collection(db, 'quests'));
        const shopSnapshot = await getDocs(collection(db, 'shopItems'));
        
        const totalEarnings = usersSnapshot.docs.reduce((acc, doc) => {
          const data = doc.data() as UserProfile;
          return acc + (data.ownedItems.length * 500); // Mock earnings calculation
        }, 0);

        setStats({
          totalUsers: usersSnapshot.size,
          totalQuests: questsSnapshot.size,
          totalShopItems: shopSnapshot.size,
          totalEarnings
        });

        const q = query(collection(db, 'quests'), limit(10));
        const recentQuestsSnapshot = await getDocs(q);
        setRecentQuests(recentQuestsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Quest)));
      } catch (error) {
        console.error("Error fetching admin stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [user, navigate]);

  const handleCreateQuest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const docRef = await addDoc(collection(db, 'quests'), {
        ...newQuest,
        quiz: newQuest.quiz.map((q, i) => ({ ...q, id: `q${i + 1}` }))
      });
      toast.success('Quest created successfully!');
      setShowCreateModal(false);
      // Refresh list
      const q = query(collection(db, 'quests'), limit(10));
      const snapshot = await getDocs(q);
      setRecentQuests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Quest)));
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'quests');
    }
  };

  const handleDeleteQuest = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this quest?')) return;
    try {
      await deleteDoc(doc(db, 'quests', id));
      setRecentQuests(recentQuests.filter(q => q.id !== id));
      toast.success('Quest deleted!');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `quests/${id}`);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><ShieldCheck className="w-12 h-12 text-red-500 animate-pulse" /></div>;

  return (
    <div className="space-y-12 pb-20">
      {/* Create Quest Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0a0a0a] border border-white/10 rounded-[40px] w-full max-w-4xl p-8 my-8 relative"
          >
            <button 
              onClick={() => setShowCreateModal(false)}
              className="absolute top-6 right-6 p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-3xl font-black uppercase italic mb-8">Forge New <span className="text-yellow-400">Quest</span></h2>

            <form onSubmit={handleCreateQuest} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Quest Title</label>
                  <input 
                    required
                    value={newQuest.title}
                    onChange={e => setNewQuest({...newQuest, title: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:border-yellow-400 outline-none transition-all"
                    placeholder="e.g. Supply & Demand Mastery"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Track ID</label>
                  <input 
                    required
                    value={newQuest.trackId}
                    onChange={e => setNewQuest({...newQuest, trackId: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:border-yellow-400 outline-none transition-all"
                    placeholder="e.g. micro-101"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Syllabus Tag</label>
                  <input 
                    value={newQuest.syllabusTag}
                    onChange={e => setNewQuest({...newQuest, syllabusTag: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:border-yellow-400 outline-none transition-all"
                    placeholder="e.g. Class 11 - CBSE: Unit 2"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Category</label>
                  <select 
                    value={newQuest.category}
                    onChange={e => setNewQuest({...newQuest, category: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:border-yellow-400 outline-none transition-all"
                  >
                    <option value="Microeconomics">Microeconomics</option>
                    <option value="Macroeconomics">Macroeconomics</option>
                    <option value="Personal Finance">Personal Finance</option>
                    <option value="Behavioral Economics">Behavioral Economics</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Difficulty</label>
                  <select 
                    value={newQuest.difficulty}
                    onChange={e => setNewQuest({...newQuest, difficulty: e.target.value as any})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:border-yellow-400 outline-none transition-all"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">XP Reward</label>
                  <input 
                    type="number"
                    value={newQuest.xpReward}
                    onChange={e => setNewQuest({...newQuest, xpReward: parseInt(e.target.value)})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:border-yellow-400 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Order in Track</label>
                  <input 
                    type="number"
                    value={newQuest.order}
                    onChange={e => setNewQuest({...newQuest, order: parseInt(e.target.value)})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:border-yellow-400 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Description</label>
                <textarea 
                  required
                  value={newQuest.description}
                  onChange={e => setNewQuest({...newQuest, description: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 h-32 focus:border-yellow-400 outline-none transition-all"
                />
              </div>

              {/* Quiz Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black uppercase italic">Quiz Questions</h3>
                  <button 
                    type="button"
                    onClick={() => setNewQuest({
                      ...newQuest, 
                      quiz: [...newQuest.quiz, { id: Math.random().toString(36).substr(2, 9), question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' }]
                    })}
                    className="text-yellow-400 hover:text-yellow-300 transition-colors"
                  >
                    <PlusCircle className="w-6 h-6" />
                  </button>
                </div>

                {newQuest.quiz.map((q, i) => (
                  <div key={i} className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-gray-500">Question {i + 1}</span>
                      {newQuest.quiz.length > 1 && (
                        <button 
                          type="button"
                          onClick={() => setNewQuest({...newQuest, quiz: newQuest.quiz.filter((_, idx) => idx !== i)})}
                          className="text-red-500 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <input 
                      required
                      value={q.question}
                      onChange={e => {
                        const updatedQuiz = [...newQuest.quiz];
                        updatedQuiz[i].question = e.target.value;
                        setNewQuest({...newQuest, quiz: updatedQuiz});
                      }}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-yellow-400"
                      placeholder="Question text"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {q.options.map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center space-x-2">
                          <input 
                            type="radio"
                            name={`correct-${i}`}
                            checked={q.correctAnswer === optIdx}
                            onChange={() => {
                              const updatedQuiz = [...newQuest.quiz];
                              updatedQuiz[i].correctAnswer = optIdx;
                              setNewQuest({...newQuest, quiz: updatedQuiz});
                            }}
                          />
                          <input 
                            required
                            value={opt}
                            onChange={e => {
                              const updatedQuiz = [...newQuest.quiz];
                              updatedQuiz[i].options[optIdx] = e.target.value;
                              setNewQuest({...newQuest, quiz: updatedQuiz});
                            }}
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl p-2 text-sm outline-none focus:border-yellow-400"
                            placeholder={`Option ${optIdx + 1}`}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-yellow-400/50">Explanation (Learning Impact)</label>
                      <textarea 
                        required
                        value={q.explanation}
                        onChange={e => {
                          const updatedQuiz = [...newQuest.quiz];
                          updatedQuiz[i].explanation = e.target.value;
                          setNewQuest({...newQuest, quiz: updatedQuiz});
                        }}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm outline-none focus:border-yellow-400 h-20"
                        placeholder="Explain why the correct answer is right..."
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-4 pt-8">
                <button 
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-yellow-400 text-black rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-yellow-300 transition-all shadow-lg shadow-yellow-400/20"
                >
                  Publish Quest
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-sm font-black uppercase tracking-widest text-red-500 mb-2">Command Center</h2>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic">
            Admin <span className="text-red-500">Panel</span>
          </h1>
        </div>
        <div className="flex items-center space-x-4 bg-red-500/10 p-4 rounded-3xl border border-red-500/20">
          <ShieldCheck className="w-6 h-6 text-red-500" />
          <div className="flex flex-col">
            <span className="text-xs uppercase font-black text-gray-500">Access Level</span>
            <span className="text-xl font-black text-red-500 uppercase tracking-widest">Administrator</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Users', value: globalStats?.activeStudents || stats.totalUsers, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10', trend: '+12%' },
          { label: 'Active Quests', value: stats.totalQuests, icon: BookOpen, color: 'text-yellow-400', bg: 'bg-yellow-400/10', trend: '+2' },
          { label: 'Avg. Rating', value: `${globalStats?.avgRating || 4.6}/5`, icon: Star, color: 'text-purple-400', bg: 'bg-purple-400/10', trend: '0' },
          { label: 'Quests Completed', value: globalStats?.questsCompleted || 1240, icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-400/10', trend: '+24%' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-8 rounded-[40px] bg-white/5 border border-white/10 flex flex-col justify-between h-48"
          >
            <div className="flex items-center justify-between">
              <div className={`p-4 rounded-2xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="flex items-center space-x-1 text-[10px] font-black uppercase text-green-400">
                <ArrowUpRight className="w-3 h-3" />
                <span>{stat.trend}</span>
              </div>
            </div>
            <div>
              <p className="text-xs uppercase font-black text-gray-500 mb-1">{stat.label}</p>
              <p className="text-4xl font-black italic tracking-tighter">{stat.value.toLocaleString()}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Content Management */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="p-8 rounded-[40px] bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <BookOpen className="w-6 h-6 text-yellow-400" />
                <h3 className="text-xl font-black uppercase tracking-widest italic">Content Management</h3>
              </div>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-yellow-400 text-black rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-yellow-300 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Create Quest</span>
              </button>
            </div>

            <div className="space-y-4">
              {recentQuests.map((quest) => (
                <div key={quest.id} className="p-6 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-between group hover:border-yellow-400/30 transition-all">
                  <div className="flex items-center space-x-6">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center font-black text-yellow-400">
                      {quest.title[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">{quest.title}</h4>
                      <div className="flex items-center space-x-3 text-[10px] uppercase font-black text-gray-500">
                        <span className="text-yellow-400">{quest.category}</span>
                        <span>•</span>
                        <span>{quest.difficulty}</span>
                        <span>•</span>
                        <span>{quest.xpReward} XP</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors text-gray-400 hover:text-white">
                      <Edit className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteQuest(quest.id)}
                      className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-colors text-red-500"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <button className="w-full mt-8 py-4 bg-white/5 border border-white/10 rounded-2xl font-black uppercase text-xs tracking-widest text-gray-400 hover:bg-white/10 transition-all flex items-center justify-center space-x-2">
              <span>View All Content</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-8">
          <div className="p-8 rounded-[40px] bg-white/5 border border-white/10">
            <h3 className="text-xl font-black uppercase tracking-widest italic mb-8">System Health</h3>
            <div className="space-y-6">
              {[
                { label: 'Database Latency', value: '12ms', status: 'Optimal' },
                { label: 'Auth Service', value: '99.9%', status: 'Active' },
                { label: 'AI Engine', value: 'Online', status: 'Active' },
                { label: 'Storage Usage', value: '1.2GB', status: 'Normal' }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                  <div>
                    <p className="text-[10px] uppercase font-black text-gray-500 mb-1">{item.label}</p>
                    <p className="font-bold text-sm">{item.value}</p>
                  </div>
                  <span className="text-[10px] uppercase font-black px-2 py-1 bg-green-500/10 text-green-500 rounded">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-8 rounded-[40px] bg-red-500/10 border border-red-500/20">
            <h3 className="text-xl font-black uppercase tracking-widest italic mb-6 text-red-500">Danger Zone</h3>
            <div className="space-y-4">
              <button 
                onClick={handleRefreshStats}
                disabled={refreshing}
                className="w-full py-4 bg-red-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-red-600 transition-all disabled:opacity-50"
              >
                {refreshing ? 'Refreshing...' : 'Refresh Platform Stats'}
              </button>
              <button className="w-full py-4 bg-white/5 border border-red-500/20 text-red-500 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-red-500/10 transition-all">
                Maintenance Mode
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
