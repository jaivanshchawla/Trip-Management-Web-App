import { BsFillPauseCircleFill } from 'react-icons/bs';
import {
    FaTools, // for maintenance and repair
    FaTruckLoading, // for loading
    FaTruckMoving, // for unloading
    FaBalanceScale, // for weight
    FaExclamationCircle, // for other
    FaMoneyCheckAlt, // for payment and expenses
    FaGasPump, // for fuel
    FaWrench, // for repairs
    FaUserTie, // for union charges
  } from 'react-icons/fa';
import { FaLocationDot } from 'react-icons/fa6';
import { GiExpense } from 'react-icons/gi';
import { IoMdDocument } from 'react-icons/io';
import { IoPerson } from 'react-icons/io5';
import { PiSteeringWheel } from 'react-icons/pi';
  
  export const icons = {
    'Detention/Halting Charges': <FaBalanceScale className="text-bottomNavBarColor"/>,
    'Repair Expense': <FaWrench className="text-bottomNavBarColor"/>,
    'Loading Charges': <FaTruckLoading className="text-bottomNavBarColor"/>,
    'Unloading Charges': <FaTruckMoving className="text-bottomNavBarColor"/>,
    'Union Charges': <FaUserTie className="text-bottomNavBarColor"/>,
    'Weight Charges': <FaBalanceScale className="text-bottomNavBarColor"/>,
    'Other Charges': <FaExclamationCircle className="text-bottomNavBarColor"/>,
    'Material Loss': <FaExclamationCircle className="text-bottomNavBarColor"/>,
    'Brokerage': <FaMoneyCheckAlt className="text-bottomNavBarColor"/>,
    'Late Fees': <FaExclamationCircle className="text-bottomNavBarColor"/>,
    'TDS': <FaMoneyCheckAlt className="text-bottomNavBarColor"/>,
    'Mamul': <FaMoneyCheckAlt className="text-bottomNavBarColor"/>,
    'Driver bhatta': <FaMoneyCheckAlt className="text-bottomNavBarColor"/>,
    'Driver payment': <FaMoneyCheckAlt className="text-bottomNavBarColor"/>,
    'Fuel Expense': <FaGasPump className="text-bottomNavBarColor"/>,
    'Police Expense': <FaExclamationCircle className="text-bottomNavBarColor"/>,
    'RTO Expense': <FaExclamationCircle className="text-bottomNavBarColor"/>,
    'Toll Expense': <FaMoneyCheckAlt className="text-bottomNavBarColor"/>,
    'Union Expense': <FaUserTie className="text-bottomNavBarColor"/>,
    'Tyre Puncture': <FaWrench className="text-bottomNavBarColor"/>,
    'Tyre Retread': <FaWrench className="text-bottomNavBarColor"/>,
    'Tyre Purchase': <FaWrench className="text-bottomNavBarColor"/>,
    'Roof Top Repair': <FaWrench className="text-bottomNavBarColor"/>,
    'Showroom Service': <FaTools className="text-bottomNavBarColor"/>,
    'Regular Service': <FaTools className="text-bottomNavBarColor"/>,
    'Minor Repair': <FaTools className="text-bottomNavBarColor"/>,
    'Gear Maintenance': <FaWrench className="text-bottomNavBarColor"/>,
    'Brake Oil Change': <FaTools className="text-bottomNavBarColor"/>,
    'Grease Oil Change': <FaTools className="text-bottomNavBarColor"/>,
    'Spare Parts Purchase': <FaTools className="text-bottomNavBarColor"/>,
    'Air Filter Change': <FaTools className="text-bottomNavBarColor"/>,
    'Detention' : <BsFillPauseCircleFill className="text-bottomNavBarColor"/>, // for detention

  };
  
export const recentIcons : Record<string,React.ReactNode> = {
  'Created New Trip' :  <FaLocationDot size={40} className='text-white bg-blue-500 rounded-lg p-2 border font-semibold' />,
  'Added New Customer' : <IoPerson size={40} className='text-white bg-blue-500 rounded-lg p-2 border font-semibold' />,
  'Added New Driver' : <PiSteeringWheel size={40} className='text-white bg-blue-500 rounded-lg p-2 border font-semibold' />,
  'Updated Driver Details' : <PiSteeringWheel size={40} className='text-white bg-blue-500 rounded-lg p-2 border font-semibold' />,
  'Added Driver Document' : <IoMdDocument size={40} className='text-white bg-blue-500 rounded-lg p-2 border font-semibold' />,
  'Added Trip Document' : <IoMdDocument size={40} className='text-white bg-blue-500 rounded-lg p-2 border font-semibold' />,
  'Added Lorry Document' : <IoMdDocument size={40} className='text-white bg-blue-500 rounded-lg p-2 border font-semibold' />,
  'Added New Expense' : <GiExpense size={40} className='text-white bg-blue-500 rounded-lg p-2 border font-semibold' />,
  'Edited Expense' : <GiExpense size={40} className='text-white bg-blue-500 rounded-lg p-2 border font-semibold' />,
  'Deleted Expense' : <GiExpense size={40} className='text-white bg-blue-500 rounded-lg p-2 border font-semibold' />,
  'Edited Trip Details' :  <FaLocationDot size={40} className='text-white bg-blue-500 rounded-lg p-2 border font-semibold' />,
}

  // Define the type for the keys of the icons object
export type IconKey = 'Detention/Halting Charges' | 'Repair Expense' | 'Loading Charges' | 'Unloading Charges' | 'Union Charges' | 'Weight Charges' | 'Other Charges' | 'Material Loss' | 'Brokerage' | 'Late Fees' | 'TDS' | 'Mamul' | 'Driver bhatta' | 'Driver payment' | 'Fuel Expense' | 'Police Expense' | 'RTO Expense' | 'Toll Expense' | 'Union Expense' | 'Tyre Puncture' | 'Tyre Retread' | 'Tyre Purchase' | 'Roof Top Repair' | 'Showroom Service' | 'Regular Service' | 'Minor Repair' | 'Gear Maintenance' | 'Brake Oil Change' | 'Grease Oil Change' | 'Spare Parts Purchase' | 'Air Filter Change';
