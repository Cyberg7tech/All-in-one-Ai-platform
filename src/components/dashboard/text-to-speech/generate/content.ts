export type TypeModels = 'openai' | 'elevenlabs';

type TypeModelOptions = {
  value: TypeModels;
  label: string;
}[];
export const modelOptions: TypeModelOptions = [
  {
    value: 'openai',
    label: 'OpenAI',
  },
  {
    value: 'elevenlabs',
    label: 'ElevenLabs',
  },
];

type TypeVoiceOptions = {
  [K in TypeModels]: {
    value: string;
    label: string;
  }[];
};
export const voiceOptions: TypeVoiceOptions = {
  openai: [
    {
      value: 'alloy',
      label: 'Alloy',
    },
    {
      value: 'echo',
      label: 'Echo',
    },
    {
      value: 'fable',
      label: 'Fable',
    },
    {
      value: 'onyx',
      label: 'Onyx',
    },
    {
      value: 'nova',
      label: 'Nova',
    },
    {
      value: 'shimmer',
      label: 'Shimmer',
    },
  ],
  elevenlabs: [
    {
      value: 'EXAVITQu4vr4xnSDxMaL',
      label: 'Sarah',
    },
    {
      value: 'FGY2WhTYpPnrIDTdsKH5',
      label: 'Laura',
    },
    {
      value: 'IKne3meq5aSn9XLyUdCD',
      label: 'Charlie',
    },
    {
      value: 'JBFqnCBsd6RMkjVDRZzb',
      label: 'George',
    },
    {
      value: 'N2lVS1w4EtoT3dr4eOWO',
      label: 'Callum',
    },
    {
      value: 'TX3LPaxmHKxFdv7VOQHJ',
      label: 'Liam',
    },
    {
      value: 'XB0fDUnXU5powFXDhCwa',
      label: 'Charlotte',
    },
    {
      value: 'Xb7hH8MSUJpSbSDYk0k2',
      label: 'Alice',
    },
    {
      value: 'XrExE9yKIg1WjnnlVkGX',
      label: 'Matilda',
    },
    {
      value: 'bIHbv24MWmeRgasZH58o',
      label: 'Will',
    },
    {
      value: 'cgSgspJ2msm6clMCkdW9',
      label: 'Jessica',
    },
    {
      value: 'cjVigY5qzO86Huf0OWal',
      label: 'Eric',
    },
    {
      value: 'iP95p4xoKVk53GoZ742B',
      label: 'Chris',
    },
    {
      value: 'nPczCjzI2devNBz1zQrb',
      label: 'Brian',
    },
    {
      value: 'onwK4e9ZLuTAKqWW03F9',
      label: 'Daniel',
    },
    {
      value: 'pFZP5JQG7iQjIQuC4Bku',
      label: 'Lily',
    },
    {
      value: 'pqHfZKP75CvOlQylNhV4',
      label: 'Bill',
    },
  ],
};
