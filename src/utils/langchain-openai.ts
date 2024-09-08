// This is a utility function that loads the OpenAI model and embeddings.

import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL;

export function openAIModel() {
  return new ChatOpenAI({
    openAIApiKey: OPENAI_API_KEY,
    modelName: OPENAI_MODEL,
    temperature: 0,
  });
}

export function loadEmbeddings() {
  return new OpenAIEmbeddings({
    stripNewLines: false,
    openAIApiKey: OPENAI_API_KEY,
    verbose: true,
  });
}
