import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Coins, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  PlayCircle, 
  Trophy, 
  Star, 
  BookOpen, 
  HelpCircle,
  ArrowRight,
  Sparkles,
  Volume2,
  X,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Send
} from 'lucide-react';
import { db, doc, getDoc, updateDoc, collection, addDoc, OperationType, handleFirestoreError } from '../firebase';
import { Quest, UserProfile, QuizQuestion, QuestFeedback } from '../types';
import { toast } from 'react-hot-toast';
import { generateVictoryTheme } from '../services/musicService';
import { trackEvent } from '../services/analyticsService';
import { submitQuestFeedback } from '../services/feedbackService';

export default function QuestDetail({ user }: { user: UserProfile }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quest, setQuest] = useState<Quest | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0); // 0 to n-1: Lessons, n: Quiz
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [victoryAudio, setVictoryAudio] = useState<string | null>(null);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  useEffect(() => {
    const fetchQuest = async () => {
      if (!id) return;
      const questDoc = await getDoc(doc(db, 'quests', id));
      if (questDoc.exists()) {
        const questData = { id: questDoc.id, ...questDoc.data() } as Quest;
        setQuest(questData);
        trackEvent(user.uid, 'quest_started', { questId: questData.id, title: questData.title });
      }
      setLoading(false);
    };
    fetchQuest();
  }, [id, user.uid]);

  const handleNext = () => {
    if (quest && currentStep < quest.lessons.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleQuizSubmit = async () => {
    if (!quest) return;
    
    let correctCount = 0;
    const incorrectQuestions: string[] = [];

    quest.quiz.forEach((q, i) => {
      if (quizAnswers[i] === q.correctAnswer) {
        correctCount++;
      } else {
        incorrectQuestions.push(q.id);
      }
    });

    const finalScore = Math.round((correctCount / quest.quiz.length) * 100);
    setScore(finalScore);
    setQuizCompleted(true);

    if (finalScore >= 70) {
      // Quest Completed!
      toast.success(`Quest Completed! You earned ${quest.xpReward} XP and ${quest.coinReward} Coins!`);
      trackEvent(user.uid, 'quest_completed', { questId: quest.id, score: finalScore });
      
      // Save incorrect answers for review
      for (const qId of incorrectQuestions) {
        try {
          await addDoc(collection(db, 'reviewItems'), {
            userId: user.uid,
            questionId: qId,
            questId: quest.id,
            nextReview: new Date(Date.now() + 86400000).toISOString(), // Review in 1 day
            interval: 1,
            easeFactor: 2.5,
            repetitions: 0
          });
        } catch (e) {
          console.error("Error saving review item:", e);
        }
      }

      // Generate Victory Theme
      const audioUrl = await generateVictoryTheme();
      if (audioUrl) setVictoryAudio(audioUrl);

      if (!user.completedQuests.includes(quest.id)) {
        const userDocRef = doc(db, 'users', user.uid);
        try {
          await updateDoc(userDocRef, {
            xp: user.xp + quest.xpReward,
            coins: user.coins + quest.coinReward,
            completedQuests: [...user.completedQuests, quest.id]
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.UPDATE, 'users');
        }
      }
    } else {
      toast.error(`Score: ${finalScore}%. You need 70% to pass. Try again!`);
      trackEvent(user.uid, 'quiz_failed', { questId: quest.id, score: finalScore });
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!quest || feedbackRating === 0) return;
    
    const success = await submitQuestFeedback({
      questId: quest.id,
      userId: user.uid,
      rating: feedbackRating,
      comment: feedbackComment
    });

    if (success) {
      setFeedbackSubmitted(true);
      toast.success('Thank you for your feedback!');
    } else {
      toast.error('Failed to submit feedback. Please try again.');
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Zap className="w-12 h-12 text-yellow-400 animate-pulse" /></div>;
  if (!quest) return <div className="text-center py-20">Quest not found.</div>;

  const isQuiz = currentStep === quest.lessons.length;
  const currentLesson = !isQuiz ? quest.lessons[currentStep] : null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/quests')} className="p-2 hover:bg-white/5 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-widest text-gray-500">
          {quest.syllabusTag && (
            <span className="px-2 py-1 bg-blue-400/10 text-blue-400 rounded border border-blue-400/20">{quest.syllabusTag}</span>
          )}
          <span className="px-2 py-1 bg-yellow-400/10 text-yellow-400 rounded">{quest.category}</span>
          <span>•</span>
          <span>Step {currentStep + 1} of {quest.lessons.length + 1}</span>
        </div>
        <div className="w-10" />
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${((currentStep + 1) / (quest.lessons.length + 1)) * 100}%` }}
          className="h-full bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]"
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="p-8 md:p-12 rounded-[40px] bg-white/5 border border-white/10 shadow-2xl"
        >
          {!isQuiz ? (
            <div className="space-y-8">
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 bg-yellow-400/10 rounded-2xl">
                  <BookOpen className="w-8 h-8 text-yellow-400" />
                </div>
                <h2 className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic">{currentLesson?.title}</h2>
              </div>
              <div className="prose prose-invert max-w-none">
                <p className="text-lg text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {currentLesson?.content}
                </p>
              </div>
              <div className="pt-8 flex justify-between items-center border-t border-white/5">
                <button
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  className="px-6 py-3 rounded-full font-black uppercase text-xs tracking-widest border border-white/10 hover:bg-white/5 transition-all disabled:opacity-20"
                >
                  Previous
                </button>
                <button
                  onClick={handleNext}
                  className="px-8 py-4 bg-yellow-400 text-black rounded-full font-black uppercase text-sm tracking-widest hover:bg-yellow-300 transition-all flex items-center space-x-2"
                >
                  <span>Next Step</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : !quizCompleted ? (
            <div className="space-y-12">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-400/10 rounded-2xl">
                  <HelpCircle className="w-8 h-8 text-blue-400" />
                </div>
                <h2 className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic">Final Challenge</h2>
              </div>

              <div className="space-y-12">
                {quest.quiz.map((q, qIndex) => (
                  <div key={q.id} className="space-y-6">
                    <h3 className="text-xl font-bold flex items-start space-x-4">
                      <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-sm font-black text-yellow-400">{qIndex + 1}</span>
                      <span>{q.question}</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {q.options.map((option, oIndex) => (
                        <button
                          key={oIndex}
                          onClick={() => {
                            const newAnswers = [...quizAnswers];
                            newAnswers[qIndex] = oIndex;
                            setQuizAnswers(newAnswers);
                          }}
                          className={`p-5 rounded-2xl text-left border transition-all ${
                            quizAnswers[qIndex] === oIndex
                              ? 'bg-yellow-400 border-yellow-400 text-black font-bold'
                              : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-12 flex justify-between items-center border-t border-white/5">
                <button
                  onClick={handlePrev}
                  className="px-6 py-3 rounded-full font-black uppercase text-xs tracking-widest border border-white/10 hover:bg-white/5 transition-all"
                >
                  Back to Lesson
                </button>
                <button
                  onClick={handleQuizSubmit}
                  disabled={quizAnswers.length < quest.quiz.length || quizAnswers.includes(undefined as any)}
                  className="px-10 py-5 bg-yellow-400 text-black rounded-full font-black uppercase text-lg tracking-widest hover:bg-yellow-300 transition-all shadow-[0_0_30px_rgba(250,204,21,0.3)] disabled:opacity-50"
                >
                  Submit Answers
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-12">
              <div className="text-center space-y-6 py-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 10 }}
                  className={`w-32 h-32 rounded-full flex items-center justify-center mx-auto shadow-2xl ${
                    score >= 70 ? 'bg-yellow-400 shadow-yellow-400/30' : 'bg-red-500 shadow-red-500/30'
                  }`}
                >
                  {score >= 70 ? <Trophy className="w-16 h-16 text-black" /> : <X className="w-16 h-16 text-white" />}
                </motion.div>
                
                <div>
                  <h2 className="text-5xl font-black uppercase tracking-tighter italic mb-2">
                    {score >= 70 ? 'Quest Conquered!' : 'Defeated!'}
                  </h2>
                  <p className="text-xl text-gray-400 font-medium italic">Your Score: {score}%</p>
                </div>

                {score >= 70 && (
                  <div className="flex flex-col items-center space-y-4">
                    <div className="flex items-center space-x-6 bg-white/5 p-6 rounded-3xl border border-white/10">
                      <div className="flex items-center space-x-2 text-yellow-400">
                        <Zap className="w-6 h-6" />
                        <span className="text-2xl font-black">+{quest.xpReward} XP</span>
                      </div>
                      <div className="w-px h-8 bg-white/10" />
                      <div className="flex items-center space-x-2 text-blue-400">
                        <Coins className="w-6 h-6" />
                        <span className="text-2xl font-black">+{quest.coinReward}</span>
                      </div>
                    </div>
                    
                    {victoryAudio && (
                      <div className="flex items-center space-x-3 text-yellow-400 animate-bounce mt-4">
                        <Volume2 className="w-5 h-5" />
                        <span className="text-xs font-black uppercase tracking-widest">Victory Theme Playing</span>
                        <audio src={victoryAudio} autoPlay />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Detailed Feedback */}
              <div className="space-y-8">
                <h3 className="text-2xl font-black uppercase tracking-widest italic border-b border-white/10 pb-4">
                  Review Your Performance
                </h3>
                <div className="space-y-6">
                  {quest.quiz.map((q, i) => (
                    <div 
                      key={q.id} 
                      className={`p-6 rounded-3xl border ${
                        quizAnswers[i] === q.correctAnswer 
                          ? 'bg-green-500/5 border-green-500/20' 
                          : 'bg-red-500/5 border-red-500/20'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-4">
                          <div className={`mt-1 p-1.5 rounded-lg ${
                            quizAnswers[i] === q.correctAnswer ? 'bg-green-500 text-black' : 'bg-red-500 text-white'
                          }`}>
                            {quizAnswers[i] === q.correctAnswer ? <CheckCircle2 className="w-4 h-4" /> : <X className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="font-bold text-lg leading-tight mb-2">{q.question}</p>
                            <div className="flex flex-wrap gap-2 text-xs font-black uppercase tracking-widest">
                              <span className="text-gray-500">Your Answer:</span>
                              <span className={quizAnswers[i] === q.correctAnswer ? 'text-green-400' : 'text-red-400'}>
                                {q.options[quizAnswers[i]]}
                              </span>
                              {quizAnswers[i] !== q.correctAnswer && (
                                <>
                                  <span className="text-gray-500">Correct:</span>
                                  <span className="text-green-400">{q.options[q.correctAnswer]}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 p-4 bg-white/5 rounded-2xl text-sm text-gray-400 leading-relaxed italic border border-white/5">
                        <div className="flex items-center space-x-2 mb-2 text-yellow-400/50">
                          <span className="text-[10px] font-black uppercase tracking-widest">Insight & Review</span>
                        </div>
                        <p className="mb-3">{q.explanation}</p>
                        {quizAnswers[i] !== q.correctAnswer && (
                          <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                            <p className="text-[10px] font-black uppercase tracking-widest text-red-400 mb-1">Recommended Review</p>
                            <p className="text-xs text-gray-300">
                              Go back to the lesson <span className="text-white font-bold">"{quest.lessons[0].title}"</span> to strengthen your understanding of this concept.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quest Feedback Section */}
              <div className="pt-12 border-t border-white/10">
                {!feedbackSubmitted ? (
                  <div className="bg-white/5 p-8 rounded-[32px] border border-white/10 space-y-6">
                    <div className="flex items-center space-x-3">
                      <MessageSquare className="w-6 h-6 text-yellow-400" />
                      <h3 className="text-xl font-black uppercase tracking-tighter italic">How was this quest?</h3>
                    </div>
                    <p className="text-gray-400 text-sm italic">Your feedback helps us make EconQuest better for everyone.</p>
                    
                    <div className="flex items-center space-x-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setFeedbackRating(star)}
                          className={`p-2 rounded-xl transition-all ${
                            feedbackRating >= star ? 'text-yellow-400 bg-yellow-400/10' : 'text-gray-600 hover:text-gray-400'
                          }`}
                        >
                          <Star className={`w-8 h-8 ${feedbackRating >= star ? 'fill-current' : ''}`} />
                        </button>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <textarea
                        value={feedbackComment}
                        onChange={(e) => setFeedbackComment(e.target.value)}
                        placeholder="Any specific thoughts? (Optional)"
                        className="w-full bg-black/30 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-yellow-400/50 transition-all resize-none h-24"
                      />
                      <button
                        onClick={handleFeedbackSubmit}
                        disabled={feedbackRating === 0}
                        className="w-full py-4 bg-yellow-400 text-black rounded-full font-black uppercase text-xs tracking-widest hover:bg-yellow-300 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                      >
                        <Send className="w-4 h-4" />
                        <span>Submit Feedback</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-green-500/10 p-8 rounded-[32px] border border-green-500/20 text-center space-y-2">
                    <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
                    <h3 className="text-xl font-black uppercase tracking-tighter italic text-green-500">Feedback Received!</h3>
                    <p className="text-green-500/60 text-sm italic">Thank you for helping us improve.</p>
                  </div>
                )}
              </div>

              <div className="pt-12 flex flex-col sm:flex-row gap-4 justify-center border-t border-white/10">
                <button
                  onClick={() => navigate('/quests')}
                  className="px-10 py-5 bg-white/5 border border-white/10 rounded-full font-black uppercase text-sm tracking-widest hover:bg-white/10 transition-all"
                >
                  Back to Arena
                </button>
                {score < 70 && (
                  <button
                    onClick={() => {
                      setQuizCompleted(false);
                      setQuizAnswers([]);
                      setCurrentStep(quest.lessons.length); // Stay on quiz
                    }}
                    className="px-10 py-5 bg-yellow-400 text-black rounded-full font-black uppercase text-sm tracking-widest hover:bg-yellow-300 transition-all shadow-lg"
                  >
                    Try Again
                  </button>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
