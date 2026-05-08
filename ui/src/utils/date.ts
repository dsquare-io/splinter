import { formatDistanceToNow, type Locale } from 'date-fns';

const formatDistance: Locale['formatDistance'] = (token, count, options) => {
  const map: Record<string, string> = {
    lessThanXSeconds: `<${count}s`,
    xSeconds: `${count}s`,
    halfAMinute: '30s',
    lessThanXMinutes: `<${count}m`,
    xMinutes: `${count}m`,
    aboutXHours: `${count}h`,
    xHours: `${count}h`,
    xDays: `${count}d`,
    aboutXWeeks: `${count}w`,
    xWeeks: `${count}w`,
    aboutXMonths: `${count}mo`,
    xMonths: `${count}mo`,
    aboutXYears: `${count}y`,
    xYears: `${count}y`,
    overXYears: `${count}y`,
    almostXYears: `${count}y`,
  };

  const result = map[token] ?? `${count}`;

  if (options?.addSuffix) {
    return options.comparison && options.comparison > 0 ? `in ${result}` : `${result} ago`;
  }

  return result;
};

const shortLocale: Partial<Locale> = { formatDistance };

export function formatDistanceShort(date: Date | number): string {
  return formatDistanceToNow(date, { locale: shortLocale as Locale, addSuffix: true });
}

export function formatDistanceLong(date: Date | number): string {
  return formatDistanceToNow(date, { addSuffix: true });
}
