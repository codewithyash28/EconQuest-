import { GoogleGenAI, Type, ThinkingLevel, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export const chatWithGemini = async (message: string, history: any[] = []) => {
  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: "You are EconBot, an expert economics tutor for EconQuest. You help students understand microeconomics, macroeconomics, personal finance, and behavioral economics. Be encouraging, use simple analogies, and explain complex concepts clearly. If a student asks about their progress, remind them to check their dashboard.",
    },
  });

  // Convert history to the format expected by the SDK if needed, 
  // but for simplicity we'll just send the message for now or use the chat object properly.
  // The SDK's chat object maintains history internally if you reuse it.
  const response = await chat.sendMessage({ message });
  return response.text;
};

export const analyzeEconomicGraph = async (base64Image: string, prompt: string) => {
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
  // Note: Video analysis usually requires a File API upload or a URI.
  // For this demo, we'll assume the user provides a URI or we use a placeholder logic.
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `Analyze this video content for economic concepts: ${videoUri}. ${prompt}`
  });
  return response.text;
};

export const getQuickExplanation = async (concept: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite-preview",
    contents: `Give a 2-sentence explanation of the economic concept: ${concept}`,
    config: { thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL } }
  });
  return response.text;
};
