import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Supported Models for Llama 3.1 from Groq:
// 1. llama-3.3-70b-versatile
// 2. llama-3.1-8b-instant
// 3. llama3-70b-8192
export const groqLlamaModel = 'llama3-70b-8192';

export default groq;
