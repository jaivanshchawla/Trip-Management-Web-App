'use client';
import React, { useState } from 'react';
import { MdDelete, MdEdit } from 'react-icons/md';
import { Button } from '@/components/ui/button';
import { formatNumber } from '@/utils/utilArray';

interface ProfitItemProps {
  data: any;
  index: number;
  setOpen?: any;
  setSelectedExpense?: any;
  disabled?: boolean;
  sign: string;
  handleDelete? : any
}

const ProfitItem: React.FC<ProfitItemProps> = ({ data, index, setOpen, setSelectedExpense, disabled, sign, handleDelete }) => {
  
  const [isHovered, setIsHovered] = useState<boolean>(false);

  return (
    <div
      className={`flex items-center justify-between py-2 px-4 bg-lightOrangeButtonColor rounded-lg my-2 cursor-pointer w-full relative transition-transform duration-200 ease-in-out transform ${!disabled ? 'hover:scale-105' : ''} ${isHovered ? 'bg-lightOrange bg-opacity-70' : ''}`}
      onMouseEnter={() => !disabled && setIsHovered(true)}
      onMouseLeave={() => !disabled && setIsHovered(false)}
    >
      <div className='flex flex-row items-center justify-between w-full'>
        <div className="flex flex-row justify-between w-full">
          <p className="text-sm font-medium text-gray-900">{data.expenseType}</p>
          <p className="text-sm font-semibold text-gray-600">{sign}₹{formatNumber(data.amount)}</p>
        </div>
        {isHovered && (
          <div className="flex space-x-2 transition-opacity duration-200 ease-in-out opacity-100">
            <Button
              variant={'ghost'}
              onClick={() => {
                setSelectedExpense(data);
                setOpen(true);
              }}
              className='p-2 transition-opacity duration-200 ease-in-out opacity-100 rounded-full'
            >
              <MdEdit size={20} />
            </Button>
            <Button
              onClick={()=>handleDelete(data._id)}
              className="p-2 bg-destructive text-white rounded-full transition-colors duration-200 ease-in-out hover:bg-red-600"
            >
              <MdDelete size={20} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfitItem;
