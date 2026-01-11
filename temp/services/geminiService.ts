import { GoogleGenAI } from "@google/genai";
import { Note } from '../types';

// Ensure API Key exists, handled by the environment in this context
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateNoteSummary = async (content: string): Promise<string> => {
  if (!content) return "";
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Summarize the following note in one concise sentence: ${content}`,
    });
    return response.text || "Could not generate summary.";
  } catch (error) {
    console.error("Gemini Summary Error:", error);
    return "Error generating summary.";
  }
};

export const askAiAboutNotes = async (query: string, notes: Note[]): Promise<string> => {
  try {
    // Prepare context from notes (limit to avoid token limits for this demo)
    // In a real app, use RAG. Here we just take the last 10 modified notes or currently filtered ones.
    const context = notes
      .filter(n => !n.isEncrypted) // Don't send encrypted notes to AI for privacy in this demo
      .slice(0, 20)
      .map(n => `Title: ${n.title}\nType: ${n.type}\nContent: ${n.content}`)
      .join('\n---\n');

    const prompt = `
      You are a helpful assistant inside a note-taking app.
      Here are the user's recent unencrypted notes:
      ${context}
      
      User Question: ${query}
      
      Answer based on the notes above. If the answer isn't in the notes, say so politely.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "I couldn't find an answer.";
  } catch (error) {
    console.error("Gemini Search Error:", error);
    return "Sorry, I encountered an error searching your notes.";
  }
};
