'use client'
import { Button } from "@/components/ui/button";
import { Inter } from "next/font/google";
import Link from 'next/link';
import { useParams, usePathname } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });



const TripsLayout = ({ children }: { children: React.ReactNode }) => {
  const {tripId} = useParams()
  const pathname = usePathname()
 

  const headings: any = {
    '/user/trips': 'Trips',
    '/user/trips/create': 'Create New Trip',
    [`/user/trips/${tripId}`] : 'Trip Details',
    [`/user/trips/${tripId}/documents`] : 'Trip Documents',
    '/user/trips/invoice' : 'Invoice Generation'
  }

  return (
    <div className={`${inter.className} max-h-screen flex flex-col`}>
      <div className="container mx-auto p-2 flex flex-col bg-white">
        <div className="flex items-center justify-between mb-4 border-b-2 border-gray-300 pb-2">
          <h1 className="text-3xl font-bold text-black">{headings[pathname]}</h1>
          <div className="flex space-x-4">
            {!pathname.includes('create') &&
              <Link href="/user/trips/create">
                <Button>

                  Add Trip
                </Button>
              </Link>

            }

          </div>
        </div>
        <div className="flex-grow overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default TripsLayout;
