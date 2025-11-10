'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { CheckCircle } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface TripStatusProps {
  status: number
  dates: (Date | null)[]
}

const TripStatus: React.FC<TripStatusProps> = ({ status, dates }) => {
  const statuses = ['Started', 'Completed', 'POD Received', 'POD Submitted', 'Settled']

  return (
    <div className="mt-6 p-4 w-full max-w-4xl mx-auto">
      <div className="relative">
        <div className="flex items-center justify-between md:mx-12">
          {statuses.map((s, index) => (
            <TooltipProvider key={s}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="flex flex-col items-center z-10"
                    aria-label={`${s} ${index <= status ? 'completed' : 'pending'}`}
                  >
                    
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.2 }}
                      className={`w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center ${index <= status ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                    >
                      
                      {index <= status && <CheckCircle className="text-white" />}
                      
                    </motion.div>
                    
                    
                    <div className="mt-2 text-xs md:text-sm text-center hidden md:block">
                      {s}
                      
                      <div className="text-xs text-gray-500">
                        {dates[index] ? format(new Date(dates[index]!), 'MMM d, yyyy') : '-'}
                        
                      </div>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{s}</p>
                  <p className="text-xs text-gray-500">
                    {dates[index] ? format(new Date(dates[index]!), 'MMMM d, yyyy') : 'Date not set'}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
        <div
          className="absolute top-4 md:top-6 left-0 right-0 h-1 bg-gray-300 -z-10"
          aria-hidden="true"
        >
          <motion.div
            className="h-full bg-green-500"
            initial={{ width: 0 }}
            animate={{ width: `${(status / (statuses.length - 1)) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
      <div className="mt-4 flex justify-between md:hidden">
        {statuses.map((s, index) => (
          <div key={s} className="text-xs text-center">
            {s}
            <div className="text-xs text-gray-500">
              {dates[index] ? format(new Date(dates[index]!), 'MMM d') : '-'}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TripStatus

// {index < statuses.length - 1 && (
//   <div className={`flex-1 h-1 ${index < status ? 'bg-green-500' : 'bg-gray-300'}`} />
// )}





