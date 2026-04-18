import * as React from 'react';
import { cn } from '@/lib/utils';

const Card = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('flex flex-col gap-6 rounded-xl border border-gray-200 bg-white text-black', className)}
      {...props}
    />
  );
});

Card.displayName = 'Card';

const CardHeader = React.forwardRef(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn('grid auto-rows-min gap-1.5 px-6 pt-6', className)} {...props} />;
});

CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef(({ className, ...props }, ref) => {
  return <h4 ref={ref} className={cn('font-medium leading-none', className)} {...props} />;
});

CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef(({ className, ...props }, ref) => {
  return <p ref={ref} className={cn('text-gray-500', className)} {...props} />;
});

CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn('px-6 [&:last-child]:pb-6', className)} {...props} />;
});

CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn('flex items-center px-6 pb-6', className)} {...props} />;
});

CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
