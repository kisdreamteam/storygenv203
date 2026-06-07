"use client";

import { useEffect } from "react";
import { logStoryPageView } from "@/lib/validation/workflow-log";

type PilotWorkflowStoryViewProps = {
  storyId: string;
  status: string;
};

/** Validation instrumentation only — not product analytics. */
export function PilotWorkflowStoryView({
  storyId,
  status,
}: PilotWorkflowStoryViewProps) {
  useEffect(() => {
    logStoryPageView(storyId, status);
  }, [storyId, status]);

  return null;
}
