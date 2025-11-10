'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import DropdownMenu from './dropDownMenu'
import ShopActions from './shopActions';
import ShopModal from './ShopModal';
import EditShopModal from './EditShopModal';
import Link from 'next/link';
import { FaStore, FaMapMarkerAlt } from 'react-icons/fa';
import { IoDocuments } from 'react-icons/io5';
import ShopBalance from './ShopBalance';

interface ShopLayoutProps {
  name: string;
  shopId: string;
  onShopUpdate: (shop: any) => void;
  contactNumber: string;
  children: React.ReactNode;
}

const ShopLayout: React.FC<ShopLayoutProps> = ({ name, shopId, onShopUpdate, contactNumber, children }) => {
  const router = useRouter();
  const pathname = usePathname();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'credit' | 'payment' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [edit, setEdit] = useState<boolean>(false);
  const [showContact, setShowContact] = useState<boolean>(false);


  const openModal = (type: 'credit' | 'payment') => {
    setModalType(type);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalType(null);
    setError(null);
  };

  const handleConfirm = async (amount: number, reason: string, date: string) => {
    try {
      const response = await fetch(`/api/shopkhata/${shopId}/accounts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credit: modalType === 'credit' ? amount : 0,
          payment: modalType === 'payment' ? amount : 0,
          reason,
          date,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update shop');
      }

      const data = await response.json();
      onShopUpdate(data.shop);

      closeModal();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleEditShop = async (shopName: string, mobileNumber: string) => {
    try {
      const response = await fetch(`/api/shopkhata/${shopId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: shopName,
          contactNumber: mobileNumber,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update shop');
      }

      const data = await response.json();
      onShopUpdate(data.shop);
      setEdit(false);
      router.push('/user/shops');
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleDeleteShop = async () => {
    try {
      const response = await fetch(`/api/shops/${shopId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete shop');
      }

      alert('Shop Removed Successfully');
      router.push('/user/shops');
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div className='flex flex-col gap-2 justify-start'>
      <div className="flex items-center justify-between p-4 bg-gray-200 rounded-sm">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold mr-5 cursor-pointer" onClick={() => setShowContact(!showContact)}>
            {name}
          </h1>
          {showContact && <span className="ml-2 text-lg text-gray-700">{contactNumber}</span>}
          
        </div>
        <div className="flex items-center">
          <ShopActions onCreditClick={() => openModal('credit')} onPaymentClick={() => openModal('payment')} />
          <DropdownMenu onEditClick={() => setEdit(true)} onDeleteClick={handleDeleteShop} />
        </div>

        <ShopModal open={modalOpen} onClose={closeModal} type={modalType} onConfirm={handleConfirm} />
        {error && <div className="text-red-500 mt-2">{error}</div>}
        {edit && (
          <EditShopModal name={name} shopId={shopId} handleEdit={handleEditShop} onCancel={() => setEdit(false)} contactNumber={contactNumber} />
        )}
      </div>
      <div>
        <div className="flex items-center justify-between p-3 bg-gray-200 rounded-sm w-fit">
          <span className="text-2xl">Shop Balance: <ShopBalance shopId={shopId} /></span> {/* Display balance */}
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
};

export default ShopLayout;
