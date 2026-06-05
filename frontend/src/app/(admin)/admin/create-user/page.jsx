"use client";
import { SiteHeader } from "@/components/site-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
	UserPlusIcon,
	FileJsonIcon,
	FileSpreadsheetIcon,
} from "lucide-react";
import { ManualForm } from "@/components/app_component/admin/create-user/ManualForm";
import { JsonUpload } from "@/components/app_component/admin/create-user/JsonUpload";
import { CsvUpload } from "@/components/app_component/admin/create-user/CsvUpload";


export default function CreateUserPage() {
	return (
		<>
			<SiteHeader title="Create Users" />
			<div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
				<div className=" w-full">
					<Tabs defaultValue="manual">
						<TabsList className="mb-4">
							<TabsTrigger value="manual">
								<UserPlusIcon className="h-4 w-4 mr-1.5" /> Manual
							</TabsTrigger>
							<TabsTrigger value="json">
								<FileJsonIcon className="h-4 w-4 mr-1.5" /> JSON
							</TabsTrigger>
							<TabsTrigger value="csv">
								<FileSpreadsheetIcon className="h-4 w-4 mr-1.5" /> CSV
							</TabsTrigger>
						</TabsList>

						<TabsContent value="manual">
							<Card>
								<CardHeader>
									<CardTitle>Create a single user</CardTitle>
									<CardDescription>Fill in the form to manually create a new member account.</CardDescription>
								</CardHeader>
								<CardContent>
									<ManualForm />
								</CardContent>
							</Card>
						</TabsContent>

						<TabsContent value="json">
							<Card>
								<CardHeader>
									<CardTitle>Import from JSON</CardTitle>
									<CardDescription>
										Upload a JSON file or paste JSON directly. Download the template to see the expected format.
									</CardDescription>
								</CardHeader>
								<CardContent>
									<JsonUpload />
								</CardContent>
							</Card>
						</TabsContent>

						<TabsContent value="csv">
							<Card>
								<CardHeader>
									<CardTitle>Import from CSV</CardTitle>
									<CardDescription>
										Upload a CSV file with user data. Download the template to see the required columns.
									</CardDescription>
								</CardHeader>
								<CardContent>
									<CsvUpload />
								</CardContent>
							</Card>
						</TabsContent>
					</Tabs>
				</div>
			</div>
		</>
	);
}
