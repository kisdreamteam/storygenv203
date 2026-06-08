"use client";

import { useState } from "react";

type CopyTextButtonProps = {
  label: string;
  copiedLabel?: string;
  text?: string;
  getText?: () => string | Promise<string>;
};

export const copyButtonClassName =
  "rounded border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50";

export function CopyTextButton({
  label,
  copiedLabel = "Copied!",
  text,
  getText,
}: CopyTextButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      const value = getText ? await getText() : (text ?? "");
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button type="button" onClick={handleCopy} className={copyButtonClassName}>
      {copied ? copiedLabel : label}
    </button>
  );
}
