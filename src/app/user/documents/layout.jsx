'use client'
import { Roboto } from 'next/font/google';
import { RecentDocumentsProvider } from "@/context/recentDocs";

// Import Roboto font from Google Fonts




export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="">
            <RecentDocumentsProvider>
                {children}
            </RecentDocumentsProvider>
        </div>
    );
}
