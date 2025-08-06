export async function elevenLabsTTS({ content, voiceId }: IElevenLabsTTS) {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream?enable_logging=true&output_format=mp3_22050_32`;

  const myHeaders = new Headers();
  myHeaders.append('Content-Type', 'application/json');
  myHeaders.append('xi-api-key', process.env.ELEVENLABS_API_KEY!);

  const raw = JSON.stringify({
    text: content,
    voice_settings: {
      stability: 0.1,
      similarity_boost: 0.3,
      style: 0.2,
    },
  });

  const requestOptions: RequestInit = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow',
  };

  const response = await fetch(url, requestOptions);

  return response;
}

export interface IElevenLabsTTS {
  content: string;
  voiceId: string;
}
