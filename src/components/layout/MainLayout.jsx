'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { IoDocumentsOutline, IoLogOutOutline, IoWalletOutline } from 'react-icons/io5';
import Cookies from 'js-cookie';
import Image from 'next/image';
import logo from '@/assets/awajahi logo.png';
import jwt from 'jsonwebtoken';
import { TfiHome, TfiWorld } from "react-icons/tfi";
import { PiSteeringWheelLight, PiTruck, PiBank } from "react-icons/pi";
import { TbUsersGroup } from "react-icons/tb";
import { HiOutlineUser } from "react-icons/hi";
import { ExpenseProvider } from '@/context/context';
import { useToast } from '../hooks/use-toast';
import { ExpenseProvider as RedExpense } from '../ExpenseProvider';
import { ReminderProvider } from '@/context/reminderContext';
import { Button } from '../ui/button';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import Loading from '@/app/user/loading';
import { loadingIndicator } from '../ui/LoadingIndicator';
import { TbFileInvoice } from 'react-icons/tb';

const MainLayout = ({ children }) => {
  const { tripId } = useParams()
  const pathname = usePathname();
  const router = useRouter();
  const [selected, setSelected] = useState(null);
  const [logoutModal, setLogoutModal] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const { toast } = useToast()

  // useEffect(() => {
  //   const fetchPhone = async () => {
  //     const response = await fetch('/api/login');
  //     const data = await response.json();
  //     setUser(data.user);
  //     setPhone(data.user.phone);
  //   };
  //   fetchPhone();
  // }, []);



  useEffect(() => {
    const updateVisit = Cookies.get('updateVisit');
    if (updateVisit == '1') {
      toast({
        title: 'Welcome Back!',
        description: 'New Feature to generate Frieght Memo has been added',
        variant: 'featureUpdate'
      })
    }
  }, [])

  useEffect(() => {
    const initialSelected = primaryMenuItems.find(item => pathname.startsWith(item.href));
    if (initialSelected) {
      setSelected(initialSelected.label);
    }
  }, [pathname]);

  const roleToken = Cookies.get('role_token');
  const decodedToken = jwt.decode(roleToken);

  const primaryMenuItems = [
    { href: '/user/home', label: 'Home', icon: TfiHome },
    { href: '/user/trips', label: 'Trips', icon: TfiWorld },
    { href: `/user/expenses`, label: 'Expenses', icon: IoWalletOutline },
    { href: '/user/documents', label: 'Docs', icon: IoDocumentsOutline },
    { href: '/user/invoice', label: 'Invoices', icon: TbFileInvoice },
  ];

  const secondaryMenuItems = [
    { href: '/user/drivers', label: 'Drivers', icon: PiSteeringWheelLight },
    { href: '/user/trucks', label: 'Lorries', icon: PiTruck },
    { href: '/user/parties', label: 'Customers', icon: TbUsersGroup },
    { href: '/user/suppliers', label: 'Suppliers', icon: HiOutlineUser },
    { href: '/user/shopkhata', label: 'Shop Khata', icon: PiBank },
  ];

  const handleSignOut = async () => {
    try {
      setLogoutModal(false)
      setLoggingOut(true);
      await fetch(`/api/logout`);
      Cookies.remove('auth_token');
      router.push('/login');
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#FFFCF9]">
      {
        loggingOut &&
        <div className='modal-class'>
          <div>
            {loadingIndicator}
            <p className='text-center text-white'>Logging Out...</p>
          </div>

        </div>
      }
      {/* Primary Sidebar - fixed width, fixed position */}
      <div className="w-16 xl:w-20 bg-bottomNavBarColor text-white h-full flex flex-col justify-between shadow-md shadow-black rounded-r-xl fixed">
        <div>
          {/* Primary Menu */}
          <ul className="list-none p-0 m-0 flex flex-col gap-4 py-6">
            {primaryMenuItems.map((item) => (
              <li key={item.href} className="mb-2">
                <Link href={item.href}>
                  <div
                    className={`flex flex-col space-y-2 items-center p-4 text-lg font-semibold transition duration-300 ease-in-out rounded-md 
                      ${pathname === (item.href) ? 'bg-white text-black' : 'hover:bg-lightOrange'}`}
                    onClick={() => setSelected(item.label)}
                  >
                    <item.icon className="mx-auto" size={28} />
                    <span className='text-sm text-center font-normal'>{item.label}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Sign Out */}
        <button className="py-4 cursor-pointer flex flex-col space-y-2 items-center justify-center hover:bg-lightOrange" onClick={() => setLogoutModal(true)}>
          <IoLogOutOutline size={28} />
          <span className='text-sm text-white text-center font-normal'>Log Out</span>
        </button>
      </div>

      {logoutModal &&
        <AnimatePresence>
          <motion.div
            className="modal-class"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-lg shadow-xl p-4 w-full max-w-sm mx-4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 15, stiffness: 300 }}
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold">Confirm Logout</h3>
                <Button variant="ghost" size="sm" onClick={() => setLogoutModal(false)} className='px-2 py-0'>
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </Button>
              </div>
              <p className="text-gray-600 mb-6">Are you sure you want to logout?</p>
              <div className="flex justify-end space-x-4">
                <Button variant="outline" onClick={() => setLogoutModal(false)}>
                  Cancel
                </Button>
                <Button onClick={() => handleSignOut()}>
                  Logout
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      }

      {/* Secondary Sidebar */}
      <div className="ml-16 xl:ml-20 w-56 xl:w-60 bg-[#FFFCF9] text-black h-screen overflow-y-auto flex flex-col justify-between"> {/* Adjusted width and overflow */}
        <div className="flex items-center justify-center py-6">
          <Image src={logo} alt="logo" width={51} height={60} priority />
          <span className="ml-2 text-lg hidden font-semibold md:block text-black">Awajahi</span>
        </div>
        <ul className="flex-grow list-none p-0 m-0 flex-col gap-4">
          {secondaryMenuItems.map((item) => (
            <li key={item.href} className="my-1 border-b-2 border-gray-300">
              <div
                className={`p-2 `}
              >
                <Link href={item.href}>
                  <div
                    className={`flex items-center p-3 text-sm xl:text-lg font-semibold transition duration-300 ease-in-out rounded-xl
                    ${pathname === (item.href) ? 'bg-[#FF6A00] text-white' : 'hover:bg-[#FFC49980]'}`}
                    onClick={() => setSelected(item.label)}
                  >
                    <item.icon className="mr-3" size={25} />
                    <span className="text-lg flex items-center gap-2">
  {item.label}
  {item.label === 'Shop Khata' && (
    <span
      className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded font-bold text-xs"
      style={{ letterSpacing: '.5px' }}
      title="This feature is in beta and may change"
    >
      Beta
    </span>
  )}
</span>

                  </div>
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content Area */}
      <div className={`w-full min-h-screen overflow-y-auto pb-4 rounded-3xl bg-white shadow-black shadow-xl my-2 ${pathname.startsWith('/user/trips/trip') ? 'thin-scrollbar' : 'no-scrollbar'} `}>

        {/* Render dynamic content here */}
        <RedExpense>
          <ReminderProvider>
            {children}
          </ReminderProvider>
        </RedExpense>
      </div>
    </div >
  );
};

export default MainLayout;
