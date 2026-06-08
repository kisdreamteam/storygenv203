"use client";

import { createContext, useCallback, useContext, useState } from "react";

type StoryEditorContextValue = {
  isDirty: boolean;
  markDirty: () => void;
  clearDirty: () => void;
};

const StoryEditorContext = createContext<StoryEditorContextValue | null>(null);

export function StoryEditorProvider({ children }: { children: React.ReactNode }) {
  const [isDirty, setIsDirty] = useState(false);
  const markDirty = useCallback(() => setIsDirty(true), []);
  const clearDirty = useCallback(() => setIsDirty(false), []);

  return (
    <StoryEditorContext.Provider value={{ isDirty, markDirty, clearDirty }}>
      {children}
    </StoryEditorContext.Provider>
  );
}

export function useStoryEditor() {
  const context = useContext(StoryEditorContext);
  if (!context) {
    throw new Error("useStoryEditor must be used within StoryEditorProvider");
  }
  return context;
}
