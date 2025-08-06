'use server';

import { getUserDetails, supabaseServerClient } from '@/utils/supabase/server';
import { TokenTextSplitter } from 'langchain/text_splitter';
import { PineconeStore } from '@langchain/pinecone';
import { Document } from 'langchain/document';
import ytdl from '@distube/ytdl-core';
import { parseStringPromise } from 'xml2js';
import { loadEmbeddings } from '@/utils/langchain-openai';
import { pineconeIndex } from '@/utils/pinecone';
import ytCookies from '@/utils/youtube-cookies';

// Save new chat with the provided tone, style, video title, and URL.
export async function createNewChat(
  tone: string,
  style: string,
  videoTitle: string,
  transcription: string,
  url: string
) {
  const supabase = supabaseServerClient();

  const user = await getUserDetails();

  const { data, error } = await supabase
    .from('chat_with_youtube')
    .insert({
      user_id: user?.id,
      tone,
      style,
      video_title: videoTitle,
      url,
      transcription,
    })
    .select('id')
    .single();

  if (error) {
    return error.message;
  }

  return { id: data.id };
}

// Server actions function to ingest the transcription and store it in the vector store.
// We are using Pinecone as the vector store to store the embeddings. You can try using other vector stores like Faiss, Annoy, etc.
// Function to ingest the transcription and store it in the vector store.
export async function ingestFileInVector(transcription: string, transcriptionId: string) {
  const supabase = supabaseServerClient();

  try {
    const vectorDocument = new Document({
      pageContent: transcription,
      metadata: {
        document_id: transcriptionId,
      },
    });

    // Split the content into chunks
    const splitter = new TokenTextSplitter({
      chunkSize: 400,
      chunkOverlap: 20,
      encodingName: 'cl100k_base',
    });

    const documentChunks = await splitter.splitDocuments([vectorDocument]);

    /* create and store the embeddings in the vectorStore */
    const embeddings = loadEmbeddings();

    await PineconeStore.fromDocuments(documentChunks, embeddings, { pineconeIndex });

    await supabase.from('chat_with_youtube').update({ ingestion_done: true }).eq('id', transcriptionId);
  } catch (error) {
    console.log(error);
    return `${error}`;
  }
}

export async function getYoutubeVideoDeatils(url: string) {
  try {
    const agent = ytdl.createAgent(ytCookies);

    const info = await ytdl.getInfo(url, { agent });
    const title = info.videoDetails.title;
    const subTitles = info.player_response.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];

    // Filter out only the English subtitles
    // You can change the language code to get subtitles in other languages
    const subtitles = subTitles.filter((track) => track.languageCode === 'en');
    if (subtitles.length === 0) {
      throw 'No subtitles found.';
    }

    // Get the subtitle text from the first English subtitle
    const subtitleTexts = await Promise.all(
      subTitles.map(async (subtitle) => {
        const response = await fetch(subtitle.baseUrl);
        const xml = await response.text();
        const parsed = await parseStringPromise(xml);
        const texts = parsed.transcript.text.map((item: any) => item._).join(' ');
        return {
          language: subtitle.languageCode,
          name: subtitle.name.simpleText,
          text: texts,
        };
      })
    );

    // Return the video title
    return { title, subtitle: subtitleTexts[0].text };
  } catch (error) {
    console.error(error);
    return { error: `${error}` };
  }
}
