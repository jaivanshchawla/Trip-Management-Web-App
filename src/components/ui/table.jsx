import * as React from "react"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"

const Table = React.forwardRef(
  ({ className, maxHeight = "100vh", ...props }, ref) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative border border-gray-300 rounded-md overflow-hidden">
        <div
          className="overflow-auto scrollbar-hide thin-scrollbar"
          style={{
            maxHeight,
            scrollbarWidth: 'thin',
          }}
        >
          <table
            ref={ref}
            className={cn("w-full custom-table", className)}
            {...props}
          />
        </div>
      </div>
    </motion.div>
  )
)
Table.displayName = "Table"

const TableHeader = React.forwardRef(
  ({ className, ...props }, ref) => (
    <thead
      ref={ref}
      className={cn("sticky top-0 z-10 bg-white shadow-sm", className)}
      {...props}
    />
  )
)
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef(
  ({ className, ...props }, ref) => (
    <AnimatePresence>
    <tbody
      ref={ref}
      className={cn("", className)}
      {...props}
    />
    </AnimatePresence>
  )
)
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef(
  ({ className, ...props }, ref) => (
    <tfoot
      ref={ref}
      className={cn(
        "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
)
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef(
  ({ className, index = 0, ...props }, ref) => (
    <motion.tr
      ref={ref}
      className={cn(
        "transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      {...props}
    />
  )
)
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef(
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        "h-12 px-4 text-left align-middle font-medium [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
)
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef(
  ({ className, ...props }, ref) => (
    <td
      ref={ref}
      className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
      {...props}
    />
  )
)
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef(
  ({ className, ...props }, ref) => (
    <caption
      ref={ref}
      className={cn("mt-4 text-sm text-muted-foreground", className)}
      {...props}
    />
  )
)
TableCaption.displayName = "TableCaption"

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
