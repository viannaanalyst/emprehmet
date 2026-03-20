import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, onChange, value, ...props }, ref) => {
  const internalRef = React.useRef<HTMLTextAreaElement>(null)

  React.useEffect(() => {
    if (internalRef.current) {
      internalRef.current.style.height = 'auto'
      internalRef.current.style.height = internalRef.current.scrollHeight + 'px'
    }
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (internalRef.current) {
      internalRef.current.style.height = 'auto'
      internalRef.current.style.height = internalRef.current.scrollHeight + 'px'
    }
    if (onChange) onChange(e)
  }

  return (
    <textarea
      className={cn(
        "flex w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm overflow-hidden resize-none",
        className
      )}
      ref={(node) => {
        internalRef.current = node
        if (typeof ref === 'function') ref(node)
        else if (ref) ref.current = node
      }}
      onChange={handleChange}
      value={value}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
