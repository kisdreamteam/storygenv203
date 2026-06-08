"use client";

import { StoryEditorProvider } from "./StoryEditorContext";

export function StoryEditorShell({ children }: { children: React.ReactNode }) {
  return <StoryEditorProvider>{children}</StoryEditorProvider>;
}
