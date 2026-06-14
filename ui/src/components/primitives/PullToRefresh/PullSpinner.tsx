import { motion } from 'framer-motion';

type PullSpinnerProps = {
  activeSpokes: number;
  totalSpokes: number;
  isRefreshing: boolean;
};

export function PullSpinner({ activeSpokes, totalSpokes, isRefreshing }: PullSpinnerProps) {
  const complete = activeSpokes === totalSpokes || isRefreshing;
  return (
    <motion.svg
      viewBox="0 0 24 24"
      className={`size-7 transition-colors duration-200 ${complete ? 'text-brand-500' : 'text-gray-400'}`}
      animate={isRefreshing ? { rotate: 360 } : { rotate: 0 }}
      transition={isRefreshing ? { repeat: Infinity, duration: 0.75, ease: 'linear' } : { duration: 0 }}
    >
      {Array.from({ length: totalSpokes }).map((_, i) => {
        const angle = (i / totalSpokes) * 360;
        const active = isRefreshing || i < activeSpokes;
        return (
          // plain <g> so SVG rotate(cx,cy) is not overridden by framer-motion
          <g
            key={i}
            transform={`rotate(${angle}, 12, 12)`}
          >
            <motion.line
              x1={12}
              y1={7}
              x2={12}
              y2={3}
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={1}
              initial={false}
              animate={{ strokeDashoffset: active ? 0 : 1 }}
              transition={{ duration: 0.1, ease: 'easeOut' }}
            />
          </g>
        );
      })}
    </motion.svg>
  );
}
