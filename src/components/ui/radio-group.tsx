"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
    value?: string
    onValueChange?: (value: string) => void
    disabled?: boolean
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
    ({ className, value, onValueChange, disabled, children, ...props }, ref) => {
        return (
            <div
                className={cn("flex gap-4", className)}
                ref={ref}
                role="radiogroup"
                {...props}
            >
                {React.Children.map(children, (child) => {
                    if (React.isValidElement(child)) {
                        return React.cloneElement(child, {
                            // @ts-ignore
                            checked: child.props.value === value,
                            onCheckedChange: onValueChange,
                            disabled: disabled || child.props.disabled,
                        } as any)
                    }
                    return child
                })}
            </div>
        )
    }
)
RadioGroup.displayName = "RadioGroup"

export interface RadioGroupItemProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    value: string
    label: string
    checked?: boolean
    onCheckedChange?: (value: string) => void
}

const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
    ({ className, value, label, checked, onCheckedChange, disabled, ...props }, ref) => {
        return (
            <label
                className={cn(
                    "flex items-center space-x-2 cursor-pointer",
                    disabled && "cursor-not-allowed opacity-50"
                )}
            >
                <input
                    type="radio"
                    ref={ref}
                    value={value}
                    checked={checked}
                    onChange={(e) => {
                        if (onCheckedChange && e.target.checked) {
                            onCheckedChange(value)
                        }
                    }}
                    disabled={disabled}
                    className={cn(
                        "h-4 w-4 border border-primary text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                        className
                    )}
                    {...props}
                />
                <span className="text-sm font-medium">{label}</span>
            </label>
        )
    }
)
RadioGroupItem.displayName = "RadioGroupItem"

export { RadioGroup, RadioGroupItem }
