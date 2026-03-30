import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, Coins, Zap, Trophy, Star, CheckCircle2, ShoppingCart, ArrowRight, Sparkles } from 'lucide-react';
import { db, collection, getDocs, doc, updateDoc, OperationType, handleFirestoreError } from '../firebase';
import { ShopItem, UserProfile } from '../types';
import { toast } from 'react-hot-toast';

export default function Shop({ user }: { user: UserProfile }) {
  const [items, setItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const fetchItems = async () => {
      const querySnapshot = await getDocs(collection(db, 'shopItems'));
      const itemsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ShopItem));
      setItems(itemsData);
      setLoading(false);
    };
    fetchItems();
  }, []);

  const handlePurchase = async (item: ShopItem) => {
    if (user.coins < item.price) {
      toast.error("Not enough coins! Complete more quests to earn more.");
      return;
    }

    if (user.ownedItems.includes(item.id)) {
      toast.error("You already own this item!");
      return;
    }

    const userDocRef = doc(db, 'users', user.uid);
    try {
      await updateDoc(userDocRef, {
        coins: user.coins - item.price,
        ownedItems: [...user.ownedItems, item.id]
      });
      toast.success(`Purchased ${item.name}! Check your profile.`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'users');
    }
  };

  const filteredItems = items.filter(i => filter === 'All' || i.type === filter);
  const types = ['All', 'Badge', 'Avatar', 'Theme'];

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-sm font-black uppercase tracking-widest text-blue-400 mb-2">Arena Shop</h2>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic">
            Upgrade your <span className="text-blue-400">Arsenal</span>
          </h1>
        </div>
        <div className="flex items-center space-x-3 bg-blue-400/10 p-6 rounded-3xl border border-blue-400/20">
          <Coins className="w-8 h-8 text-blue-400" />
          <div className="flex flex-col">
            <span className="text-xs uppercase font-black text-gray-500">Your Balance</span>
            <span className="text-3xl font-black text-blue-400">{user.coins}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 bg-white/5 p-4 rounded-3xl border border-white/10">
        {types.map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
              filter === type ? 'bg-blue-400 text-black' : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-96 rounded-3xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredItems.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group relative"
            >
              <div className="h-full p-8 rounded-[40px] bg-white/5 border border-white/10 hover:border-blue-400/50 transition-all flex flex-col items-center text-center">
                <div className="w-32 h-32 bg-blue-400/10 rounded-full flex items-center justify-center mb-8 group-hover:scale-110 transition-transform relative">
                  <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  {item.type === 'Badge' ? <Trophy className="w-16 h-16 text-blue-400 relative" /> : 
                   item.type === 'Avatar' ? <Star className="w-16 h-16 text-blue-400 relative" /> : 
                   <Sparkles className="w-16 h-16 text-blue-400 relative" />}
                </div>

                <div className="flex-1">
                  <span className="text-[10px] uppercase font-black px-3 py-1 bg-blue-400/10 text-blue-400 rounded-full mb-4 inline-block">
                    {item.type}
                  </span>
                  <h3 className="text-2xl font-black mb-3 group-hover:text-blue-400 transition-colors uppercase italic tracking-tight">
                    {item.name}
                  </h3>
                  <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="w-full pt-6 border-t border-white/5">
                  {user.ownedItems.includes(item.id) ? (
                    <div className="w-full py-4 bg-green-500/10 text-green-500 rounded-2xl font-black uppercase text-sm tracking-widest flex items-center justify-center space-x-2">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Owned</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handlePurchase(item)}
                      className="w-full py-4 bg-blue-400 text-black rounded-2xl font-black uppercase text-sm tracking-widest hover:bg-blue-300 transition-all flex items-center justify-center space-x-2 shadow-[0_0_20px_rgba(96,165,250,0.2)]"
                    >
                      <Coins className="w-5 h-5" />
                      <span>{item.price} Coins</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
