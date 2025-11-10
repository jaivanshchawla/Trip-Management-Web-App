import { handleDelete } from '@/helpers/ExpenseOperation';
import { IconKey, icons } from '@/utils/icons';
import { motion } from 'framer-motion';
import React from 'react';
import { FaCalendarAlt } from 'react-icons/fa';
import { FaNoteSticky } from 'react-icons/fa6';
import { MdPayment, MdEdit, MdDelete } from 'react-icons/md';

interface props {
  expenses: any[]
}

const OfficeExpense: React.FC<props> = ({ expenses }) => {
  return (
    <div className='flex flex-col space-y-4 w-full'>
      <h1 className='text-bottomNavBarColor text-2xl font-semibold'>Office Expenses</h1>
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
        {expenses.length > 0 && expenses.map((expense: any, index: number) => (
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
            <div className='flex items-center space-x-2 mt-2'>
                <FaNoteSticky className='text-bottomNavBarColor'/>
                <span>{expense.notes}</span>
            </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default OfficeExpense
