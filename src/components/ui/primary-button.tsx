import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'outline'
}

const PrimaryButton = forwardRef<HTMLButtonElement, PrimaryButtonProps>(
  ({ children, className, variant = 'default', ...props }, ref) => {
    const baseStyles = 'w-full py-3 rounded-[50px] font-medium text-base min-h-[56px]'
    
    const variantStyles = {
      default: 'bg-black hover:bg-gray-800 text-white',
      outline: 'border-2 border-black bg-transparent hover:bg-black text-black hover:text-white'
    }

    return (
      <Button
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], className)}
        {...props}
      >
        {children}
      </Button>
    )
  }
)

PrimaryButton.displayName = 'PrimaryButton'

export { PrimaryButton }