import type { SVGProps } from "react";

export function RvtLogo({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <text
        x="60"
        y="65"
        dominantBaseline="middle"
        textAnchor="middle"
        fill="currentColor"
        fontSize="56"
        fontWeight="900"
        fontFamily="system-ui, -apple-system, sans-serif"
        letterSpacing="-3"
      >
        RVT
      </text>
    </svg>
  );
}
