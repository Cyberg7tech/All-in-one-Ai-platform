import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Supported Models for Llama 3.1 from Groq:
// 1. llama-3.1-70b-versatile
// 2. llama-3.1-8b-instant
export const groqLlamaModel = 'llama-3.1-70b-versatile';

export default groq;
