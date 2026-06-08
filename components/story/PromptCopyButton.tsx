"use client";

import { CopyTextButton } from "./CopyTextButton";

type PromptCopyButtonProps = {
  text: string;
};

export function PromptCopyButton({ text }: PromptCopyButtonProps) {
  return <CopyTextButton label="Copy prompt" text={text} />;
}
