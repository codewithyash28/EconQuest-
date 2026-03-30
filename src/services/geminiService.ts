import { GoogleGenAI, ThinkingLevel } from "@google/genai";
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

export const chatWithGemini = async (message: string, _history: any[] = []) => {
  const ai = getAI();
  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: "You are EconBot, an expert economics tutor for EconQuest. You help students understand microeconomics, macroeconomics, personal finance, and behavioral economics. Be encouraging, use simple analogies, and explain complex concepts clearly. If a student asks about their progress, remind them to check their dashboard.",
    },
  });

  const response = await chat.sendMessage({ message });
  return response.text;
};

export const analyzeEconomicGraph = async (base64Image: string, prompt: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType: "image/jpeg" } },
        { text: prompt || "Analyze this economic graph. What are the key trends, and what does it tell us about the market?" }
      ]
    }
  });
  return response.text;
};

export const analyzeEconomicVideo = async (videoUri: string, prompt: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `Analyze this video content for economic concepts: ${videoUri}. ${prompt}`
  });
  return response.text;
};

export const getQuickExplanation = async (concept: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite-preview",
    contents: `Give a 2-sentence explanation of the economic concept: ${concept}`,
    config: { thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL } }
  });
  return response.text;
};
