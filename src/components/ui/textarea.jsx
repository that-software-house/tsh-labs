import * as React from 'react';
import { cn } from '@/lib/utils';

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        'flex min-h-16 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base text-black outline-none placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-50',
        'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
        className
      )}
      {...props}
    />
  );
});

Textarea.displayName = 'Textarea';

export { Textarea };
