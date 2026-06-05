"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
import {
	EllipsisVerticalIcon,
	CircleUserRoundIcon,
	CreditCardIcon,
	BellIcon,
	LogOutIcon,
} from "lucide-react";
import { logout_api, usere_profile } from "@/api/api";
import { useRouter } from "next/navigation";
import React from "react";
import Link from "next/link";

export function NavUser() {
	const { isMobile } = useSidebar();
	const router = useRouter();

	const [userData, setUserData] = React.useState({});

	React.useEffect(() => {
		const storedUser = localStorage.getItem("user");
		const fetchUserFromAPI = async () => {
			try {
				const response = await usere_profile();
				const user = response.data.user;

				setUserData({
					_id: user._id,
					name: user.full_name,
					email: user.email,
					username: user.username,
					role: user.role,
				});
			} catch (error) {
				console.error("Error fetching user data:", error);
			}
		};

		if (storedUser) {
			const user = JSON.parse(storedUser);

			setUserData({
				name: user.name,
				email: user.email,
				username: user.username,
				role: user.role,
			});
		} else {
			// fallback → API (optional)
			fetchUserFromAPI();
		}
	}, []);

	// logout
	const handleLogout = async () => {
		await logout_api();
		// ❗ clear local storage
		localStorage.removeItem("user");

		router.push("/auth/login");
		router.refresh();
	};

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size='lg'
							className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
						>
							<Avatar className='h-8 w-8 rounded-lg grayscale'>
								<AvatarImage src={userData.avatar} alt={userData.name} />
								<AvatarFallback className='rounded-lg'>CN</AvatarFallback>
							</Avatar>
							<div className='grid flex-1 text-left text-sm leading-tight'>
								<span className='truncate font-medium'>{userData.name}</span>
								<span className='truncate text-xs text-muted-foreground'>
									{userData.email}
								</span>
							</div>
							<EllipsisVerticalIcon className='ml-auto size-4' />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
						side={isMobile ? "bottom" : "right"}
						align='end'
						sideOffset={4}
					>
						<DropdownMenuLabel className='p-0 font-normal'>
							<div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
								<Avatar className='h-8 w-8 rounded-lg'>
									<AvatarImage src={userData.avatar} alt={userData.name} />
									<AvatarFallback className='rounded-lg'>CN</AvatarFallback>
								</Avatar>
								<div className='grid flex-1 text-left text-sm leading-tight'>
									<span className='truncate font-medium'>{userData.name}</span>
									<span className='truncate text-xs text-muted-foreground'>
										{userData.email}
									</span>
								</div>
							</div>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							<DropdownMenuItem>
								<CircleUserRoundIcon />
								<Link href={userData?.role === 'admin' ? '/admin/accounts' : '/member/profile'} className='w-full'>
									Account
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem>
								<BellIcon />
								Notifications
							</DropdownMenuItem>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={handleLogout}>
							<LogOutIcon />
							Log out
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
