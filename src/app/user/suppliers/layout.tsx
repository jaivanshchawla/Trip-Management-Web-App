'use client'
import { Button } from "@/components/ui/button";
import { Inter } from "next/font/google";
import Link from 'next/link';
import { usePathname } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

const headings: any = {
  '/user/suppliers': 'Suppliers',
  '/user/suppliers/create': 'New Supplier'
}

const SuppliersLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname()
  return (
    <div className={`${inter.className} max-h-screen flex flex-col`}>
      <div className="container mx-auto p-2 flex flex-col bg-white">
        <div className="flex items-center justify-between mb-4 border-b-2 border-gray-300 pb-2">
          <h1 className="text-3xl font-bold text-black">{headings[pathname] || 'Supplier Details'}</h1>
          <div className="flex space-x-4">
            {!pathname.includes('create') &&
              <Link href="/user/suppliers/create">
                <Button >

                  Add Supplier

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

export default SuppliersLayout;
