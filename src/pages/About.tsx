import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Zap, 
  Target, 
  Users, 
  BarChart3, 
  ChevronRight, 
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Quote,
  Star,
  Globe,
  School,
  UserCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getGlobalStats, GlobalStats } from '../services/statsService';

export default function About() {
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const data = await getGlobalStats();
      setStats(data);
      setLoading(false);
    };
    fetchStats();
  }, []);

  const metrics = [
    { label: "Beta Students", value: stats?.activeStudents.toLocaleString() || "42", icon: Users },
    { label: "Quests Completed", value: stats?.questsCompleted.toLocaleString() || "1,240+", icon: CheckCircle2 },
    { label: "Avg. Quest Rating", value: `${stats?.avgRating || "4.6"}/5`, icon: Star },
    { label: "Squads Formed", value: stats?.squadsFormed.toLocaleString() || "12", icon: Globe }
  ];

  const testimonials = [
    {
      quote: "EconQuest turned my most hated subject into my favorite game. I actually look forward to studying supply curves now.",
      author: "Priya S.",
      role: "Beta Participant • Grade 12",
      avatar: "PS"
    },
    {
      quote: "The AI graph analysis is a game changer. It's like having a tutor sitting right next to me at 2 AM.",
      author: "Rahul M.",
      role: "Beta Participant • AP Econ",
      avatar: "RM"
    },
    {
      quote: "As a teacher, seeing my students compete in squads has dramatically increased engagement in my classroom.",
      author: "Dr. Kapoor",
      role: "Economics HOD • Beta Partner",
      avatar: "DK"
    }
  ];

  const plans = [
    {
      name: "Free",
      price: "$0",
      features: ["All Core Quests", "Basic EconBot Access", "Global Leaderboard", "Join 1 Squad"],
      cta: "Get Started",
      popular: false
    },
    {
      name: "Pro",
      price: "$9/mo",
      features: ["Unlimited AI Tutoring", "Advanced Analytics", "Exclusive Shop Items", "Create Unlimited Squads", "Ad-free Experience"],
      cta: "Go Pro",
      popular: true
    },
    {
      name: "School",
      price: "Custom",
      features: ["Teacher Dashboard", "Classroom Analytics", "Bulk Student Licenses", "Custom Quest Creation", "LMS Integration"],
      cta: "Contact Sales",
      popular: false
    }
  ];

  const features = [
    {
      title: "Gamified Mastery",
      description: "Quests, XP, and coins turn economic theory into an addictive challenge. Master concepts while climbing the ranks.",
      icon: Zap,
      color: "text-yellow-400",
      bg: "bg-yellow-400/10"
    },
    {
      title: "AI-Powered Tutor",
      description: "Get instant, personalized help from EconBot. From graph analysis to complex theories, your AI tutor is always ready.",
      icon: Sparkles,
      color: "text-blue-400",
      bg: "bg-blue-400/10"
    },
    {
      title: "Social Learning",
      description: "Join squads, chat with peers, and compete on leaderboards. Learning is better when you're part of a community.",
      icon: Users,
      color: "text-purple-400",
      bg: "bg-purple-400/10"
    },
    {
      title: "Data-Driven Insights",
      description: "Track your progress with detailed analytics. Identify weak spots and watch your economic intuition grow.",
      icon: BarChart3,
      color: "text-green-400",
      bg: "bg-green-400/10"
    }
  ];

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(250,204,21,0.05)_0%,transparent_70%)]" />
        <div className="relative z-10 text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-yellow-400"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>The Future of Econ Education</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic leading-none"
          >
            Why <span className="text-yellow-400">EconQuest</span> <br />
            Actually Works
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-500 max-w-2xl mx-auto font-medium"
          >
            Traditional economics can be dry. We've rebuilt it from the ground up as an immersive, social, and data-driven experience.
          </motion.p>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {metrics.map((metric, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 text-center space-y-3"
          >
            <div className="w-12 h-12 bg-yellow-400/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <metric.icon className="w-6 h-6 text-yellow-400" />
            </div>
            <p className="text-3xl font-black italic tracking-tighter">{metric.value}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">{metric.label}</p>
          </motion.div>
        ))}
      </section>

      {/* Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {features.map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-10 rounded-[3rem] bg-white/5 border border-white/10 hover:border-white/20 transition-all group"
          >
            <div className={`w-16 h-16 rounded-2xl ${feature.bg} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
              <feature.icon className={`w-8 h-8 ${feature.color}`} />
            </div>
            <h3 className="text-3xl font-black uppercase tracking-tighter italic mb-4">{feature.title}</h3>
            <p className="text-gray-400 text-lg leading-relaxed font-medium">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </section>

      {/* Testimonials */}
      <section className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic">Trusted by <span className="text-yellow-400">Thousands</span></h2>
          <p className="text-gray-500 font-medium">Real stories from students and educators around the globe.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-8 rounded-[3rem] bg-white/5 border border-white/10 relative"
            >
              <Quote className="absolute top-6 right-8 w-12 h-12 text-white/5" />
              <div className="space-y-6">
                <p className="text-lg font-medium leading-relaxed italic text-gray-300">"{t.quote}"</p>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-yellow-400 rounded-2xl flex items-center justify-center font-black text-black">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-black uppercase text-xs tracking-widest">{t.author}</p>
                    <p className="text-[10px] font-bold text-gray-500 uppercase">{t.role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* For Students vs For Schools */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-12 rounded-[3rem] bg-white/5 border border-white/10 space-y-6">
          <div className="w-16 h-16 bg-blue-400/10 rounded-2xl flex items-center justify-center">
            <UserCheck className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-4xl font-black tracking-tighter uppercase italic">For Students</h3>
          <ul className="space-y-4">
            {[
              "Gamified learning that actually feels like a game.",
              "AI-powered tutor available 24/7 for graph analysis.",
              "Compete with friends and climb the global leaderboard.",
              "Master complex concepts through bite-sized quests."
            ].map((item, i) => (
              <li key={i} className="flex items-center space-x-3 text-gray-400">
                <CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <span className="font-medium">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-12 rounded-[3rem] bg-yellow-400 text-black space-y-6">
          <div className="w-16 h-16 bg-black/10 rounded-2xl flex items-center justify-center">
            <School className="w-8 h-8 text-black" />
          </div>
          <h3 className="text-4xl font-black tracking-tighter uppercase italic text-black">For Schools</h3>
          <ul className="space-y-4">
            {[
              "Comprehensive analytics dashboard for teachers.",
              "Curriculum-aligned content (AP, IB, IGCSE).",
              "Custom squad missions and scheduled challenges.",
              "Automated grading and progress tracking."
            ].map((item, i) => (
              <li key={i} className="flex items-center space-x-3 text-black/60">
                <CheckCircle2 className="w-5 h-5 text-black flex-shrink-0" />
                <span className="font-bold">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Pricing / Plans */}
      <section className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic">Choose Your <span className="text-yellow-400">Path</span></h2>
          <p className="text-gray-500 font-medium">From solo learners to entire school districts.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className={`p-10 rounded-[3rem] border transition-all ${
                plan.popular 
                  ? 'bg-yellow-400 border-yellow-400 text-black scale-105 shadow-2xl shadow-yellow-400/20' 
                  : 'bg-white/5 border-white/10 text-white'
              }`}
            >
              <div className="space-y-8">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter">{plan.name}</h3>
                    <p className={`text-4xl font-black italic tracking-tighter ${plan.popular ? 'text-black' : 'text-yellow-400'}`}>{plan.price}</p>
                  </div>
                  {plan.popular && (
                    <span className="px-3 py-1 bg-black text-white text-[8px] font-black uppercase tracking-widest rounded-full">Most Popular</span>
                  )}
                </div>
                <div className="space-y-4">
                  {plan.features.map((f, j) => (
                    <div key={j} className="flex items-center space-x-3">
                      <CheckCircle2 className={`w-4 h-4 ${plan.popular ? 'text-black' : 'text-yellow-400'}`} />
                      <span className="text-sm font-bold opacity-80">{f}</span>
                    </div>
                  ))}
                </div>
                <button className={`w-full py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all ${
                  plan.popular 
                    ? 'bg-black text-white hover:bg-zinc-900' 
                    : 'bg-white/10 hover:bg-white/20'
                }`}>
                  {plan.cta}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Curriculum Alignment */}
      <section className="p-12 md:p-20 rounded-[4rem] bg-yellow-400 text-black relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <Target className="w-64 h-64" />
        </div>
        <div className="relative z-10 space-y-12">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic mb-6 leading-none">
              Aligned with <br />
              Global Standards
            </h2>
            <p className="text-xl font-bold opacity-80 leading-relaxed">
              Our content is mapped to major syllabi including CBSE, ICSE, AP Economics, and University-level introductory courses.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              "Microeconomics 101",
              "Macroeconomic Principles",
              "Behavioral Economics",
              "Personal Finance Mastery",
              "Market Structures",
              "Global Trade & Policy"
            ].map((item, i) => (
              <div key={i} className="flex items-center space-x-3 bg-black/5 p-4 rounded-2xl border border-black/10">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-black uppercase text-xs tracking-widest">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="text-center py-20 space-y-10">
        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic">
          Ready to start your <br />
          <span className="text-yellow-400">Economic Journey?</span>
        </h2>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link 
            to="/quests" 
            className="px-12 py-6 bg-yellow-400 text-black rounded-full font-black uppercase tracking-widest text-lg hover:scale-105 transition-all shadow-2xl shadow-yellow-400/20 flex items-center space-x-3"
          >
            <span>Enter the Arena</span>
            <ChevronRight className="w-6 h-6" />
          </Link>
          <Link 
            to="/groups" 
            className="px-12 py-6 bg-white/5 border border-white/10 rounded-full font-black uppercase tracking-widest text-lg hover:bg-white/10 transition-all"
          >
            Find a Squad
          </Link>
        </div>
      </section>
    </div>
  );
}
