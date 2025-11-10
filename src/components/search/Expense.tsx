import { IconKey, icons } from '@/utils/icons';
import { IExpense } from '@/utils/interface';
import { motion } from 'framer-motion';
import React from 'react';
import { FaCalendarAlt, FaTruck } from 'react-icons/fa';
import { MdPayment } from 'react-icons/md';

interface props {
  expenses: IExpense[]
}

const Expense: React.FC<props> = ({ expenses }) => {
  return (
    <div className='flex flex-col space-y-4 w-full'>
      <h1 className='text-bottomNavBarColor text-2xl font-semibold'>Expenses</h1>
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
        {expenses.length > 0 && expenses.map((expense, index) => (
          <motion.div
            key={index}
            
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="border border-gray-200 rounded-lg shadow-md p-4 bg-lightOrangeButtonColor text-buttonTextColor cursor-pointer transform transition-transform duration-300 ease-out hover:shadow-lg hover:scale-105">

            
            <div className='flex items-center space-x-2'>
              <FaCalendarAlt className='text-bottomNavBarColor' />
              <span>{new Date(expense.date).toLocaleDateString()}</span>
            </div>
            <div className='mt-2 text-xl font-semibold'>
              {expense.amount}
            </div>
            <div className="flex items-center space-x-2 mt-4">
              {icons[expense.expenseType as IconKey]}
              <span>{expense.expenseType}</span>
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <MdPayment className="text-green-500" />
              <span>{expense.paymentMode}</span>
            </div>
            <div className='mt-2'>
              {expense.notes || 'N/A'}
            </div>
            <div className='flex items-center space-x-2 mt-4'>
              <FaTruck className='text-bottomNavBarColor' />
              <span>{expense.truck || 'N/A'}</span>
            </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default Expense
