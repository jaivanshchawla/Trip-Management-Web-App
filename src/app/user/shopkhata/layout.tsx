'use client'
import { useState, useEffect } from 'react';
import { Inter } from "next/font/google";
import Link from 'next/link';
import '@/app/globals.css';
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

// Notification Component
const Notification = ({ message, onClose }: { message: string, onClose: () => void }) => {
  return (
    <div className="fixed top-5 right-5 bg-lightOrange border-l-4 border-yellow-500 text-buttonTextColor p-4 rounded shadow-lg">
      <div className="flex items-center justify-between">
        <span>{message}</span>
        <button onClick={onClose} className="ml-4 text-buttonTextColor transform duration-300 ease-in-out hover:scale-125">X</button>
      </div>
    </div>
  );
};

const ShopLayout = ({ children }: { children: React.ReactNode }) => {
  // State for controlling notification visibility

  const headings: any = {
    '/user/shopkhata': 'Shops',
    '/user/shopkhata/create': 'New Shop',
  };

  const pathname = usePathname();


  return (
    <div className={`${inter.className} max-h-screen flex flex-col`}>
      <div className="container mx-auto p-2 flex flex-col bg-white">
        <div className="flex items-center justify-between mb-4 border-b-2 border-gray-300 pb-2">
          <h1 className="text-3xl font-bold text-black">{headings[pathname] || 'Shops'}</h1>
          <div className="flex space-x-4">
            {!pathname.includes('create') &&
              <Button>
                <Link href="/user/shopkhata/create">
                  Add Shop
                </Link>
              </Button>
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

export default ShopLayout;
