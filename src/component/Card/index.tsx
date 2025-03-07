"use client";

import React, { useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import Image from "next/image";

interface UnsplashImage {
	id: string;
	imageUrl: string;
	authorName: string;
	authorImage: string;
	likeCount: number;
}

const UNSPLASH_ACCESS_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;

const fetchImages = async ({
	queryKey,
	pageParam = 1,
}: {
	queryKey: string[];
	pageParam?: number;
}) => {
	const [, query] = queryKey;
	const endpoint = query
		? `https://api.unsplash.com/search/photos?query=${query}&page=${pageParam}&per_page=15&client_id=${UNSPLASH_ACCESS_KEY}`
		: `https://api.unsplash.com/photos?page=${pageParam}&per_page=15&client_id=${UNSPLASH_ACCESS_KEY}`;

	const res = await fetch(endpoint);

	if (!res.ok) {
		throw new Error("Failed to fetch images");
	}

	const data = await res.json();

	// Map results to ensure a consistent structure
	return query
		? data.results.map(
				(img: {
					id: string;
					urls: { small: string };
					user: { name: string; profile_image: { medium: string } };
					likes: number;
				}) => ({
					id: img.id,
					imageUrl: img.urls?.small || "",
					authorName: img.user?.name || "Unknown",
					authorImage: img.user?.profile_image?.medium || "",
					likeCount: img.likes || 0,
				})
		  )
		: data.map(
				(img: {
					id: string;
					urls: { small: string };
					user: { name: string; profile_image: { medium: string } };
					likes: number;
				}) => ({
					id: img.id,
					imageUrl: img.urls?.small || "",
					authorName: img.user?.name || "Unknown",
					authorImage: img.user?.profile_image?.medium || "",
					likeCount: img.likes || 0,
				})
		  );
};

const UnsplashGallery: React.FC = () => {
	const [query, setQuery] = useState<string>("");

	const {
		data,
		error,
		fetchNextPage,
		hasNextPage,
		isFetching,
		isFetchingNextPage,
	} = useInfiniteQuery({
		queryKey: ["images", query],
		queryFn: fetchImages,
		getNextPageParam: (_: unknown, allPages: UnsplashImage[][]) =>
			allPages.length + 1, // Increment page number
		initialPageParam: 1,
	});

	const images = data?.pages.flat() || [];

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		setQuery(query);
	};

	return (
		<div className='w-full xl:w-[1200px] mx-auto p-6 bg-gray-100'>
			<div className='flex justify-between my-20 items-center'>
				<h1 className='font-bold text-4xl'>Photo Search</h1>
				<p>{new Date().toLocaleDateString()}</p>
			</div>

			{/* Search Bar */}
			<form onSubmit={handleSearch} className='w-full gap-4 my-4 flex'>
				<input
					type='text'
					placeholder='Search images...'
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					className='p-2 rounded-md border border-gray-300 w-full'
				/>
				<button
					type='submit'
					className='px-4 cursor-pointer py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600'>
					Search
				</button>
			</form>

			{/* Loading & Error */}
			{isFetching && !isFetchingNextPage && (
				<p className='text-center py-4'>Loading...</p>
			)}
			{error && (
				<p className='text-center text-red-500 py-4'>
					{(error as unknown as Error).message}
				</p>
			)}

			{/* Image Grid */}
			<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
				{images.map((image: UnsplashImage) => (
					<div
						key={image.id}
						className='w-full bg-gray-200 rounded-2xl shadow mx-auto relative'>
						{/* Image */}
						<Image
							src={image.imageUrl}
							alt={image.authorName}
							unoptimized
							width={500}
							height={300}
							className='w-full rounded-t-2xl h-56 object-cover'
						/>

						{/* Like Count in Top-Right Corner */}
						<div className='absolute top-2 right-2 bg-white bg-opacity-75 text-black px-2 py-1 rounded-full text-sm'>
							❤️ {image.likeCount}
						</div>

						{/* Author Info */}
						<div className='p-4'>
							<div className='flex justify-between items-center gap-4'>
								<Image
									src={image.authorImage}
									alt={image.authorName}
									width={40}
									height={40}
									className='w-10 h-10 rounded-full object-cover border'
								/>
								<div>
									<h3>{image.authorName}</h3>
								</div>
							</div>
						</div>
					</div>
				))}
			</div>

			{/* Load More Button */}
			{hasNextPage && (
				<div className='text-center mt-8'>
					<button
						onClick={() => fetchNextPage()}
						disabled={isFetchingNextPage}
						className={`px-4 cursor-pointer py-2 rounded-md ${
							isFetchingNextPage
								? "bg-gray-300 cursor-not-allowed"
								: "bg-blue-500 text-white hover:bg-blue-600"
						}`}>
						{isFetchingNextPage ? "Loading..." : "Load More"}
					</button>
				</div>
			)}

			<div className='text-center mt-8 text-gray-500'>
				Made with ❤️ and caprisun by{" "}
				<a href='https://github.com/Franklin-tech01'>Franklin</a>
			</div>
		</div>
	);
};

export default UnsplashGallery;
