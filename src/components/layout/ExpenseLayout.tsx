'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, Route, Building2, Sigma, Receipt, FileText, ClipboardList } from 'lucide-react';
import { formatNumber } from '@/utils/utilArray';
import { useAnimatedNumber } from '../hooks/useAnimatedNumber';

interface TruckLayoutProps {
  children: React.ReactNode;
}

const ExpenseLayout: React.FC<TruckLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();

  const [truckExpense, setTruckExpense] = useState(0);
  const [tripExpense, setTripExpense] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [officeExpense, setOfficeExpense] = useState(0);

  useEffect(() => {
    const fetchExpenses = async () => {
      router.push(`${pathname}`);
      const res = await fetch('/api/expenses/calculate')
      const data = await res.json()
      const { totalTruckExpense, totalTripExpense, totalOfficeExpense } = data.expenses;

      setTruckExpense(totalTruckExpense);
      setTripExpense(totalTripExpense);
      setOfficeExpense(totalOfficeExpense);

      const total = totalTripExpense + totalTruckExpense + totalOfficeExpense;
      setTotalExpense(total);
    };

    fetchExpenses();
  }, [pathname, router]);

  const tabs = [
    { icon: <ClipboardList size={20} />, name: 'All Expenses', path: `/user/expenses` },
    { icon: <Truck size={20} />, name: 'Truck Expenses', path: `/user/expenses/truckExpense` },
    { icon: <Route size={20} />, name: 'Trip Expenses', path: `/user/expenses/tripExpense` },
    { icon: <Building2 size={20} />, name: 'Office Expenses', path: `/user/expenses/officeExpense` },
    { icon: <FileText size={20} />, name: 'Draft Expenses', path: `/user/expenses/draft` }
  ];

  const financialYear = new Date().getMonth() + 1 < 4 ? `${new Date().getFullYear() - 1}-${new Date().getFullYear()}` : `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;

  return (
    <div className="w-full h-full p-4 bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col lg:flex-row lg:justify-between items-start lg:items-center mb-2"
      >
        <div className="w-full flex justify-between">
          <h1 className="text-2xl font-bold mb-2 text-black">Expense Overview ({financialYear})</h1>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
        <ExpenseCard icon={<Truck size={24} />} title="Truck Expense" amount={truckExpense} />
        <ExpenseCard icon={<Route size={24} />} title="Trip Expense" amount={tripExpense} />
        <ExpenseCard icon={<Building2 size={24} />} title="Office Expense" amount={officeExpense} />
        <ExpenseCard icon={<Sigma size={24} />} title="Total Expense" amount={totalExpense} isTotal />
      </div>

      <div className="flex items-start gap-4 mb-4 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <Link key={tab.name} href={tab.path} passHref>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-2 transition duration-300 ease-in-out font-semibold rounded-md text-black hover:bg-[#3190F540] cursor-pointer ${pathname === tab.path
                  ? 'border-b-2 border-[#3190F5] rounded-b-none bg-[#3190F520]'
                  : 'border-transparent'
                }`}
            >
              <div className="flex items-center space-x-2">
                {tab.icon}
                <span>{tab.name}</span>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

interface ExpenseCardProps {
  icon: React.ReactNode;
  title: string;
  amount: number;
  isTotal?: boolean;
}

const ExpenseCard: React.FC<ExpenseCardProps> = ({ icon, title, amount, isTotal = false }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className={`flex flex-col items-center border text-black border-black/25 ${isTotal ? 'bg-[#FF00005E]' : 'bg-[#F2FAFF]'
      } p-3 rounded-3xl shadow-sm hover:shadow-md transition-all duration-200`}
  >
    <div className="text-lg flex items-center space-x-1 mb-1">
      {icon}
      <span className="font-medium text-black">{title}</span>
    </div>
    <p className='text-center font-semibold text-xl text-black'>₹{useAnimatedNumber(amount)}</p>
  </motion.div>
);

export default ExpenseLayout;

