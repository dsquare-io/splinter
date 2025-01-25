import {ComponentProps, ReactNode} from 'react';

import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import {VariantProps, tv} from 'tailwind-variants';

import {IconButton} from './IconButton.tsx';

export const IconsMap = {
  default: <ExclamationCircleIcon className="h-6 w-6" />,
  danger: <ExclamationCircleIcon className="h-6 w-6 text-red-500" />,
  warn: <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />,
  info: <InformationCircleIcon className="h-6 w-6 text-blue-600" />,
  success: <CheckCircleIcon className="h-6 w-6 text-green-600" />,
} as const;

type AlertProps = Omit<ComponentProps<'div'>, 'children'> &
  VariantProps<typeof alertStyles> & {
    icon?: false | ReactNode;
    title?: ReactNode;
    body?: ReactNode;
    dismissible?: boolean;
    onDismiss?: () => void;
  };

export function Alert({
  color,
  className,
  icon,
  role = 'alert',
  title,
  body,
  dismissible = true,
  onDismiss,
  ...restProps
}: AlertProps) {
  const iconElement = icon === false ? undefined : !icon ? IconsMap[color as keyof typeof IconsMap] : icon;

  return (
    <div
      className={alertStyles({color, className})}
      role={role}
      {...restProps}
    >
      <div className="flex grow items-start gap-x-3 [&>svg]:shrink-0">
        {iconElement}
        <div>
          {title && <div>{title}</div>}
          {body && <div>{body}</div>}
        </div>
      </div>
      {dismissible && (
        <IconButton
          aria-label="Dismiss"
          color={color}
          variant="plain"
          onPress={onDismiss}
          slot={null}
        >
          <XMarkIcon className="size-4" />
        </IconButton>
      )}
    </div>
  );
}

const alertStyles = tv({
  base: ['flex items-center px-6 py-4 gap-x-3 border-s-2 rounded-e'],
  variants: {
    color: {
      default: 'bg-gray-100 text-gray-900 border-gray-900',
      danger: 'bg-red-50 text-red-900 border-red-500',
      warn: 'bg-amber-50 text-amber-900 border-amber-600',
      info: 'bg-blue-50 text-blue-900 border-blue-600',
      success: 'bg-green-50 text-green-900 border-green-600',
    },
  },
  defaultVariants: {
    color: 'default',
  },
});
