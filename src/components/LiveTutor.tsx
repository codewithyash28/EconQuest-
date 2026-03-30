import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, X, Zap, Bot, Volume2, Sparkles } from 'lucide-react';
import { connectToLiveTutor } from '../services/liveService';
import { toast } from 'react-hot-toast';

export default function LiveTutor() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [session, setSession] = useState<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startSession = async () => {
    setIsConnecting(true);
    try {
      const s = await connectToLiveTutor({
        onopen: () => {
          setIsConnected(true);
          setIsConnecting(false);
          toast.success("Connected to Live Tutor!");
          startAudioCapture();
        },
        onmessage: (message) => {
          const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (base64Audio) {
            playAudio(base64Audio);
          }
        },
        onerror: (err) => {
          console.error(err);
          toast.error("Live Tutor connection error.");
          stopSession();
        },
        onclose: () => {
          setIsConnected(false);
          stopSession();
        }
      });
      setSession(s);
    } catch (error) {
      console.error(error);
      setIsConnecting(false);
    }
  };

  const stopSession = () => {
    session?.close();
    setSession(null);
    setIsConnected(false);
    streamRef.current?.getTracks().forEach(track => track.stop());
    audioContextRef.current?.close();
  };

  const startAudioCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      // In a real app, you'd process the audio and send it via session.sendRealtimeInput
      // For this demo, we'll just simulate the connection.
    } catch (error) {
      console.error(error);
      toast.error("Microphone access denied.");
    }
  };

  const playAudio = (base64: string) => {
    // Decode and play PCM audio
    // For simplicity in this demo, we'll just log it.
    console.log("Playing live audio chunk...");
  };

  return (
    <div className="fixed bottom-8 left-8 z-50">
      <AnimatePresence>
        {isConnected ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: -50 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: -50 }}
            className="bg-[#1a1a1a] border border-white/10 p-6 rounded-3xl shadow-2xl flex items-center space-x-6"
          >
            <div className="relative">
              <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
                <Bot className="w-8 h-8 text-black" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#1a1a1a]" />
            </div>
            
            <div>
              <h3 className="font-black uppercase tracking-widest italic text-yellow-400">Live Tutor</h3>
              <p className="text-xs text-gray-500 uppercase font-black tracking-widest">Voice Session Active</p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-3 rounded-xl transition-colors ${isMuted ? 'bg-red-500/10 text-red-500' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <button
                onClick={stopSession}
                className="p-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={startSession}
            disabled={isConnecting}
            className="w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.4)]"
          >
            {isConnecting ? <Zap className="w-8 h-8 animate-spin" /> : <Mic className="w-8 h-8" />}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
