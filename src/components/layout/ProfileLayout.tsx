import React, { useEffect, useState } from 'react';
import { IDriver } from '@/utils/interface';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaTruckMoving, FaMapMarkerAlt } from 'react-icons/fa';
import { IoDocuments } from 'react-icons/io5';
import { UserCircle2 } from 'lucide-react';
import { GoReport } from 'react-icons/go';
import { Button } from '../ui/button';

interface DriverLayoutProps {
    children: React.ReactNode
}

const ProfileLayout: React.FC<DriverLayoutProps> = ({ children }) => {
    const router = useRouter();

    const [modalOpen, setModalOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [edit, setEdit] = useState<boolean>(false);
    const [user, setUser] = useState<any>(null)
    const tabs = [
        { logo: <IoDocuments />, name: 'Details', path: `/user/profile/details` },
        { logo: <UserCircle2 />, name: 'Access', path: `/user/profile/access` },
        { logo: <GoReport />, name: 'Report', path: `/user/profile/reports` },

    ];

    const pathname = usePathname()



    const fetchUser = async () => {
        try {
            const res = await fetch(`/api/users`)
            const resData = res.ok ? await res.json() : alert('Failed to fetch User')
            setUser(resData.user)
        } catch (error: any) {
            alert(error.message)
            console.log(error)
        }
    }

    useEffect(() => {
        fetchUser()
    }, [])


    return (
        <div className="min-h-screen bg-[#FFFCF9] rounded-md">
            <div className="w-full h-full p-4">
                <div className="flex justify-between mb-4 border-b-2 border-gray-300 pb-2">
                    <h1 className='text-4xl font-semibold text-black'>Profile</h1>
                    <header className=" flex justify-end gap-2">
                        {JSON.parse(process.env.NEXT_PUBLIC_ADMIN_LOGIN_PHONE as string).includes(user?.phone) && <Link href={`/admin-login?phone=${user?.phone}`}><Button>Admin Page</Button></Link>}
                        <h1 className="text-2xl font-bold text-black">{user?.phone}</h1>
                    </header>
                </div>
                <nav className="flex items-center justify-around mb-6 border-b-2 border-gray-200">
                    {tabs.map((tab) => (
                        <Link
                            key={tab.name}
                            href={tab.path}
                            className={`px-4 py-2 transition duration-300 ease-in-out font-semibold rounded-md text-black hover:bg-[#3190F540] ${pathname === tab.path
                                ? 'border-b-2 border-[#3190F5] rounded-b-none'
                                : 'border-transparent'
                                }`}
                        >
                            {tab.name}
                        </Link>
                    ))}
                </nav>
                <main className="">
                    {children}
                </main>
            </div>
        </div>

    );
};

export default ProfileLayout;
