"use client";

import React from "react";
import UnsplashGallery from "@/component/Card";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export default function Page() {
	const queryClient = new QueryClient();

	return (
		<QueryClientProvider client={queryClient}>
			<div className='min-h-screen bg-gray-100'>
				<UnsplashGallery />
			</div>
		</QueryClientProvider>
	);
}
