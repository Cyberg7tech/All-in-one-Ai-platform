// react-audio-visualize.d.ts

declare module 'react-audio-visualize' {
  export interface AudioVisualizerProps {
    // Define props for the AudioVisualizer component
    // You can reference the props provided by the library or define your own
  }

  export interface LiveAudioVisualizerProps {
    mediaRecorder: MediaRecorder;
    width: number;
    height: number;
    barWidth: number;
    gap: number;
    height: number;
    fftSize: number;
    maxDecibels: number;
    minDecibels: number;
    smoothingTimeConstant: number;
  }

  export const AudioVisualizer: React.FC<AudioVisualizerProps>;
  export const LiveAudioVisualizer: React.FC<LiveAudioVisualizerProps>;
}
