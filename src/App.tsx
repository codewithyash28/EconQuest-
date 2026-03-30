import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { 
  LayoutDashboard, 
  BookOpen, 
  ShoppingBag, 
  Trophy, 
  MessageSquare, 
  Mic, 
  Image as ImageIcon, 
  LogOut, 
  User, 
  Zap, 
  Coins, 
  TrendingUp,
  Menu,
  X,
  PlayCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  collection, 
  getDocs,
  OperationType,
  handleFirestoreError
} from './firebase';
import { UserProfile, Quest, ShopItem, Achievement } from './types';

// Pages
import Dashboard from './pages/Dashboard';
import Quests from './pages/Quests';
import QuestDetail from './pages/QuestDetail';
import Shop from './pages/Shop';
import Achievements from './pages/Achievements';
import Landing from './pages/Landing';
import Leaderboard from './pages/Leaderboard';
import Groups from './pages/Groups';
import GroupDetail from './pages/GroupDetail';
import AdminDashboard from './pages/AdminDashboard';
import About from './pages/About';
import Review from './pages/Review';

// Components
import Navbar from './components/Navbar';
import ChatBot from './components/ChatBot';
import LiveTutor from './components/LiveTutor';
import GuidedTour from './components/GuidedTour';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleOnline = () => toast.success('Back online!');
    const handleOffline = () => toast.error('You are offline. Some features may not work.', { duration: 5000 });

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        try {
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userData = userDoc.data() as UserProfile;
            setUser(userData);
          } else {
            // Create new user profile
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              displayName: firebaseUser.displayName,
              email: firebaseUser.email,
              xp: 0,
              coins: 100,
              streak: 1,
              lastLogin: new Date().toISOString(),
              completedQuests: [],
              ownedItems: [],
              achievements: [],
              role: firebaseUser.email === 'codewithyash28@gmail.com' ? 'admin' : 'student',
              onboardingCompleted: false,
              completedTour: false
            };
            await setDoc(userDocRef, newProfile);
            setUser(newProfile);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, 'users');
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success('Successfully logged in!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to log in.');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out.');
    } catch (error) {
      console.error(error);
      toast.error('Failed to log out.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0a0a0a] text-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Zap className="w-12 h-12 text-yellow-400" />
        </motion.div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-yellow-400 selection:text-black">
        <Toaster position="bottom-right" />
        
        {user && <Navbar user={user} onLogout={handleLogout} />}

        <main className={user ? "pt-20 pb-12 px-4 max-w-7xl mx-auto" : ""}>
          <Routes>
            <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing onLogin={handleLogin} />} />
            <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/" />} />
            <Route path="/quests" element={user ? <Quests user={user} /> : <Navigate to="/" />} />
            <Route path="/quests/:id" element={user ? <QuestDetail user={user} /> : <Navigate to="/" />} />
            <Route path="/shop" element={user ? <Shop user={user} /> : <Navigate to="/" />} />
            <Route path="/achievements" element={user ? <Achievements user={user} /> : <Navigate to="/" />} />
            <Route path="/leaderboard" element={user ? <Leaderboard /> : <Navigate to="/" />} />
            <Route path="/groups" element={user ? <Groups user={user} /> : <Navigate to="/" />} />
            <Route path="/groups/:id" element={user ? <GroupDetail user={user} /> : <Navigate to="/" />} />
            <Route path="/admin" element={user?.role === 'admin' ? <AdminDashboard user={user} /> : <Navigate to="/dashboard" />} />
            <Route path="/about" element={<About />} />
            <Route path="/review" element={user ? <Review user={user} /> : <Navigate to="/" />} />
          </Routes>
        </main>

        {user && <ChatBot />}
        {user && <LiveTutor />}
        {user && <GuidedTour user={user} />}
      </div>
    </Router>
  );
}
