import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Split text into tokens where URLs are marked as {type: 'url', value} or plain text {type: 'text', value}
export function tokenizeLinks(text: string) {
  if (!text) return [] as Array<{ type: 'text' | 'url'; value: string }>;
  const urlRegex = /((https?:\/\/)?[\w-]+(\.[\w-]+)+(:\d+)?(\/\S*)?)/gi;
  const tokens: Array<{ type: 'text' | 'url'; value: string }> = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = urlRegex.exec(text)) !== null) {
    const idx = match.index;
    if (idx > lastIndex) {
      tokens.push({ type: 'text', value: text.slice(lastIndex, idx) });
    }
    let url = match[0];
    // ensure URL has protocol
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }
    tokens.push({ type: 'url', value: url });
    lastIndex = idx + match[0].length;
  }
  if (lastIndex < text.length) {
    tokens.push({ type: 'text', value: text.slice(lastIndex) });
  }
  return tokens;
}
