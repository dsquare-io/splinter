import { getVerbConfig } from '../-utils/verbConfig.ts';

type Props = {
  verb: string;
  className?: string;
  iconClassName?: string;
};

export function ActivityVerbIcon({ verb, className, iconClassName }: Props) {
  const config = getVerbConfig(verb);
  const Icon = config.icon;

  return (
    <div className={`flex shrink-0 items-center justify-center ${config.iconBg} ${className ?? ''}`}>
      <Icon className={`${config.iconColor} ${iconClassName ?? ''}`} />
    </div>
  );
}
