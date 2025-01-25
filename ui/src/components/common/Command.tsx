'use client';

import * as React from 'react';

import {MagnifyingGlassIcon} from '@heroicons/react/24/outline';
import {Command as CommandPrimitive} from 'cmdk';
import {twMerge} from 'tailwind-merge';

const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({className, ...props}, ref) => (
  <CommandPrimitive
    ref={ref}
    className={twMerge(
      'bg-popover text-popover-foreground flex h-full w-full flex-col overflow-hidden rounded-md',
      className
    )}
    {...props}
  />
));
Command.displayName = CommandPrimitive.displayName;

const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({className, ...props}, ref) => (
  <div
    className="flex items-center border-b px-3"
    cmdk-input-wrapper=""
  >
    <MagnifyingGlassIcon className="mr-2 size-4 shrink-0 opacity-50" />
    <CommandPrimitive.Input
      ref={ref}
      className={twMerge(
        'flex h-10 w-full rounded-md bg-transparent py-3.5 text-sm outline-hidden placeholder:text-gray-500 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  </div>
));

CommandInput.displayName = CommandPrimitive.Input.displayName;

const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({className, ...props}, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={twMerge('max-h-[300px] overflow-y-auto overflow-x-hidden', className)}
    {...props}
  />
));

CommandList.displayName = CommandPrimitive.List.displayName;

const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    className="py-6 text-center text-sm text-gray-600"
    {...props}
  />
));

CommandEmpty.displayName = CommandPrimitive.Empty.displayName;

const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({className, ...props}, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={twMerge(
      '[&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-neutral-600 sm:[&_[cmdk-group-heading]]:px-6',
      className
    )}
    {...props}
  />
));

CommandGroup.displayName = CommandPrimitive.Group.displayName;

const CommandSeparator = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({className, ...props}, ref) => (
  <CommandPrimitive.Separator
    ref={ref}
    className={twMerge('bg-border -mx-1 h-px', className)}
    {...props}
  />
));
CommandSeparator.displayName = CommandPrimitive.Separator.displayName;

const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({className, ...props}, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={twMerge(
      'aria-selected:text-accent-foreground relative flex cursor-default select-none items-center rounded-xs px-2 py-1.5 text-sm outline-hidden aria-selected:bg-gray-100 data-disabled:pointer-events-none data-disabled:opacity-50',
      className
    )}
    {...props}
  />
));

CommandItem.displayName = CommandPrimitive.Item.displayName;

const CommandShortcut = ({className, ...props}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={twMerge('text-muted-foreground ml-auto text-xs tracking-widest', className)}
      {...props}
    />
  );
};
CommandShortcut.displayName = 'CommandShortcut';

export {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};
