"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function UserDetailsSection({ userData, isEditing, onSave }) {
	const [formData, setFormData] = useState(userData);

	useEffect(() => {
		setFormData(userData);
	}, [userData]);
	const [isSaving, setIsSaving] = useState(false);
	const [showPasswordForm, setShowPasswordForm] = useState(false);
	const [passwordData, setPasswordData] = useState({
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
	});
	const [showPasswordFields, setShowPasswordFields] = useState(false);
	const [passwordError, setPasswordError] = useState("");
	const [isSavingPassword, setIsSavingPassword] = useState(false);

	const isAdmin = userData.role === "admin";
	const canEdit = isEditing && isAdmin;

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSave = async () => {
		setIsSaving(true);
		try {
			await onSave(formData);
		} finally {
			setIsSaving(false);
		}
	};

	const handlePasswordChange = async () => {
		setPasswordError("");

		if (passwordData.newPassword !== passwordData.confirmPassword) {
			setPasswordError("Passwords do not match");
			return;
		}

		if (passwordData.newPassword.length < 8) {
			setPasswordError("Password must be at least 8 characters");
			return;
		}

		setIsSavingPassword(true);
		try {
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1000));
			setPasswordData({
				currentPassword: "",
				newPassword: "",
				confirmPassword: "",
			});
			setShowPasswordForm(false);
			setShowPasswordFields(false);
		} finally {
			setIsSavingPassword(false);
		}
	};

	return (
		<div className='space-y-6'>
			{/* Personal Information */}
			<Card className='card-premium'>
				<CardHeader>
					<CardTitle>Personal Information</CardTitle>
					<CardDescription>
						{canEdit ?
							"Update your profile information"
						:	"View your profile information (read-only)"}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<FieldGroup className='gap-6'>
						<div className='grid gap-4 md:grid-cols-2'>
							<Field>
								<FieldLabel htmlFor='full_name'>Full Name</FieldLabel>
								<Input
									id='full_name'
									name='name'
									value={formData.name || ""}
									onChange={handleInputChange}
									disabled={!canEdit}
									className='input-focus'
								/>
								{!canEdit && isAdmin === false && (
									<FieldDescription className='text-xs'>
										<svg
											className='w-4 h-4 inline mr-1'
											fill='currentColor'
											viewBox='0 0 24 24'
										>
											<path d='M12 1C6.48 1 2 5.48 2 11s4.48 10 10 10 10-4.48 10-10S17.52 1 12 1zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 7 15.5 7 14 7.67 14 8.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 7 8.5 7 7 7.67 7 8.5 7.67 10 8.5 10zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z' />
										</svg>
										Read-only (Members cannot edit)
									</FieldDescription>
								)}
							</Field>
							<Field>
								<FieldLabel htmlFor='email'>Email Address</FieldLabel>
								<Input
									id='email'
									name='email'
									type='email'
									value={formData.email || ""}
									onChange={handleInputChange}
									disabled={!canEdit}
									className='input-focus'
								/>
							</Field>
						</div>

						<div className='grid gap-4 md:grid-cols-2'>
							<Field>
								<FieldLabel htmlFor='job_title'>Job Title</FieldLabel>
								<Input
									id='job_title'
									name='title'
									value={formData.title || ""}
									onChange={handleInputChange}
									disabled={!canEdit}
									className='input-focus'
								/>
							</Field>
							<Field>
								<FieldLabel htmlFor='department'>Department</FieldLabel>
								<Input
									id='department'
									name='department'
									value={formData.department || ""}
									onChange={handleInputChange}
									disabled={!canEdit}
									className='input-focus'
								/>
							</Field>
						</div>

						{canEdit && (
							<div className='flex gap-3 pt-4 border-t border-border'>
								<Button
									onClick={handleSave}
									disabled={isSaving}
									className='btn-primary'
								>
									{isSaving ? "Saving..." : "Save Changes"}
								</Button>
							</div>
						)}
					</FieldGroup>
				</CardContent>
			</Card>

			{/* Organization Information */}
			<Card className='card-premium'>
				<CardHeader>
					<CardTitle>Organization Information</CardTitle>
					<CardDescription>Company and team details</CardDescription>
				</CardHeader>
				<CardContent>
					<FieldGroup className='gap-6'>
						<Field>
							<FieldLabel htmlFor='organization'>Organization</FieldLabel>
							<Input
								id='organization'
								name='organization'
								value={formData.organization || ""}
								disabled={true}
								className='input-focus bg-muted/50'
							/>
							<FieldDescription className='text-xs'>
								Contact your organization admin to change this
							</FieldDescription>
						</Field>
					</FieldGroup>
				</CardContent>
			</Card>

			{/* Security Settings - Admin Only */}
			{isAdmin && (
				<Card className='card-premium border-primary/20'>
					<CardHeader>
						<CardTitle className='flex items-center gap-2'>
							<svg
								className='w-5 h-5'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
								/>
							</svg>
							Security Settings
						</CardTitle>
						<CardDescription>
							Manage your password and security preferences
						</CardDescription>
					</CardHeader>
					<CardContent>
						<FieldGroup className='gap-6'>
							{!showPasswordForm ?
								<Button
									onClick={() => setShowPasswordForm(true)}
									variant='outline'
									className='w-full md:w-auto'
								>
									Change Password
								</Button>
							:	<div className='space-y-4'>
									{!showPasswordFields ?
										<div className='p-4 rounded-lg bg-muted/50 border border-border'>
											<p className='text-sm text-muted-foreground mb-3'>
												For security, we need to verify your current password
												before making changes.
											</p>
											<Field>
												<FieldLabel htmlFor='currentPassword'>
													Current Password
												</FieldLabel>
												<Input
													id='currentPassword'
													type='password'
													placeholder='Enter your current password'
													value={passwordData.currentPassword}
													onChange={(e) =>
														setPasswordData((prev) => ({
															...prev,
															currentPassword: e.target.value,
														}))
													}
													className='input-focus'
												/>
											</Field>
											<div className='flex gap-3 pt-4'>
												<Button
													onClick={() => setShowPasswordFields(true)}
													disabled={!passwordData.currentPassword}
													className='btn-primary'
												>
													Verify
												</Button>
												<Button
													onClick={() => {
														setShowPasswordForm(false);
														setPasswordData({
															currentPassword: "",
															newPassword: "",
															confirmPassword: "",
														});
														setPasswordError("");
													}}
													variant='outline'
												>
													Cancel
												</Button>
											</div>
										</div>
									:	<div className='space-y-4'>
											{passwordError && (
												<div className='p-3 rounded-lg bg-destructive/10 border border-destructive/20'>
													<p className='text-sm text-destructive'>
														{passwordError}
													</p>
												</div>
											)}
											<Field>
												<FieldLabel htmlFor='newPassword'>
													New Password
												</FieldLabel>
												<Input
													id='newPassword'
													type='password'
													placeholder='Enter your new password'
													value={passwordData.newPassword}
													onChange={(e) => {
														setPasswordError("");
														setPasswordData((prev) => ({
															...prev,
															newPassword: e.target.value,
														}));
													}}
													className='input-focus'
												/>
												<FieldDescription className='text-xs'>
													At least 8 characters with mix of letters, numbers,
													and symbols
												</FieldDescription>
											</Field>
											<Field>
												<FieldLabel htmlFor='confirmPassword'>
													Confirm Password
												</FieldLabel>
												<Input
													id='confirmPassword'
													type='password'
													placeholder='Confirm your new password'
													value={passwordData.confirmPassword}
													onChange={(e) => {
														setPasswordError("");
														setPasswordData((prev) => ({
															...prev,
															confirmPassword: e.target.value,
														}));
													}}
													className='input-focus'
												/>
											</Field>
											<div className='flex gap-3 pt-4'>
												<Button
													onClick={handlePasswordChange}
													disabled={
														isSavingPassword ||
														!passwordData.newPassword ||
														!passwordData.confirmPassword
													}
													className='btn-primary'
												>
													{isSavingPassword ? "Updating..." : "Update Password"}
												</Button>
												<Button
													onClick={() => {
														setShowPasswordForm(false);
														setShowPasswordFields(false);
														setPasswordData({
															currentPassword: "",
															newPassword: "",
															confirmPassword: "",
														});
														setPasswordError("");
													}}
													variant='outline'
												>
													Cancel
												</Button>
											</div>
										</div>
									}
								</div>
							}
						</FieldGroup>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
