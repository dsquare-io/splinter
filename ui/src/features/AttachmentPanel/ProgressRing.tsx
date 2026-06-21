export function ProgressRing({ progress }: { progress: number }) {
  const r = 16;
  const circ = 2 * Math.PI * r;
  const dash = (progress / 100) * circ;

  return (
    <svg
      className="-rotate-90"
      width="40"
      height="40"
      viewBox="0 0 40 40"
    >
      <circle
        cx="20"
        cy="20"
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="3"
      />
      <circle
        cx="20"
        cy="20"
        r={r}
        fill="none"
        stroke="white"
        strokeWidth="3"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
      />
    </svg>
  );
}
