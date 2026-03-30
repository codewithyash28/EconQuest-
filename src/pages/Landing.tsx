import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Zap, BookOpen, Trophy, PlayCircle, TrendingUp, ShieldCheck, Star, Users, CheckCircle2, Quote } from 'lucide-react';
import { getGlobalStats, GlobalStats } from '../services/statsService';

export default function Landing({ onLogin }: { onLogin: () => void }) {
  const [stats, setStats] = useState<GlobalStats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const data = await getGlobalStats();
      setStats(data);
    };
    fetchStats();
  }, []);

  const metrics = [
    { label: "Beta Students", value: stats?.activeStudents.toLocaleString() || "42", icon: Users },
    { label: "Quests Completed", value: stats?.questsCompleted.toLocaleString() || "1,240+", icon: CheckCircle2 },
    { label: "Avg. Quest Rating", value: `${stats?.avgRating || "4.6"}/5`, icon: Star },
    { label: "Squads Formed", value: stats?.squadsFormed.toLocaleString() || "12", icon: Trophy }
  ];
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-center text-center px-4">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10"
        >
          <div className="flex items-center justify-center mb-6">
            <Zap className="w-12 h-12 text-yellow-400 mr-4" />
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic">
              Econ<span className="text-yellow-400">Quest</span>
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto mb-10 font-light leading-relaxed">
            Master the forces of the market. Conquer economic challenges. 
            Level up your financial intelligence in the ultimate gamified learning arena.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onLogin}
              className="px-10 py-5 bg-yellow-400 text-black font-bold text-xl rounded-full hover:bg-yellow-300 transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(250,204,21,0.3)]"
            >
              START YOUR QUEST
            </button>
            <button className="px-10 py-5 border-2 border-white/20 font-bold text-xl rounded-full hover:bg-white/10 transition-all">
              EXPLORE ARENA
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center"
        >
          <span className="text-xs uppercase tracking-widest text-gray-500 mb-2">Scroll to discover</span>
          <div className="w-px h-12 bg-gradient-to-b from-yellow-400 to-transparent" />
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            {
              icon: BookOpen,
              title: "Immersive Quests",
              desc: "Learn micro, macro, and behavioral economics through story-driven modules."
            },
            {
              icon: Trophy,
              title: "Earn & Conquer",
              desc: "Gain XP and coins for every challenge you beat. Climb the global leaderboard."
            },
            {
              icon: TrendingUp,
              title: "Real-World Sim",
              desc: "Apply your knowledge in market simulations and see the impact of your decisions."
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-yellow-400/50 transition-colors group"
            >
              <feature.icon className="w-12 h-12 text-yellow-400 mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 px-4 max-w-7xl mx-auto border-t border-white/5">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-yellow-400/10 text-yellow-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-yellow-400/20">
            <ShieldCheck className="w-3 h-3" />
            <span>Closed Beta Live</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic">Real Student <span className="text-yellow-400">Proof</span></h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
          {metrics.map((metric, i) => (
            <div key={i} className="text-center space-y-2">
              <metric.icon className="w-8 h-8 text-yellow-400 mx-auto mb-4 opacity-50" />
              <p className="text-4xl font-black italic tracking-tighter">{metric.value}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">{metric.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { quote: "EconQuest turned my most hated subject into my favorite game.", author: "Priya S.", role: "Grade 12 Beta Participant" },
            { quote: "The AI graph analysis is a game changer for my students.", author: "Dr. Kapoor", role: "Economics HOD" },
            { quote: "Actually look forward to studying supply curves now.", author: "Rahul M.", role: "AP Econ Beta Participant" }
          ].map((t, i) => (
            <div key={i} className="p-8 rounded-3xl bg-white/5 border border-white/10 relative">
              <Quote className="absolute top-6 right-8 w-8 h-8 text-white/5" />
              <p className="text-lg font-medium italic text-gray-300 mb-6">"{t.quote}"</p>
              <div>
                <p className="font-black uppercase text-xs tracking-widest">{t.author}</p>
                <p className="text-[10px] font-bold text-gray-500 uppercase">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Demo Login Section */}
      <section className="py-20 bg-yellow-400 text-black text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-4xl md:text-6xl font-black mb-8 uppercase italic tracking-tighter">
            Ready to become an Econ Master?
          </h2>
          <p className="text-xl mb-10 font-medium opacity-80">
            Join thousands of students mastering the economy through play.
          </p>
          <button
            onClick={onLogin}
            className="px-12 py-6 bg-black text-white font-bold text-2xl rounded-full hover:bg-gray-900 transition-all shadow-2xl"
          >
            DEMO LOGIN (GOOGLE)
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10 text-center text-gray-500 text-sm">
        <p>&copy; 2026 EconQuest Arena. All rights reserved. Powered by Google AI Studio.</p>
      </footer>
    </div>
  );
}
