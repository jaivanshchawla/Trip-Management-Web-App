import { Inter } from "next/font/google"
import "@/app/globals.css"
import Header from "@/components/admin/Header"
import Sidebar from "@/components/admin/Sidebar"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
    title: "Awajahi Dashboard",
    description: "Admin dashboard for Awajahi",
}

export default function RootLayout({
    children,
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <div className="min-h-screen bg-gray-100 flex flex-col">
                    <Header />
                    <div className="grid grid-cols-6">
                        <div className="col-span-1">
                            <Sidebar />
                        </div>

                        <main className="flex-1 overflow-y-auto p-8 col-span-5">{children}</main>
                    </div>
                </div>
            </body>
        </html>
    )
}


