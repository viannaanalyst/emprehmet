import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef(({ className, type = "text", ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = "Input"

const InputWithSuffix = React.forwardRef(({ className, suffix, ...props }, ref) => {
  return (
    <div className="relative">
      <Input
        className={cn("pr-10", className)}
        ref={ref}
        {...props}
      />
      {suffix && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {suffix}
        </div>
      )}
    </div>
  )
})
InputWithSuffix.displayName = "InputWithSuffix"

const Textarea = React.forwardRef(({ className, onChange, value, ...props }, ref) => {
  const internalRef = React.useRef(null)

  React.useEffect(() => {
    if (internalRef.current) {
      internalRef.current.style.height = 'auto'
      internalRef.current.style.height = internalRef.current.scrollHeight + 'px'
    }
  }, [value])

  const handleChange = (e) => {
    if (internalRef.current) {
      internalRef.current.style.height = 'auto'
      internalRef.current.style.height = internalRef.current.scrollHeight + 'px'
    }
    if (onChange) onChange(e)
  }

  return (
    <textarea
      className={cn(
        "flex w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 overflow-hidden resize-none",
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

const InputField = React.forwardRef(({ label, id, error, className = '', inputClassName = '', ...props }, ref) => {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <Input
        id={id}
        ref={ref}
        className={cn(
          error ? "border-destructive focus-visible:ring-destructive" : "",
          inputClassName
        )}
        {...props}
      />
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  )
})
InputField.displayName = "InputField"

const InputFieldWithSuffix = React.forwardRef(({ label, id, error, className = '', inputClassName = '', suffix, ...props }, ref) => {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <InputWithSuffix
        id={id}
        ref={ref}
        suffix={suffix}
        className={cn(
          error ? "border-destructive focus-visible:ring-destructive" : "",
          inputClassName
        )}
        {...props}
      />
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  )
})
InputFieldWithSuffix.displayName = "InputFieldWithSuffix"

const TextareaField = React.forwardRef(({ label, id, error, className = '', rows = 4, ...props }, ref) => {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <Textarea
        id={id}
        rows={rows}
        ref={ref}
        className={error ? "border-destructive focus-visible:ring-destructive" : ""}
        {...props}
      />
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  )
})
TextareaField.displayName = "TextareaField"

export { Input, InputWithSuffix, Textarea, InputField, InputFieldWithSuffix, TextareaField }
