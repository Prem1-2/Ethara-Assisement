"use client";

import * as React from "react";

import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { LayoutDashboardIcon, UsersIcon, FolderKanbanIcon, ListChecksIcon, UserCircleIcon, UserPlusIcon, BarChart3Icon, CommandIcon, MessageSquareIcon } from "lucide-react";

const data = {
	navMain: [
		{ title: "Dashboard", url: "/admin/dashboard", icon: <LayoutDashboardIcon /> },
		{ title: "Teams", url: "/admin/teams", icon: <UsersIcon /> },
		{ title: "Projects", url: "/admin/projects", icon: <FolderKanbanIcon /> },
		{ title: "Tasks", url: "/admin/tasks", icon: <ListChecksIcon /> },
		{ title: "Team Members", url: "/admin/team-members", icon: <UserCircleIcon /> },
		{ title: "Create Users", url: "/admin/create-user", icon: <UserPlusIcon /> },
		{ title: "Progress Tracker", url: "/admin/progress", icon: <BarChart3Icon /> },
		{ title: "Messages", url: "/admin/messages", icon: <MessageSquareIcon /> },
	],
};

export function AppSidebar({ ...props }) {
	return (
		<Sidebar collapsible='offcanvas' {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							asChild
							className='data-[slot=sidebar-menu-button]:p-1.5!'
						>
							<div>
								<CommandIcon className='size-5!' />
								<span className='text-base font-semibold'>Ethara AI.</span>
							</div>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={data.navMain} />
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={data.user} />
			</SidebarFooter>
		</Sidebar>
	);
}
