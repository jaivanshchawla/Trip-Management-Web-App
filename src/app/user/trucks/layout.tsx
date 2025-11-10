'use client'
import { Button } from "@/components/ui/button";

import { Inter } from "next/font/google";
import Link from 'next/link';
import { usePathname } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

const headings: any = {
  '/user/trucks': 'Lorries',
  '/user/trucks/create': 'New Lorry'
}

const TrucksLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname()
  return (
    <div className={`${inter.className} max-h-screen flex flex-col`}>
      <div className="container mx-auto p-2 flex flex-col bg-white">
        <div className="flex items-center justify-between mb-4 border-b-2 border-gray-300 pb-2">
          <h1 className="text-3xl font-bold text-black">{headings[pathname] || 'Lorry Details'}</h1>
          <div className="flex space-x-4">
            {!pathname.includes('create') &&
              <Link href="/user/trucks/create">
                <Button >

                  Add Lorry

                </Button>
              </Link>
            }
          </div>
        </div>
        <div className="flex-grow">
          {children}
        </div>
      </div>
    </div>
  );
};

export default TrucksLayout;
