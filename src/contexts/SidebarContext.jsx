import { SidebarProvider as ShadcnSidebarProvider, useSidebar as useShadcnSidebar } from '@/components/ui/sidebar'

export function SidebarProvider({ children }) {
  return (
    <ShadcnSidebarProvider defaultOpen={true}>
      {children}
    </ShadcnSidebarProvider>
  )
}

export function useSidebar() {
  const context = useShadcnSidebar()
  return {
    ...context,
    collapsed: !context.open,
    toggle: context.toggleSidebar,
  }
}
