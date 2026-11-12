import { OSShell } from "@/components/os/OSShell"

// Shared by /, /app/<id> and /resume: the OS shell stays mounted while the URL changes, so apps open
// and close with animations instead of page loads, and the browser back button closes apps.
export default function OSLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      {children}
      <OSShell />
    </>
  )
}
