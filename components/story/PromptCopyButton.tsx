"use client";

import { CopyTextButton } from "./CopyTextButton";

type PromptCopyButtonProps = {
  getText: () => string;
};

export function PromptCopyButton({ getText }: PromptCopyButtonProps) {
  return <CopyTextButton label="Copy prompt" getText={getText} />;
}
