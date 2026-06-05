import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";

export default function AdminLayout({ children }) {
	return (
		<main>
			<SidebarProvider
				style={{
					"--sidebar-width": "calc(var(--spacing) * 72)",
					"--header-height": "calc(var(--spacing) * 12)",
				}}
			>
				<AppSidebar variant='inset' />
				<SidebarInset>{children}</SidebarInset>
				<Toaster />
			</SidebarProvider>
		</main>
	);
}
