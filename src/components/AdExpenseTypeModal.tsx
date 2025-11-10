'use client'
import { motion } from 'framer-motion'
import React, { useState } from 'react'
import { Button } from './ui/button'
import { useToast } from './hooks/use-toast'

type Props = {
    open: boolean
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
    setExpenses: React.Dispatch<React.SetStateAction<string[]>>
}

const AdExpenseTypeModal: React.FC<Props> = ({ open, setOpen, setExpenses }) => {
    const [expense, setExpense] = useState('')
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await fetch('/api/expenses/expenseType', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ expenseType: expense })
            })
            if (!res.ok) {
                toast({
                    description: 'Failed to add expense type',
                    variant: 'destructive'
                })
                return
            }
            const data = await res.json()
            setExpenses(prev => {
                if (prev.length === 0) return [expense]
                else return [
                    expense,
                    ...prev
                ]
            })
            toast({
                description: 'Expense type added'
            })
            setOpen(false)
        } catch (error) {
            toast({
                description: 'Failed to add expense type',
                variant: 'destructive'
            })
        }
        setLoading(false)
    }
    if (!open) {
        return null
    }
    return (
        <div className='modal-class z-50'>
            <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                    duration: 0.5,
                    ease: [0, 0.71, 0.2, 1.01]
                }}
                className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[700px] overflow-y-auto thin-scrollbar"
            >
                <form onSubmit={handleSubmit}>
                    <div>
                        <h1 className='text-xl text-black font-semibold mb-2'>Add Own Expense Type</h1>
                        <label>Expense Type *</label>
                        <input type='text' placeholder="(Eg. Fuel Expense)" value={expense} onChange={(e) => setExpense(e.target.value)} />
                        <div className='flex items-center justify-between mt-2'>

                            <Button disabled={loading} variant={'outline'} type='button' onClick={() => setOpen(false)}>Cancel</Button>
                            <Button disabled={loading} type='submit'>Add Expense Type</Button>
                        </div>

                    </div>
                </form>
            </motion.div>
        </div>
    )
}

export default AdExpenseTypeModal