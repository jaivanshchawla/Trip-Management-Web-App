import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { IconKey } from '@/utils/icons';
import { formatNumber } from '@/utils/utilArray';
import { icons } from '@/utils/icons';
import { Button } from '@/components/ui/button';
import { FaCalendarAlt, FaTruck } from 'react-icons/fa';
import { MdEdit, MdDelete } from 'react-icons/md';
import { IExpense } from '@/utils/interface';
import { motion, AnimatePresence } from 'framer-motion';

type props = {
  expenses?: IExpense[] | any[],
  visibleColumns: { [key: string]: boolean },
  requestSort: (key: string) => void,
  getSortIcon: (key: string) => React.ReactNode,
  sortedExpense: IExpense[] | any[],
  setSelected: any
  setTruckExpenseBook: any
  setModalOpen: any
  handleDelete: any
}

const ExpenseTable: React.FC<props> = ({ expenses, visibleColumns, requestSort, getSortIcon, sortedExpense, setSelected, setModalOpen, setTruckExpenseBook, handleDelete }) => {
  return (

    <Table className="">
      <TableHeader>
        <TableRow className="">
          {visibleColumns.date && <TableHead onClick={() => requestSort('date')} className="">
            <div className='flex justify-between'>
              Date {getSortIcon('date')}
            </div>
          </TableHead>}
          {visibleColumns.amount && <TableHead onClick={() => requestSort('amount')} className="">
            <div className='flex justify-between'>
              Amount {getSortIcon('amount')}
            </div>
          </TableHead>}
          {visibleColumns.expenseType && <TableHead onClick={() => requestSort('expenseType')} className="">
            <div className='flex justify-between'>
              Expense Type {getSortIcon('expenseType')}
            </div>
          </TableHead>}
          {visibleColumns.ledger && <TableHead className="">
            <div className='flex justify-between'>
              Payment Mode
            </div>
          </TableHead>}
          {visibleColumns.notes && <TableHead onClick={() => requestSort('notes')} className="">
            <div className='flex justify-between'>
              Notes {getSortIcon('notes')}
            </div>
          </TableHead>}
          {visibleColumns.truck && <TableHead className="">
            <div className='flex justify-between'>
              Lorry
            </div>
          </TableHead>}
          {visibleColumns.trip && <TableHead className="">
            <div className='flex justify-between'>
              Trip
            </div>
          </TableHead>}
          {visibleColumns.action && <TableHead className="">Action</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>

        {sortedExpense.length > 0 ? (
          sortedExpense.map((expense, index) => (
            <motion.tr
              key={expense._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="border-t hover:bg-indigo-100 cursor-pointer transition-colors"
            >
              {visibleColumns.date && (
                <TableCell>
                  <div className='flex items-center space-x-2'>
                    <FaCalendarAlt className='text-bottomNavBarColor' />
                    <span>{new Date(expense.date).toISOString().split('T')[0]}</span>
                  </div>
                </TableCell>
              )}
              {visibleColumns.amount && <TableCell>₹{formatNumber(expense.amount)}</TableCell>}
              {visibleColumns.expenseType && (
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {icons[expense.expenseType as IconKey]}
                    <span>{expense.expenseType}</span>
                  </div>
                </TableCell>
              )}
              {visibleColumns.ledger && (
                <TableCell>
                  <div className="flex items-center justify-between">
                    <p>{expense.paymentMode}</p><p className='whitespace-nowrap'> {expense.driverName || expense.shopName}</p>
                  </div>
                </TableCell>
              )}
              {visibleColumns.notes && <TableCell>{expense.notes || 'N/A'}</TableCell>}
              {visibleColumns.truck && (
                <TableCell>
                  <div className='flex items-center space-x-2'>
                    <FaTruck className='text-bottomNavBarColor' />
                    <span>{expense.truck || ''}</span>
                  </div>
                </TableCell>
              )}
              {visibleColumns.trip && (
                <TableCell>
                  <span>{expense.tripRoute ? <span>{expense.tripRoute.origin.split(',')[0]} &rarr; {expense.tripRoute.destination.split(',')[0]}</span> : "NA"}</span>
                </TableCell>
              )}
              {visibleColumns.action && (
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Button variant="outline" onClick={() => { setSelected(expense); setModalOpen(true); }} size="sm">
                        <MdEdit />
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Button
                        variant="destructive"
                        onClick={async () => {
                          await handleDelete(expense._id as string);
                          setTruckExpenseBook((prev: IExpense[] | any[]) => prev.filter((item) => item._id !== expense._id));
                        }}
                        size="sm"
                      >
                        <MdDelete />
                      </Button>
                    </motion.div>
                  </div>
                </TableCell>
              )}
            </motion.tr>
          ))
        ) : (
          <motion.tr
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <TableCell colSpan={8} className="text-center p-4 text-gray-500">No expenses found</TableCell>
          </motion.tr>
        )}
      </TableBody>
    </Table>
  )
}

export default ExpenseTable

