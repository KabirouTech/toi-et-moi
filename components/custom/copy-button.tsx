'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: some browsers block clipboard in non-secure contexts
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-tr from-[#ffadf9] to-[#ff77ff] px-5 py-2.5 text-sm font-bold text-[#37003a] transition-shadow hover:shadow-[0_10px_30px_rgba(255,173,249,0.2)]"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" />
          Copié !
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" />
          Copier
        </>
      )}
    </button>
  );
}
