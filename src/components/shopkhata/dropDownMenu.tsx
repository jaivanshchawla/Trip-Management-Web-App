import React from 'react';
import { MdDeleteForever, MdEdit } from "react-icons/md";
import { Button } from '../ui/button';
import { motion } from 'framer-motion';

interface DropdownMenuProps {
  onEditClick: () => void;
  onDeleteClick: () => void;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ onEditClick, onDeleteClick }) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  return (
    <div className="relative">
      <Button
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M10 12a2 2 0 100-4 2 2 0 000 4zM10 2a2 2 0 100 4 2 2 0 000-4zm0 16a2 2 0 100-4 2 2 0 000 4z"
            clipRule="evenodd"
          />
        </svg>
      </Button>
      {dropdownOpen && (
        <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }} className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md flex flex-col gap-2 p-2 z-10">
          <Button
            variant={'ghost'}
            onClick={onEditClick}
          >
            <MdEdit style={{ width: '20px', height: '20px' }} /> Edit
          </Button>
          <Button
            variant={'destructive'}
            onClick={onDeleteClick}
          >
            <MdDeleteForever style={{ width: '20px', height: '20px' }} /> Delete
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default DropdownMenu;
