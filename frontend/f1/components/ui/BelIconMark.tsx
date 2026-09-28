export default function BelIconMark({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block" }}
    >
      <defs>
        <linearGradient id="belMarkGradUI" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="60%" stopColor="#67e8f9" />
          <stop offset="100%" stopColor="#00e5ff" />
        </linearGradient>
      </defs>
      {/* BEL Defence Emblem: Geometric 'B' with concentric radar frequency waves */}
      <path
        d="M4.5 4.5H11.5C13.2 4.5 14.5 5.7 14.5 7.2C14.5 8.4 13.7 9.3 12.5 9.7C14 10.1 15.2 11.2 15.2 12.8C15.2 14.6 13.5 16 11.5 16H4.5V4.5Z"
        stroke="url(#belMarkGradUI)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.5 10.2H11.5"
        stroke="url(#belMarkGradUI)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* Outer Radar Telemetry Wave Arc */}
      <path
        d="M18 5C20.5 6.8 22 9.5 22 12.5C22 15.5 20.5 18.2 18 20"
        stroke="#00e5ff"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* Inner Radar Telemetry Wave Arc */}
      <path
        d="M17 8C18.5 9.2 19.5 10.8 19.5 12.5C19.5 14.2 18.5 15.8 17 17"
        stroke="#ffffff"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
