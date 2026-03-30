import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Plus, Search, ChevronRight, User, MessageSquare, Zap, Target, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { db, collection, getDocs, setDoc, doc, updateDoc, OperationType, handleFirestoreError } from '../firebase';
import { StudyGroup, UserProfile } from '../types';
import { toast } from 'react-hot-toast';

export default function Groups({ user }: { user: UserProfile }) {
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGroups = async () => {
      const querySnapshot = await getDocs(collection(db, 'groups'));
      const groupsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StudyGroup));
      setGroups(groupsData);
      setLoading(false);
    };
    fetchGroups();
  }, []);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    const groupId = Math.random().toString(36).substring(2, 15);
    const newGroup: StudyGroup = {
      id: groupId,
      name: newGroupName,
      description: newGroupDesc,
      createdBy: user.uid,
      members: [user.uid],
      challenges: []
    };

    try {
      await setDoc(doc(db, 'groups', groupId), newGroup);
      setGroups([...groups, newGroup]);
      setIsModalOpen(false);
      setNewGroupName('');
      setNewGroupDesc('');
      toast.success(`Group "${newGroupName}" created!`);
      navigate(`/groups/${groupId}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'groups');
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return;

    if (group.members.includes(user.uid)) {
      navigate(`/groups/${groupId}`);
      return;
    }

    const updatedMembers = [...group.members, user.uid];
    try {
      await updateDoc(doc(db, 'groups', groupId), { members: updatedMembers });
      toast.success(`Joined ${group.name}!`);
      navigate(`/groups/${groupId}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'groups');
    }
  };

  const filteredGroups = groups.filter(g => 
    g.name.toLowerCase().includes(search.toLowerCase()) || 
    g.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-sm font-black uppercase tracking-widest text-blue-400 mb-2">Study Arena</h2>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic">
            Join a <span className="text-blue-400">Squad</span>
          </h1>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-3 bg-blue-400 text-black px-8 py-4 rounded-3xl font-black uppercase tracking-widest hover:bg-blue-300 transition-all shadow-[0_0_30px_rgba(96,165,250,0.3)]"
        >
          <Plus className="w-6 h-6" />
          <span>Form New Squad</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-white/5 p-6 rounded-3xl border border-white/10">
        <div className="flex items-center space-x-4">
          <Users className="w-6 h-6 text-blue-400" />
          <h3 className="text-xl font-black uppercase tracking-widest italic">Active Squads</h3>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search squads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-full pl-12 pr-6 py-3 text-sm focus:outline-none focus:border-blue-400 transition-colors"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-[40px] bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredGroups.map((group, i) => (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="group relative"
            >
              <div className="h-full p-8 rounded-[40px] bg-white/5 border border-white/10 hover:border-blue-400/50 transition-all flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2 text-blue-400">
                    <Users className="w-5 h-5" />
                    <span className="text-xs font-black uppercase tracking-widest">{group.members.length} Members</span>
                  </div>
                  {group.members.includes(user.uid) && (
                    <span className="text-[10px] uppercase font-black px-2 py-1 bg-green-500/10 text-green-500 rounded">Member</span>
                  )}
                </div>

                <h3 className="text-2xl font-black mb-4 group-hover:text-blue-400 transition-colors leading-tight uppercase italic tracking-tight">
                  {group.name}
                </h3>
                <p className="text-gray-400 text-sm mb-8 line-clamp-2 flex-1 leading-relaxed">
                  {group.description}
                </p>

                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                  <button
                    onClick={() => handleJoinGroup(group.id)}
                    className={`px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest transition-all flex items-center space-x-2 ${
                      group.members.includes(user.uid)
                        ? 'bg-white/5 text-gray-400 hover:bg-white/10'
                        : 'bg-blue-400 text-black hover:bg-blue-300'
                    }`}
                  >
                    <span>{group.members.includes(user.uid) ? 'Enter Arena' : 'Join Squad'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Group Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-[#1a1a1a] border border-white/10 rounded-[40px] p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-400/10 rounded-2xl text-blue-400">
                    <Plus className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter italic">Form New Squad</h3>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-500 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleCreateGroup} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-4">Squad Name</label>
                  <input
                    type="text"
                    required
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="Enter a legendary name..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-blue-400 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-4">Description</label>
                  <textarea
                    rows={4}
                    value={newGroupDesc}
                    onChange={(e) => setNewGroupDesc(e.target.value)}
                    placeholder="What's your squad's mission?"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-blue-400 transition-colors resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-5 bg-blue-400 text-black font-black uppercase tracking-widest rounded-2xl hover:bg-blue-300 transition-all shadow-[0_0_30px_rgba(96,165,250,0.3)]"
                >
                  Create Squad
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
