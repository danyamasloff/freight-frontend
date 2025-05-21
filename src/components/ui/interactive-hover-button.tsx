import React from 'react'
import { cn } from '@/lib/utils'

interface InteractiveHoverButtonProps {
    children: React.ReactNode
    className?: string
    text?: string
    onClick?: () => void
    disabled?: boolean
}

export function InteractiveHoverButton({
                                           children,
                                           className,
                                           text,
                                           onClick,
                                           disabled = false,
                                       }: InteractiveHoverButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={cn(
                // Base styles
                'group relative inline-flex items-center justify-center overflow-hidden',
                'rounded-xl px-8 py-4 font-medium text-white transition-all duration-300',
                'transform-gpu will-change-transform',

                // Background gradients
                'bg-gradient-to-r from-purple-500 via-violet-500 to-purple-500',
                'bg-[length:200%_100%] bg-[position:0%_50%]',

                // Hover effects
                'hover:bg-[position:100%_50%] hover:scale-105 hover:shadow-xl',
                'hover:shadow-purple-500/25',

                // Active effects
                'active:scale-95',

                // Focus styles
                'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2',

                // Disabled styles
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'disabled:hover:scale-100 disabled:hover:shadow-none',

                className
            )}
        >
            {/* Shine effect */}
            <div className="absolute inset-0 overflow-hidden rounded-xl">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-out" />
            </div>

            {/* Ripple effect */}
            <div className="absolute inset-0 overflow-hidden rounded-xl">
                <div className="absolute -inset-2 bg-gradient-to-r from-purple-400/50 via-violet-400/50 to-purple-400/50 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            {/* Content */}
            <span className="relative z-10 flex items-center gap-2">
        {children || text}
      </span>

            {/* Glow effect */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600 via-violet-600 to-purple-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl" />
        </button>
    )
}