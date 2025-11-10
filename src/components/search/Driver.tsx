import { IDriver } from '@/utils/interface'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import React from 'react'
import DriverBalance from '../driver/DriverBalance'
import { FaUser, FaPhone } from 'react-icons/fa'

interface props {
  drivers: IDriver[]
}

const Driver: React.FC<props> = ({ drivers }) => {
  const router = useRouter()

  return (
    <div className='flex flex-col space-y-4 w-full'>
      <h1 className='text-bottomNavBarColor text-2xl font-semibold'>Drivers</h1>
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
        {drivers.map((driver, index) => (
          <motion.div
            key={index}
            onClick={() => router.push(`/user/drivers/${driver.driver_id}`)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div
            className=" rounded-lg p-4 hover:shadow-lg cursor-pointer transition-transform transform duration-300 ease-out hover:scale-105 bg-lightOrangeButtonColor"
            onClick={() => router.push(`/user/drivers/${driver.driver_id}`)}>

            
            <div className='flex items-center gap-3'>
              <FaUser className="text-bottomNavBarColor" />
              <span className='font-semibold text-lg'>{driver.name}</span>
            </div>
            <div className='flex items-center gap-3 mt-2'>
              <FaPhone className="text-green-500" />
              <span>{driver.contactNumber || 'N/A'}</span>
            </div>
            <div className='mt-4'>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                  driver.status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}
              >
                {driver.status}
              </span>
            </div>
            <div className='mt-4 text-xl font-semibold'>
              <DriverBalance driverId={driver.driver_id} />
            </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default Driver
