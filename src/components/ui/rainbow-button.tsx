import React from 'react'
import { cn } from '@/lib/utils'

interface RainbowButtonProps {
    children: React.ReactNode
    className?: string
    onClick?: () => void
    disabled?: boolean
    variant?: 'rainbow' | 'ocean' | 'sunset' | 'forest'
}

const variants = {
    rainbow: 'bg-gradient-rainbow',
    ocean: 'bg-gradient-ocean',
    sunset: 'bg-gradient-sunset',
    forest: 'bg-gradient-forest',
}

const shadowVariants = {
    rainbow: 'hover:shadow-purple-500/25',
    ocean: 'hover:shadow-cyan-500/25',
    sunset: 'hover:shadow-orange-500/25',
    forest: 'hover:shadow-green-500/25',
}

export function RainbowButton({
                                  children,
                                  className,
                                  onClick,
                                  disabled = false,
                                  variant = 'rainbow',
                              }: RainbowButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={cn(
                // Base styles
                'group relative inline-flex items-center justify-center overflow-hidden',
                'rounded-xl px-8 py-4 font-medium text-white transition-all duration-300',
                'transform-gpu will-change-transform',

                // Background with animation
                'bg-[length:200%_100%] animate-gradient-x',
                variants[variant],

                // Hover effects
                'hover:scale-105 hover:shadow-2xl',
                shadowVariants[variant],

                // Active effects
                'active:scale-95',

                // Focus styles
                'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2',

                // Disabled styles
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'disabled:hover:scale-100 disabled:hover:shadow-none',
                'disabled:animate-none',

                className
            )}
        >
            {/* Glass morphism overlay */}
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-xl" />

            {/* Shine effect */}
            <div className="absolute inset-0 overflow-hidden rounded-xl">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-out" />
            </div>

            {/* Glow effect */}
            <div className={cn(
                'absolute -inset-1 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300',
                variants[variant]
            )} />

            {/* Content */}
            <span className="relative z-10 flex items-center gap-2 font-semibold">
        {children}
      </span>

            {/* Pulse effect */}
            <div className={cn(
                'absolute inset-0 rounded-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300',
                'animate-pulse-glow',
                variants[variant]
            )} />
        </button>
    )
}