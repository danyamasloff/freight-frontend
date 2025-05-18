import { toast } from 'sonner'

type ToastProps = {
    title?: string
    description?: string
    variant?: 'default' | 'destructive'
    action?: {
        label: string
        onClick: () => void
    }
}

export function useToast() {
    return {
        toast: ({ title, description, variant = 'default', action }: ToastProps) => {
            const message = title && description ? `${title}: ${description}` : title || description || ''

            if (variant === 'destructive') {
                toast.error(message, {
                    action: action ? {
                        label: action.label,
                        onClick: action.onClick
                    } : undefined
                })
            } else {
                toast.success(message, {
                    action: action ? {
                        label: action.label,
                        onClick: action.onClick
                    } : undefined
                })
            }
        }
    }
}