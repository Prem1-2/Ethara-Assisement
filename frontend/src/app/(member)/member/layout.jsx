import { MemberSidebar } from "@/components/member-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";

export default function MemberLayout({ children }) {
	return (
		<main>
			<SidebarProvider
				style={{
					"--sidebar-width": "calc(var(--spacing) * 64)",
					"--header-height": "calc(var(--spacing) * 12)",
				}}
			>
				<MemberSidebar variant="inset" />
				<SidebarInset>{children}</SidebarInset>
				<Toaster />
			</SidebarProvider>
		</main>
	);
}
