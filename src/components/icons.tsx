import type { SVGProps } from "react";

export function RvtLogo({ className, ...props }: SVGProps<SVGSVGElement>) {
  // Overriding any hardcoded colors passed in via className so the gradient shines through
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <defs>
        <linearGradient id="rvt-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FB923C" /> {/* Orange */}
          <stop offset="50%" stopColor="#EF4444" /> {/* Red */}
          <stop offset="100%" stopColor="#D946EF" /> {/* Fuchsia */}
        </linearGradient>
      </defs>
      <rect
        x="2" y="2" width="20" height="20" rx="6"
        stroke="url(#rvt-gradient)" strokeWidth="1.5" fill="none"
      />
      <path
        d="M14 6.5L9 11H14L10 17.5L15 13H10L14 6.5Z"
        fill="none"
        stroke="url(#rvt-gradient)"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
