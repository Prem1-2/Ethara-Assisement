"use client";

import * as React from "react";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { StreakCard } from "@/components/app_component/member/dashboard/streakCard";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { LayoutDashboardIcon, ListChecksIcon, MessageSquareIcon, CommandIcon, FolderKanbanIcon, UsersIcon } from "lucide-react";

const navItems = [
	{
		title: "Dashboard",
		url: "/member/dashboard",
		icon: <LayoutDashboardIcon />,
	},
	{
		title: "My Projects",
		url: "/member/projects",
		icon: <FolderKanbanIcon />,
	},
	{
		title: "My Tasks",
		url: "/member/tasks",
		icon: <ListChecksIcon />,
	},
	{
		title: "My Team",
		url: "/member/team",
		icon: <UsersIcon />,
	},
	{
		title: "Messages",
		url: "/member/messages",
		icon: <MessageSquareIcon />,
	},
];

export function MemberSidebar({ ...props }) {
	return (
		<Sidebar collapsible="offcanvas" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:p-1.5!">
							<div>
								<CommandIcon className="size-5!" />
								<span className="text-base font-semibold">My Workspace</span>
							</div>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={navItems} />
				<StreakCard />
			</SidebarContent>
			<SidebarFooter>
				<NavUser />
			</SidebarFooter>
		</Sidebar>
	);
}
