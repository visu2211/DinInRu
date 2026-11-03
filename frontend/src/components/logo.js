import React from "react";

// Plate-and-cutlery mark, matching public/favicon.svg.
export function LogoMark({ className = "h-8 w-8" }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <circle cx="32" cy="32" r="32" fill="#cc0033" />
      <circle cx="32" cy="32" r="23" fill="#ffffff" />
      <circle cx="32" cy="32" r="16" fill="none" stroke="#f3c6cf" strokeWidth="2" />
      <g stroke="#cc0033" strokeWidth="3.4" strokeLinecap="round" fill="none">
        <line x1="20" y1="14" x2="34" y2="50" />
        <line x1="16" y1="14" x2="16" y2="24" />
        <line x1="20" y1="14" x2="20" y2="24" />
        <line x1="24" y1="14" x2="24" y2="24" />
        <path d="M44 14 C 48 18, 48 24, 44 28 L 40 50" />
      </g>
    </svg>
  );
}

export function Wordmark() {
  return (
    <span className="text-xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
      DinIn<span className="text-scarlet">Ru</span>
    </span>
  );
}
