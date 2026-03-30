import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import firebaseConfig from '../../firebase-applet-config.json';

let aiInstance: GoogleGenAI | null = null;

const getAI = () => {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY || firebaseConfig.apiKey;
    if (!apiKey) {
      throw new Error("Gemini API Key is missing. Please configure it in your environment or firebase-applet-config.json.");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
};

export const connectToLiveTutor = async (callbacks: {
  onopen?: () => void;
  onmessage: (message: LiveServerMessage) => void;
  onerror?: (error: any) => void;
  onclose?: () => void;
}) => {
  const ai = getAI();
  return ai.live.connect({
    model: "gemini-3.1-flash-live-preview",
    callbacks,
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
      },
      systemInstruction: "You are a live economics tutor for EconQuest. You help students with their questions in real-time. Be concise and clear.",
    },
  });
};
