import { useId } from "react";
import { LAMP_LABEL } from "@/lib/brand";

export function LampIllustration() {
  const glowId = useId();
  return (
    <svg
      role="img"
      aria-label={LAMP_LABEL}
      viewBox="0 0 342 176"
      width="342"
      height="176"
      className="mx-auto h-auto w-full max-w-[342px] shrink-0"
    >
      <defs>
        <radialGradient id={glowId}>
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.55" />
          <stop offset="55%" stopColor="var(--primary)" stopOpacity="0.12" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="171" cy="78" rx="125" ry="78" fill={`url(#${glowId})`} />
      <polygon points="146,92 158,52 184,52 196,92" fill="var(--primary)" />
      <rect x="169" y="92" width="4" height="40" fill="var(--lamp-stem)" />
      <path d="M152 134H190" stroke="var(--lamp-stem)" strokeWidth="6" strokeLinecap="round" />
      <path d="M40 146H302" stroke="var(--border)" strokeWidth="3" />
      <rect x="226" y="118" width="30" height="28" rx="4" fill="var(--card)" />
      <path d="M241 112C232 107 250 102 241 96" fill="none" stroke="var(--border)" strokeWidth="2" strokeLinecap="round" />
      <rect x="84" y="126" width="14" height="20" fill="var(--border)" />
      <rect x="100" y="120" width="12" height="26" fill="var(--lamp-book)" />
    </svg>
  );
}

export function LampMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 32 32" width="32" height="32" className="size-8 shrink-0">
      <circle cx="16" cy="16" r="16" fill="var(--background)" />
      <path d="M9 17L12 7H20L23 17Z" fill="var(--primary)" />
      <path d="M16 17V24M10 25H22" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}