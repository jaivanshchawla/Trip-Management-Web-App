"use client"

import { useExpenseData } from "@/components/hooks/useExpenseData"
import type React from "react"
import { useEffect, useState } from "react"
import Loading from "../loading"
import invImg from "@/assets/sampleInvoice.png"
import Image from "next/image"
import { formatNumber } from "@/utils/utilArray"
import { PercentageDonut } from "@/components/percentageDonut"
import { useRouter } from "next/navigation"
import { FaLongArrowAltDown } from "react-icons/fa"
import { useToast } from "@/components/hooks/use-toast"
import { Trash2, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { invData } from "@/utils/interface"

const InvoicePage = () => {
  const { invoices, refetchInvoice, isLoading } = useExpenseData()
  const { toast } = useToast()
  const router = useRouter()
  const [sortedInvoices, setSortedInvoices] = useState(invoices)
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "" })
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    refetchInvoice()
  }, [refetchInvoice])

  useEffect(() => {
    setSortedInvoices(invoices)
  }, [invoices])

  if (isLoading) {
    return <Loading />
  }

  const handleDelete = async (id: string) => {
    toast({
      description: "Deleting invoice...",
      variant: "warning",
    })
    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })
      if (!res.ok) {
        throw new Error("Failed to delete invoice")
      }
      refetchInvoice()
      toast({
        description: "Invoice Deleted Successfully",
      })
    } catch (error) {
      toast({
        description: "Failed to delete invoice",
        variant: "destructive",
      })
    }
  }

  const handleSort = (key: string) => {
    let direction = "ascending"
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }
    setSortConfig({ key, direction })

    setSortedInvoices(
      [...sortedInvoices as invData[]].sort((a, b) => {
        if (a[key as keyof invData] < b[key as keyof invData]) return direction === "ascending" ? -1 : 1
        if (a[key as keyof invData] > b[key as keyof invData]) return direction === "ascending" ? 1 : -1
        return 0
      }),
    )
  }

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
    const filteredInvoices = invoices?.filter(
      (invoice) =>
        invoice.partyName.toLowerCase().includes(event.target.value.toLowerCase()) ||
        invoice.invoiceNo.toString().includes(event.target.value),
    )
    setSortedInvoices(filteredInvoices)
  }

  return (
    <div className="px-8 container mx-auto">
      <h1 className="text-black text-3xl font-semibold my-4">Invoices</h1>
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search by party name or invoice number"
          value={searchTerm}
          onChange={handleSearch}
          className="w-full max-w-sm"
        />
      </div>
      <div className="py-2 px-1 rounded-lg shadow-sm border-2 border-gray-300">
        <table className="min-w-full table-auto border-collapse border border-gray-200 rounded-xl">
          <thead>
            <tr className="bg-gray-200">
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Invoice</th>
              <th
                className="py-3 px-4 text-left text-sm font-semibold text-gray-600 cursor-pointer"
                onClick={() => handleSort("partyName")}
              >
                Party {sortConfig.key === "partyName" && <ArrowUpDown className="inline h-4 w-4" />}
              </th>
              <th
                className="py-3 px-4 text-left text-sm font-semibold text-gray-600 cursor-pointer"
                onClick={() => handleSort("date")}
              >
                Issued Date {sortConfig.key === "date" && <ArrowUpDown className="inline h-4 w-4" />}
              </th>
              <th
                className="py-3 px-4 text-left text-sm font-semibold text-gray-600 cursor-pointer"
                onClick={() => handleSort("dueDate")}
              >
                Due Date {sortConfig.key === "dueDate" && <ArrowUpDown className="inline h-4 w-4" />}
              </th>
              <th
                className="py-3 px-4 text-left text-sm font-semibold text-gray-600 cursor-pointer"
                onClick={() => handleSort("total")}
              >
                Total {sortConfig.key === "total" && <ArrowUpDown className="inline h-4 w-4" />}
              </th>
              <th
                className="py-3 px-4 text-left text-sm font-semibold text-gray-600 cursor-pointer"
                onClick={() => handleSort("advance")}
              >
                Advance {sortConfig.key === "advance" && <ArrowUpDown className="inline h-4 w-4" />}
              </th>
              <th
                className="py-3 px-4 text-left text-sm font-semibold text-gray-600 cursor-pointer"
                onClick={() => handleSort("balance")}
              >
                Balance {sortConfig.key === "balance" && <ArrowUpDown className="inline h-4 w-4" />}
              </th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {sortedInvoices && sortedInvoices?.length > 0 ? (
              sortedInvoices?.map((invoice, index) => (
                <motion.tr
                  key={invoice._id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => router.push(`/user/trips/invoice?party=${encodeURIComponent(invoice.party_id)}&route=${encodeURIComponent(JSON.stringify(invoice.route))}&trips=${encodeURIComponent(JSON.stringify(invoice.trips))}&invoiceId=${encodeURIComponent(invoice._id)}&issuedDate=${encodeURIComponent(invoice.date)}&dueDate=${encodeURIComponent(invoice.dueDate)}&gst=${encodeURIComponent(invoice.gst || 0)}`)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <td className="py-2 px-3 text-sm text-gray-700 border-b border-gray-200">
                    <div className="">
                      <Image
                        src={invImg || "/placeholder.svg"}
                        alt="Invoice"
                        width={100}
                        height={100}
                        className="border border-gray-400 rounded-md"
                      />
                      <p className="text-center mt-2">#invoice {invoice.invoiceNo}</p>
                    </div>
                  </td>
                  <td className="py-2 px-3 text-sm text-gray-500 border-b border-gray-200">
                    <div>
                      <p className="mb-2">{invoice.partyName || ""}</p>
                      {invoice.route ? (
                        <p>
                          {invoice.route.origin} <FaLongArrowAltDown size={15} /> {invoice.route.destination}
                        </p>
                      ) : (
                        ""
                      )}
                    </div>
                  </td>
                  <td className="py-2 px-3 text-sm text-gray-500 border-b border-gray-200">
                    {new Date(invoice.date).toLocaleDateString("en-IN")}
                  </td>
                  <td className="py-2 px-3 text-sm text-gray-500 border-b border-gray-200">
                    {new Date(invoice.dueDate).toLocaleDateString("en-IN")}
                  </td>
                  <td className="py-2 px-3 text-sm text-gray-500 border-b border-gray-200">
                    ₹{formatNumber(invoice.total)}
                  </td>
                  <td className="py-2 px-3 text-sm text-gray-500 border-b border-gray-200">
                    ₹{formatNumber(invoice.advance)}
                  </td>
                  <td className="py-2 px-3 text-sm text-gray-500 border-b border-gray-200">
                    <div className="flex items-center gap-1">
                      ₹{formatNumber(invoice.balance)}
                      <PercentageDonut percentage={(invoice.advance / invoice.total) * 100} size={100} />
                    </div>
                  </td>
                  <td className="py-2 px-3 text-sm text-gray-500 border-b border-gray-200">
                    <Button
                      variant={"destructive"}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(invoice._id)
                      }}
                    >
                      <Trash2 size={15} />
                    </Button>
                  </td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="text-center py-4">
                  No invoice found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default InvoicePage

