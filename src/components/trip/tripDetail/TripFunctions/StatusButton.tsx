import React, { useState, useEffect } from 'react';
import { FaCheck, FaTruck, FaFileInvoice, FaMoneyBill, FaCheckCircle } from 'react-icons/fa'; // Example icons
import StatusModal from './StatusModal';
import { Button } from '@/components/ui/button';

interface StatusButtonProps {
  status: number;
  amount: number;
  statusUpdate: (data: any) => void;
  dates: Date[];
}

const StatusButton: React.FC<StatusButtonProps> = ({ status, statusUpdate, dates, amount }) => {
  const statusConfig: any = {
    0: { label: 'Complete Trip', color: '#FF8C42', icon: <FaTruck /> }, // Darker orange
    1: { label: 'POD Received', color: '#FFA726', icon: <FaFileInvoice /> }, // Lighter orange
    2: { label: 'POD Submitted', color: '#FFB74D', icon: <FaCheck /> }, // Even lighter orange
    3: { label: 'Settle Amount', color: '#FFCA28', icon: <FaMoneyBill /> }, // Lightest orange
    4: { label: 'Settled', color: '#FFD54F', icon: <FaCheckCircle /> } // Light yellow-orange
  };

  const { label, color, icon } = statusConfig[status];
  const fillPercentage = (status / 4) * 100;

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [currentFill, setCurrentFill] = useState<number>(0);

  useEffect(() => {
    setCurrentFill(fillPercentage);
  }, [status]);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);
  const saveChanges = (data: any) => {
    statusUpdate(data);
    closeModal();
  };

  return (
    <div className="w-full">
      
      <Button
        onClick={openModal}
        className={`
    ${status === 4 ? 'pointer-events-none opacity-50' : ''}
    hover:scale-105 hover:shadow-md transition-transform duration-300 ease-in-out
  `}
        style={{
          backgroundColor: color,
          height: '45px',
          lineHeight: '45px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background-color 0.3s ease, transform 0.3s ease',
        }}
      >
        <div
          className="absolute left-0 top-0 h-full bg-white transition-all duration-500 ease-in-out"
          style={{ width: `${currentFill}%`, opacity: 0.2 }}
        ></div>
        <div className="relative z-10 flex items-center justify-center space-x-2">
          {icon}
          <span>{label} - {fillPercentage}%</span>
        </div>
      </Button>


      <StatusModal
        status={status}
        isOpen={modalOpen}
        onClose={closeModal}
        onSave={saveChanges}
        dates={dates}
        amount={amount}
      />
    </div>
  );
};

export default StatusButton;
