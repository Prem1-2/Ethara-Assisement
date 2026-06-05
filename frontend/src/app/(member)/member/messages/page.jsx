"use client";
import { useEffect, useState, useRef, Suspense } from "react";
import { SiteHeader } from "@/components/site-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Send, User, MessageSquare } from "lucide-react";
import { useSearchParams } from "next/navigation";
import axiosInstance from "@/utils/axiosInstance";
import { toast } from "sonner";

function MessagesContent() {
	const searchParams = useSearchParams();
	const targetUserId = searchParams.get("userId");
	
	const [users, setUsers] = useState([]);
	const [selectedUser, setSelectedUser] = useState(null);
	const [messages, setMessages] = useState([]);
	const [newMessage, setNewMessage] = useState("");
	const [loading, setLoading] = useState(false);
	const [currentUser, setCurrentUser] = useState(null);
	const messagesEndRef = useRef(null);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		const savedUser = localStorage.getItem("user");
		if (savedUser) setCurrentUser(JSON.parse(savedUser));

		// Fetch users to chat with
		axiosInstance.get("/users?limit=50")
			.then(res => {
				const allUsers = res.data.users;
				setUsers(allUsers);
				
				// Auto-select user if userId is in URL
				if (targetUserId) {
					const userToSelect = allUsers.find(u => u._id === targetUserId);
					if (userToSelect) setSelectedUser(userToSelect);
				}
			})
			.catch(err => console.error("Error fetching users:", err));
	}, [targetUserId]);

	useEffect(() => {
		if (selectedUser) {
			fetchMessages();
			const interval = setInterval(fetchMessages, 5000); // Poll every 5s
			return () => clearInterval(interval);
		}
	}, [selectedUser]);

	useEffect(scrollToBottom, [messages]);

	const fetchMessages = async () => {
		if (!selectedUser) return;
		try {
			const res = await axiosInstance.get(`/messages?userId=${selectedUser._id}`);
			setMessages(res.data.messages);
		} catch (err) {
			console.error("Error fetching messages:", err);
		}
	};

	const handleSendMessage = async (e) => {
		e.preventDefault();
		if (!newMessage.trim() || !selectedUser) return;

		setLoading(true);
		try {
			await axiosInstance.post("/messages", {
				receiver: selectedUser._id,
				content: newMessage.trim()
			});
			setNewMessage("");
			fetchMessages();
		} catch (err) {
			toast.error("Failed to send message");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex h-screen flex-col bg-background">
			<SiteHeader title="Messages" />
			<div className="flex flex-1 overflow-hidden p-4 gap-4">
				{/* Sidebar: User List */}
				<Card className="w-80 flex flex-col rounded-2xl border-border/50 shadow-sm overflow-hidden">
					<div className="p-4 border-b">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
							<Input placeholder="Search users..." className="pl-9 rounded-xl bg-muted/50 border-transparent focus:bg-background transition-all" />
						</div>
					</div>
					<div className="flex-1 overflow-y-auto p-2 space-y-1">
						{users.filter(u => u._id !== currentUser?._id).map(user => (
							<button
								key={user._id}
								onClick={() => setSelectedUser(user)}
								className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
									selectedUser?._id === user._id ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "hover:bg-muted"
								}`}
							>
								<Avatar className="size-10 border-2 border-background shadow-sm">
									<AvatarFallback className={selectedUser?._id === user._id ? "bg-white/20 text-white" : "bg-primary/10 text-primary"}>
										{user.full_name?.charAt(0).toUpperCase()}
									</AvatarFallback>
								</Avatar>
								<div className="flex-1 text-left min-w-0">
									<p className="text-sm font-bold truncate">{user.full_name}</p>
									<p className={`text-[10px] font-medium truncate ${selectedUser?._id === user._id ? "text-white/70" : "text-muted-foreground"}`}>
										{user.email}
									</p>
								</div>
							</button>
						))}
					</div>
				</Card>

				{/* Chat Area */}
				<Card className="flex-1 flex flex-col rounded-2xl border-border/50 shadow-sm overflow-hidden bg-card">
					{selectedUser ? (
						<>
							<div className="p-4 border-b flex items-center gap-4 bg-muted/20">
								<Avatar className="size-10 border-2 border-background shadow-sm">
									<AvatarFallback className="bg-primary text-primary-foreground">
										{selectedUser.full_name?.charAt(0).toUpperCase()}
									</AvatarFallback>
								</Avatar>
								<div>
									<h2 className="text-sm font-black text-foreground uppercase tracking-tight">{selectedUser.full_name}</h2>
									<div className="flex items-center gap-1.5">
										<div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
										<span className="text-[10px] font-bold text-muted-foreground">Online</span>
									</div>
								</div>
							</div>

							<div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(#334155_1px,transparent_1px)]">
								{messages.map((msg, idx) => {
									const isMe = msg.sender?._id === currentUser?._id;
									return (
										<div key={idx} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
											<div className={`max-w-[70%] rounded-2xl p-3 shadow-sm ${
												isMe ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-background border border-border/50 rounded-tl-none"
											}`}>
												<p className="text-sm font-medium leading-relaxed">{msg.content}</p>
												<p className={`text-[8px] font-black uppercase mt-1 ${isMe ? "text-white/50" : "text-muted-foreground/40"}`}>
													{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
												</p>
											</div>
										</div>
									);
								})}
								<div ref={messagesEndRef} />
							</div>

							<form onSubmit={handleSendMessage} className="p-4 border-t bg-muted/20">
								<div className="flex gap-2">
									<Input
										value={newMessage}
										onChange={(e) => setNewMessage(e.target.value)}
										placeholder="Type your message..."
										className="flex-1 rounded-xl bg-background border-transparent focus:border-primary/20 transition-all shadow-sm"
									/>
									<Button type="submit" disabled={loading} size="icon" className="rounded-xl shadow-lg shadow-primary/20">
										<Send className="size-4" />
									</Button>
								</div>
							</form>
						</>
					) : (
						<div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-4 p-8 text-center">
							<div className="p-6 rounded-full bg-muted/50 border border-border shadow-inner">
								<MessageSquare className="size-12 opacity-20" />
							</div>
							<div className="space-y-1">
								<h3 className="text-lg font-black text-foreground uppercase tracking-widest">Select a User</h3>
								<p className="text-xs font-bold text-muted-foreground/60 max-w-xs mx-auto">Choose someone from the left to start a professional conversation.</p>
							</div>
						</div>
					)}
				</Card>
			</div>
		</div>
	);
}

export default function MessagesPage() {
	return (
		<Suspense fallback={<div className="h-screen flex items-center justify-center font-bold uppercase tracking-widest text-muted-foreground animate-pulse">Loading Workspace...</div>}>
			<MessagesContent />
		</Suspense>
	);
}
