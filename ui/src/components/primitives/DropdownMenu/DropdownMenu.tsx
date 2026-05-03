import type { ComponentType, ReactNode } from 'react';
import { Menu, MenuItem, MenuTrigger, Popover } from 'react-aria-components';

type DropdownMenuItemProps = {
  id: string;
  icon?: ComponentType<{ className?: string }>;
  variant?: 'default' | 'danger';
  onAction: () => void;
  children: ReactNode;
};

export function DropdownMenuItem({ id, icon: Icon, variant, onAction, children }: DropdownMenuItemProps) {
  return (
    <MenuItem
      id={id}
      onAction={onAction}
      className={`flex cursor-default items-center gap-x-3 px-4 py-2 outline-none select-none data-focused:bg-gray-50 data-hovered:bg-gray-50 ${
        variant === 'danger' ? 'text-red-600' : 'text-gray-700'
      }`}
    >
      {Icon && <Icon className="size-4 shrink-0" />}
      {children}
    </MenuItem>
  );
}

type DropdownMenuProps = {
  trigger: ReactNode;
  children: ReactNode;
};

export function DropdownMenu({ trigger, children }: DropdownMenuProps) {
  return (
    <MenuTrigger>
      {trigger}
      <Popover className="react-aria-Popover min-w-40 p-0!">
        <Menu className="py-1 text-sm outline-none">{children}</Menu>
      </Popover>
    </MenuTrigger>
  );
}
