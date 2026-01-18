"use client"

import * as React from "react"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface ChipsInputProps {
    values: string[]
    onChange: (values: string[]) => void
    placeholder?: string
    disabled?: boolean
    className?: string
}

export function ChipsInput({
    values,
    onChange,
    placeholder = "Type and press Enter",
    disabled = false,
    className,
}: ChipsInputProps) {
    const [inputValue, setInputValue] = React.useState("")

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && inputValue.trim()) {
            e.preventDefault()
            const trimmed = inputValue.trim()
            // Check for duplicates case-insensitively
            const isDuplicate = values.some(
                (v) => v.toLowerCase() === trimmed.toLowerCase()
            )
            if (!isDuplicate) {
                onChange([...values, trimmed])
            }
            setInputValue("")
        } else if (e.key === "Backspace" && !inputValue && values.length > 0) {
            onChange(values.slice(0, -1))
        }
    }

    const removeChip = (index: number) => {
        onChange(values.filter((_, i) => i !== index))
    }

    return (
        <div className={cn("space-y-2", className)}>
            <div className="flex flex-wrap gap-2 min-h-[42px] p-2 border rounded-md bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                {values.map((value, index) => (
                    <Badge key={index} variant="secondary" className="gap-1 pr-1">
                        {value}
                        <button
                            type="button"
                            onClick={() => removeChip(index)}
                            disabled={disabled}
                            className="ml-1 rounded-full hover:bg-destructive/20 p-0.5 transition-colors disabled:opacity-50"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </Badge>
                ))}
                <Input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={values.length === 0 ? placeholder : ""}
                    disabled={disabled}
                    className="flex-1 min-w-[120px] border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-auto p-0 bg-transparent"
                />
            </div>
        </div>
    )
}
