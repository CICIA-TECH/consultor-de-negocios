"use client";

import React from "react";

interface IconProps {
  className?: string;
  size?: number;
}

export function CiciaIcon({ className, size = 32 }: IconProps) {
  // Pure vector caret icon matching the logo A perfectly.
  // Using tight viewBox coordinates to guarantee vertical and horizontal alignment.
  return (
    <svg
      width={size}
      height={size}
      viewBox="71 5 24 21"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      style={{ display: "inline-block", verticalAlign: "middle" }}
    >
      <path
        d="M 73.5 24 L 83 7.5 L 92.5 24"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="83" cy="19" r="2.6" fill="url(#ciciaGradIcon)" />
      <defs>
        <radialGradient id="ciciaGradIcon" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#B565FF" />
          <stop offset="100%" stopColor="#7B1FD4" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export function CiciaLogo({ className, height = 24 }: { className?: string; height?: number }) {
  // Pure vector SVG C I C I A logo.
  // The caret peak of the A is adjusted to y=7.5 to align mathematically and visually 
  // with the cap-height of C and I (which go to y=8 with stroke cap at ~6.75).
  const width = height * 3; // Proportional width (ratio 96:32 = 3:1)
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 96 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      style={{ display: "block" }}
    >
      {/* First C */}
      <path
        d="M 17.65 10.35 A 8 8 0 1 0 17.65 21.65"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* First I */}
      <path
        d="M 29 8 L 29 24"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Second C */}
      <path
        d="M 51.65 10.35 A 8 8 0 1 0 51.65 21.65"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Second I */}
      <path
        d="M 63 8 L 63 24"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Caret A - peak aligned perfectly at y=7.5 */}
      <path
        d="M 73.5 24 L 83 7.5 L 92.5 24"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Inner dot of A */}
      <circle cx="83" cy="19" r="2.6" fill="url(#ciciaLogoGrad)" />
      <defs>
        <radialGradient id="ciciaLogoGrad" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#B565FF" />
          <stop offset="100%" stopColor="#7B1FD4" />
        </radialGradient>
      </defs>
    </svg>
  );
}
