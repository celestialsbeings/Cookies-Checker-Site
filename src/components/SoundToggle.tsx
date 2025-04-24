import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useSound } from '../hooks/useSound';

export const SoundToggle: React.FC = () => {
  const { isSoundEnabled, setIsSoundEnabled, playClickSound } = useSound();

  const toggleSound = () => {
    playClickSound();
    setIsSoundEnabled(!isSoundEnabled);
  };

  return (
    <button
      onClick={toggleSound}
      className="p-2 text-gray-400 hover:text-purple-400 transition-colors"
      aria-label={isSoundEnabled ? 'Disable sound effects' : 'Enable sound effects'}
    >
      {isSoundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
    </button>
  );
};