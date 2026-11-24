"use client";

import { useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

// Replaces <pre> in blog posts: keeps the code selectable and adds a copy button.
export default function CodeBlock({ children, node, ...props }) {
  const preRef = useRef(null);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    const text = preRef.current?.innerText ?? "";
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for browsers or contexts without the async clipboard API
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-block-wrapper">
      <button
        type="button"
        onClick={copy}
        className="copy-button"
        aria-label={copied ? "Code copied" : "Copy code"}
      >
        {copied ? <Check size={14} aria-hidden /> : <Copy size={14} aria-hidden />}
        <span>{copied ? "Copied" : "Copy"}</span>
      </button>
      <pre ref={preRef} {...props}>
        {children}
      </pre>
      <span className="sr-only" aria-live="polite">
        {copied ? "Code copied to clipboard" : ""}
      </span>
    </div>
  );
}
