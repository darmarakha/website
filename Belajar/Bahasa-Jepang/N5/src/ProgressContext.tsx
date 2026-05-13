import React, { useState, useEffect, useContext } from 'react';

export interface ProgressState {
  hiragana_score: number;
  katakana_score: number;
  bunpou_score: number;
  kanji_score: number;
}

const defaultProgress: ProgressState = {
  hiragana_score: 0,
  katakana_score: 0,
  bunpou_score: 0,
  kanji_score: 0,
};

interface ProgressContextType {
  progress: ProgressState;
  addProgress: (key: keyof ProgressState, score: number) => void;
}

export const ProgressContext = React.createContext<ProgressContextType>({
  progress: defaultProgress,
  addProgress: () => {}
});

export const useProgress = () => useContext(ProgressContext);

export const ProgressProvider = ({ children }: { children: React.ReactNode }) => {
  const [progress, setProgress] = useState<ProgressState>(defaultProgress);

  useEffect(() => {
    const saved = localStorage.getItem('gemu_user_progress');
    if (saved) {
      try {
        setProgress(JSON.parse(saved));
      } catch(e) {}
    } else {
      // Migrate from old gemu_progress if it exists
      const oldProgress = localStorage.getItem('gemu_progress');
      if (oldProgress) {
        try {
          const old = JSON.parse(oldProgress);
          const migrated = {
            hiragana_score: Math.floor(old.kana / 2),
            katakana_score: Math.ceil(old.kana / 2),
            kanji_score: old.kanji || 0,
            bunpou_score: old.grammar || 0,
          };
          setProgress(migrated);
          localStorage.setItem('gemu_user_progress', JSON.stringify(migrated));
        } catch(e) {}
      }
    }
  }, []);

  const addProgress = (key: keyof ProgressState, score: number) => {
    setProgress(prev => {
      const next = { ...prev, [key]: prev[key] + score };
      localStorage.setItem('gemu_user_progress', JSON.stringify(next));
      return next;
    });
  };

  return (
    <ProgressContext.Provider value={{ progress, addProgress }}>
      {children}
    </ProgressContext.Provider>
  );
};
