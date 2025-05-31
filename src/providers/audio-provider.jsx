import { createContext, useContext, useRef } from 'react';
import { AudioManager } from '../lib/audio-manager';

const AudioContext = createContext(null);

export const AudioProvider = ({ children }) => {
  const audioRef = useRef(new AudioManager());

  return (
    <AudioContext.Provider value={audioRef.current}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  return useContext(AudioContext);
};
