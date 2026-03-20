import * as React from "react"
import { cn } from "@/lib/utils"

const badgeVariants = {
  default: "bg-primary text-primary-foreground hover:bg-primary/80",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/80",
  outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  link: "text-primary underline-offset-4 hover:underline",
}

function Badge({ className, variant = "default", children, ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        badgeVariants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

const STATUS_LABELS = {
  rascunho: 'Rascunho',
  em_analise: 'Em Análise',
  concluido: 'Concluído',
  arquivado: 'Arquivado',
}

function StatusBadge({ status, className }) {
  const statusVariants = {
    rascunho: "bg-grey-100 text-grey-600 border-grey-200",
    em_analise: "bg-warning-light text-warning border-warning/20",
    concluido: "bg-success-light text-success border-success/20",
    arquivado: "bg-grey-200 text-grey-500 border-grey-300",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        statusVariants[status] || statusVariants.rascunho,
        className
      )}
    >
      {STATUS_LABELS[status] || status}
    </span>
  )
}

export { Badge, StatusBadge }
