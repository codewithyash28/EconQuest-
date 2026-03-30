import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Send, MessageSquare, Zap, Target, Trophy, ChevronLeft, User, Plus, X, BarChart3, Clock } from 'lucide-react';
import { db, doc, getDoc, updateDoc, onSnapshot, collection, setDoc, query, orderBy, limit, getDocs, OperationType, handleFirestoreError } from '../firebase';
import { StudyGroup, UserProfile, GroupMessage, Quest, ScheduledChallenge } from '../types';
import { toast } from 'react-hot-toast';

import { GroupSkeleton } from '../components/Skeleton';

export default function GroupDetail({ user }: { user: UserProfile }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState<StudyGroup | null>(null);
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedQuestId, setSelectedQuestId] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;

    const unsubscribeGroup = onSnapshot(doc(db, 'groups', id), (doc) => {
      if (doc.exists()) {
        setGroup({ id: doc.id, ...doc.data() } as StudyGroup);
      }
      setLoading(false);
    });

    const q = query(collection(db, 'groups', id, 'messages'), orderBy('timestamp', 'asc'), limit(50));
    const unsubscribeMessages = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GroupMessage));
      setMessages(msgs);
    });

    return () => {
      unsubscribeGroup();
      unsubscribeMessages();
    };
  }, [id]);

  useEffect(() => {
    const fetchMembers = async () => {
      if (!group) return;
      const memberData: UserProfile[] = [];
      for (const uid of group.members) {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
          memberData.push(userDoc.data() as UserProfile);
        }
      }
      setMembers(memberData);
    };
    fetchMembers();
  }, [group]);

  useEffect(() => {
    const fetchQuests = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'quests'));
        setQuests(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Quest)));
      } catch (error) {
        console.error("Error fetching quests:", error);
      }
    };
    fetchQuests();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !id) return;

    const messageId = Math.random().toString(36).substring(2, 15);
    const message: GroupMessage = {
      id: messageId,
      groupId: id,
      senderId: user.uid,
      senderName: user.displayName || 'Anonymous',
      text: newMessage,
      timestamp: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'groups', id, 'messages', messageId), message);
      setNewMessage('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `groups/${id}/messages`);
    }
  };

  const handleScheduleChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !selectedQuestId || !scheduledDate) return;

    const quest = quests.find(q => q.id === selectedQuestId);
    if (!quest) return;

    const challenge: ScheduledChallenge = {
      id: Math.random().toString(36).substring(2, 15),
      questId: selectedQuestId,
      questTitle: quest.title,
      scheduledFor: new Date(scheduledDate).toISOString(),
      xpReward: quest.xpReward * 2, // Bonus for squad challenge
      completedBy: []
    };

    try {
      const updatedChallenges = [...(group?.scheduledChallenges || []), challenge];
      await updateDoc(doc(db, 'groups', id), {
        scheduledChallenges: updatedChallenges
      });
      
      // Post to chat
      const messageId = Math.random().toString(36).substring(2, 15);
      await setDoc(doc(db, 'groups', id, 'messages', messageId), {
        id: messageId,
        groupId: id,
        senderId: 'system',
        senderName: 'Squad Command',
        text: `🚨 NEW MISSION ASSIGNED: "${quest.title}" scheduled for ${new Date(scheduledDate).toLocaleString()}. Bonus XP active!`,
        timestamp: new Date().toISOString()
      });

      setShowScheduleModal(false);
      setSelectedQuestId('');
      setScheduledDate('');
      toast.success('Mission scheduled for the squad!');
    } catch (error) {
      console.error("Error scheduling challenge:", error);
      toast.error('Failed to schedule mission.');
    }
  };

  if (loading) return <div className="max-w-7xl mx-auto pb-20"><GroupSkeleton /></div>;
  if (!group) return <div className="text-center py-20">Squad not found.</div>;

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-center space-x-6">
          <button onClick={() => navigate('/groups')} className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-blue-400 mb-2">Squad Arena</h2>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic">{group.name}</h1>
          </div>
        </div>
        <div className="flex items-center space-x-4 bg-white/5 p-4 rounded-3xl border border-white/10">
          <div className="flex items-center space-x-2">
            <Users className="w-6 h-6 text-blue-400" />
            <div className="flex flex-col">
              <span className="text-xs uppercase font-black text-gray-500">Squad Size</span>
              <span className="text-xl font-black">{group.members.length} Members</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Chat & Progress */}
        <div className="lg:col-span-2 space-y-8">
          {/* Group Chat */}
          <div className="flex flex-col h-[600px] bg-white/5 border border-white/10 rounded-[40px] overflow-hidden">
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
              <div className="flex items-center space-x-3">
                <MessageSquare className="w-6 h-6 text-blue-400" />
                <h3 className="text-xl font-black uppercase tracking-widest italic">Squad Comms</h3>
              </div>
              <div className="flex items-center space-x-1 text-[10px] uppercase font-black text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>Live</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
              {messages.map((msg, i) => (
                <div key={msg.id} className={`flex ${msg.senderId === user.uid ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] flex flex-col ${msg.senderId === user.uid ? 'items-end' : 'items-start'}`}>
                    <div className={`p-4 rounded-2xl ${
                      msg.senderId === user.uid 
                        ? 'bg-blue-400 text-black font-bold' 
                        : 'bg-white/5 border border-white/10 text-gray-200'
                    }`}>
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="text-[10px] uppercase font-black text-gray-500">{msg.senderName}</span>
                      <span className="text-[10px] uppercase font-black text-gray-600">• {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-6 border-t border-white/10 bg-black/20">
              <div className="flex items-center space-x-4">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Broadcast to squad..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-blue-400 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-4 bg-blue-400 text-black rounded-2xl hover:bg-blue-300 transition-all disabled:opacity-50"
                >
                  <Send className="w-6 h-6" />
                </button>
              </div>
            </form>
          </div>

          {/* Squad Progress Tracker */}
          <div className="p-8 rounded-[40px] bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <BarChart3 className="w-6 h-6 text-blue-400" />
                <h3 className="text-xl font-black uppercase tracking-widest italic">Squad Progression</h3>
              </div>
            </div>
            <div className="space-y-6">
              {members.map((member) => (
                <div key={member.uid} className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest">
                    <span className="text-gray-400">{member.displayName}</span>
                    <span className="text-blue-400">{member.xp} XP</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((member.xp / 5000) * 100, 100)}%` }}
                      className="h-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Squad Info & Challenges */}
        <div className="space-y-8">
          {/* Squad Info */}
          <div className="p-8 rounded-[40px] bg-white/5 border border-white/10">
            <h3 className="text-xl font-black uppercase tracking-widest italic mb-6">Squad Intel</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-8">
              {group.description || "No mission statement provided."}
            </p>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                <span className="text-xs font-black uppercase tracking-widest text-gray-500">Commander</span>
                <span className="text-xs font-black uppercase tracking-widest text-blue-400">
                  {members.find(m => m.uid === group.createdBy)?.displayName || "Unknown"}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                <span className="text-xs font-black uppercase tracking-widest text-gray-500">Joined On</span>
                <span className="text-xs font-black uppercase tracking-widest text-gray-400">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

            {/* Squad Challenges */}
            <div className="p-8 rounded-[40px] bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black uppercase tracking-widest italic">Squad Missions</h3>
                <Zap className="w-5 h-5 text-yellow-400" />
              </div>
              
              <div className="space-y-6">
                {/* Scheduled Challenges */}
                {group.scheduledChallenges && group.scheduledChallenges.length > 0 && (
                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">Scheduled Ops</p>
                    {group.scheduledChallenges.map((challenge) => {
                      const isCompleted = challenge.completedBy?.includes(user.uid);
                      return (
                        <div key={challenge.id} className={`p-4 rounded-2xl border transition-all space-y-3 ${
                          isCompleted 
                            ? 'bg-green-500/10 border-green-500/20' 
                            : 'bg-blue-400/10 border-blue-400/20'
                        }`}>
                          <div className="flex items-center justify-between">
                            <h4 className={`font-bold text-sm ${isCompleted ? 'text-green-400' : 'text-blue-400'}`}>
                              {challenge.questTitle}
                              {isCompleted && <span className="ml-2 text-[8px] bg-green-500 text-black px-2 py-0.5 rounded-full uppercase">Completed</span>}
                            </h4>
                            <Clock className={`w-4 h-4 ${isCompleted ? 'text-green-400' : 'text-blue-400'}`} />
                          </div>
                          <div className="flex items-center justify-between text-[10px] uppercase font-black">
                            <span className="text-gray-400">{new Date(challenge.scheduledFor).toLocaleString()}</span>
                            <span className={isCompleted ? 'text-green-400' : 'text-blue-400'}>+{challenge.xpReward} XP</span>
                          </div>
                          {!isCompleted && (
                            <button 
                              onClick={() => navigate(`/quests/${challenge.questId}`)}
                              className="w-full py-2 bg-blue-400 text-black rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-300 transition-all"
                            >
                              Join Mission
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Static Missions */}
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Global Objectives</p>
                  {[
                    { title: "Market Dominance", desc: "Collect 5000 combined XP", progress: 65 },
                    { title: "Wealth Builders", desc: "Collect 2000 combined Coins", progress: 30 }
                  ].map((challenge, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm">{challenge.title}</h4>
                        <span className="text-[10px] font-black text-yellow-400">{challenge.progress}%</span>
                      </div>
                      <p className="text-[10px] uppercase font-black text-gray-500">{challenge.desc}</p>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-400" style={{ width: `${challenge.progress}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {group.createdBy === user.uid && (
                <button 
                  onClick={() => setShowScheduleModal(true)}
                  className="w-full mt-6 py-4 bg-white/5 border border-white/10 rounded-2xl font-black uppercase text-xs tracking-widest text-gray-400 hover:bg-white/10 transition-all"
                >
                  Schedule Squad Mission
                </button>
              )}
            </div>

          {/* Squad Members List */}
          <div className="p-8 rounded-[40px] bg-white/5 border border-white/10">
            <h3 className="text-xl font-black uppercase tracking-widest italic mb-6">Active Personnel</h3>
            <div className="space-y-4">
              {members.map((member) => (
                <div key={member.uid} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center font-black text-blue-400 text-xs">
                      {member.displayName?.[0]}
                    </div>
                    <span className="text-sm font-bold">{member.displayName}</span>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${Math.random() > 0.5 ? 'bg-green-500' : 'bg-gray-600'}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Schedule Modal */}
      <AnimatePresence>
        {showScheduleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-[40px] p-8 space-y-8"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black uppercase italic tracking-tighter">Schedule <span className="text-blue-400">Mission</span></h3>
                <button onClick={() => setShowScheduleModal(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleScheduleChallenge} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Target Quest</label>
                  <select
                    value={selectedQuestId}
                    onChange={(e) => setSelectedQuestId(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-blue-400 transition-colors appearance-none text-sm"
                  >
                    <option value="" className="bg-zinc-900">Select a quest...</option>
                    {quests.map(q => (
                      <option key={q.id} value={q.id} className="bg-zinc-900">{q.title}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Deployment Date & Time</label>
                  <input
                    type="datetime-local"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-blue-400 transition-colors text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-6 bg-blue-400 text-black rounded-3xl font-black uppercase tracking-widest text-sm hover:bg-blue-300 transition-all shadow-lg shadow-blue-400/20"
                >
                  Deploy Mission
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
