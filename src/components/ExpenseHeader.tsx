import React from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TbFilterSearch, TbPlus } from "react-icons/tb"

interface ExpenseHeaderProps {
  visibleColumns: Record<string, boolean>
  handleSelectAll: (checked: boolean) => void
  handleToggleColumn: (column: string | any) => void
  handleSearch: (event: React.ChangeEvent<HTMLInputElement>) => void
  sortedExpense: any[]
  setSelected: (value: any) => void
  setModalOpen: (value: boolean) => void
  setFilterModalOpen: (value: boolean) => void
}

export function ExpenseHeader({
  visibleColumns,
  handleSelectAll,
  handleToggleColumn,
  handleSearch,
  sortedExpense,
  setSelected,
  setModalOpen,
  setFilterModalOpen
}: ExpenseHeaderProps) {
  const totalAmount = sortedExpense.reduce((acc, exp) => acc + exp.amount, 0)
  return (
    <div className="flex items-center justify-between gap-4 bg-transparent p-4">
    <div className="flex items-center gap-4 flex-grow">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">Columns</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Visible Columns</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={Object.values(visibleColumns).every(Boolean)}
            onCheckedChange={handleSelectAll}
          >
            Select All
          </DropdownMenuCheckboxItem>
          {Object.entries(visibleColumns).map(([column, isVisible]) => (
            <DropdownMenuCheckboxItem
              key={column}
              checked={isVisible}
              onCheckedChange={() => handleToggleColumn(column as any)}
            >
              {column.charAt(0).toUpperCase() + column.slice(1)}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <input
        type="text"
        onChange={handleSearch}
        placeholder={`Search from ${sortedExpense.length} expenses...`}
        className="max-w-xs"
      />
      <div className="flex items-center gap-4 text-sm">
        <span className="font-medium text-lg">
          Total: <span className="text-red-600">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(totalAmount)}</span>
        </span>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        onClick={() => {
          setSelected(null)
          setModalOpen(true)
        }}
      >
        <TbPlus className="mr-2 h-4 w-4" /> Add
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setFilterModalOpen(true)}
      >
        <TbFilterSearch className="mr-2 h-4 w-4" /> Filter
      </Button>
    </div>
  </div>
  )
}