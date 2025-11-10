'use client'
import { useToast } from '@/components/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { loadingIndicator } from '@/components/ui/LoadingIndicator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DeleteExpense, handleEditExpense } from '@/helpers/ExpenseOperation'
import { IExpense } from '@/utils/interface'
import { formatNumber } from '@/utils/utilArray'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { FaCalendarAlt } from 'react-icons/fa'
import { MdDelete, MdEdit } from 'react-icons/md'


const AddExpenseModal = dynamic(() => import('@/components/AddExpenseModal'), { ssr: false, loading: () => <div>{loadingIndicator}</div> })

const ShopPage = () => {

  const { shopId } = useParams()
  const [accounts, setAccounts] = useState<any[]>([])
  const [selected, setSelected] = useState<IExpense | any | null>(null)
  const { toast } = useToast()
  const [expenseModal, setExpenseModal] = useState(false)
  const [shopModal, setShopModal] = useState(false)

  const fetchAccounts = async () => {
    const res = await fetch(`/api/shopkhata/${shopId}/accounts`)
    const data = res.ok ? await res.json() : alert('Failed to fetch shopkhata')
    setAccounts(data.khata.combined)
    console.log(data)
  }

  useEffect(() => {
    if (shopId) {
      fetchAccounts()
    }
  }, [shopId])

  const delelteShopKhata = async (id: string) => {
    try {
      const res = await fetch(`/api/shopkhata/${shopId}/accounts/${id}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        toast({ description: 'Shopkhata deleted successfully' })
        setAccounts((prev) => prev.filter(acc => acc._id !== id))
        return
      } else {
        throw new Error('Failed to delete Entry')
      }
    } catch (error) {
      toast({
        description: 'Failed to delete Entry',
        variant: 'destructive'
      })
    }
  }

  const deleteExpense = async (id: string) => {
    try {
      await DeleteExpense(id)
      toast({ description: 'Expense deleted successfully' })
    } catch (error) {
      toast({
        description: 'Failed to delete Expense',
        variant: 'destructive'
      })
    }
  }

  const handleExpense = async (expense: IExpense | any, id: string, file?: File | null) => {
    console.log(file)
    try {
      const data = await handleEditExpense(expense, selected._id as string, file)

      if (data.shop_id !== shopId) {
        setAccounts(prev => prev.filter(acc => acc._id === selected._id))
      } else {
        setAccounts((prev) => (
          prev.map((exp) => exp._id === data._id ? ({ ...exp, ...data }) : exp)
        ))
      }
      toast({
        description: `Expense ${selected ? 'edited' : 'added'} successfully`
      })
    } catch (error) {
      toast({
        description: 'Please try again',
        variant: 'destructive'
      })
    } finally {
      setSelected(null)
      setExpenseModal(false);
    }
  };

  

  return (
    <div className="w-full">

      <div className="w-full h-full p-4">
        <div className="Table-container">
          <Table className="">
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Credit</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account, index: number) => (
                <TableRow key={account._id} index={index}>
                  <TableCell>
                    <div className='flex items-center space-x-2'>
                      <FaCalendarAlt className='text-bottomNavBarColor' />
                      <span>{new Date(account.date || account.paymentDate).toLocaleDateString()}</span>
                    </div>
                  </TableCell>
                  <TableCell >
                    <div className='flex items-center space-x-2 '>
                      <span>{account.reason || account.expenseType || `Trip ${account.accountType} `}</span>
                      {account.trip_id && <Button variant={"link"} className='text-red-500 pt-1 rounded-lg'><Link href={`/user/trips/${account.trip_id}`}>from a trip</Link></Button>}
                    </div>
                  </TableCell>
                  <TableCell><span className='text-red-600 font-semibold'>₹{formatNumber(account.credit) || formatNumber(account.amount)}</span></TableCell>
                  <TableCell ><span className='text-green-600 font-semibold'>₹{formatNumber(account.payment)}</span></TableCell>
                  <TableCell>
                    <div className='flex gap-2'>
                      <Button variant={'outline'} onClick={() => {
                        setSelected(account)
                        account.expenseType ? setExpenseModal(true) : setShopModal(true)
                      }}>
                        <MdEdit />
                      </Button>
                      <Button variant={'destructive'} onClick={() => {
                        account.expenseType ? deleteExpense(account._id) : delelteShopKhata(account._id)
                      }}>
                        <MdDelete />
                      </Button>
                    </div>
                  </TableCell>

                </TableRow>
              ))}
            </TableBody>
          </Table>

          <AddExpenseModal
            isOpen={expenseModal}
            onClose={() => {
              setExpenseModal(false);
              setSelected(null);
            }}
            onSave={handleExpense}
            driverId={selected?.driver as string}
            selected={selected}
            categories={['Truck Expense', 'Trip Expense', 'Office Expense']}

          />

        </div>
      </div>
    </div>
  )
}

export default ShopPage