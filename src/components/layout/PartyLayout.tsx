// components/parties/PartyLayout.tsx
'use client'
import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import PartyName from '../party/PartyName';
import { useParty } from '@/context/partyContext';
import Loading from '@/app/user/parties/loading';
import { Button } from '../ui/button';
import dynamic from 'next/dynamic';
import { PaymentBook } from '@/utils/interface';
import { Frown } from 'lucide-react';

interface PartyLayoutProps {
  children: React.ReactNode;
  partyId: string;
}

const PartyLayout = ({ children, partyId }: PartyLayoutProps) => {
  const pathname = usePathname();
  const {party, setParty, loading} = useParty()
  const [isOpen , setIsOpen] = useState(false)

  const PaymentModal = dynamic(()=>import('@/components/party/PaymentModal'))



  const tabs = [
    { name: 'Trips', path: `/user/parties/${partyId}/trips` },
    { name: 'Passbook', path: `/user/parties/${partyId}/passbook` },
    { name: 'Monthly Balances', path: `/user/parties/${partyId}/monthly-balances` },
    { name: 'Party Details', path: `/user/parties/${partyId}/details` },
  ];

  const handlePayment = async(payment : PaymentBook | any)=>{
    try {
      const res = await fetch(`/api/parties/${party.party_id}/payments`,{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payment),
      })
      if(!res.ok){
        throw new Error('Failed to add payment')
      }
      const data = await res.json()
      const newpayment = {  ...data.payment, type : 'payment', description : data.payment.accountType,}
      setParty((prev : any)=>({
        ...prev,
        items : [newpayment, ...party.items]
      }))
      alert('payment added successfully')
    } catch (error) {
      alert('failed to add payment')
    }
  }


  if(loading){
    return <Loading />
  }

  if(!party){
    return <div className='flex items-center justify-center space-x-2'><Frown className='text-bottomNavBarColor' /> Party Not Found</div>
  }

  return (
    <div className="min-h-screen bg-gray-100 rounded-md">
      <div className="w-full h-full p-4">
        <header className="mb-6 flex justify-between">
          <h1 className="text-3xl font-bold text-black">{party.name}</h1>
          <Button onClick={()=>setIsOpen(true)}>Add Payment</Button>
        </header>
        <nav className="flex mb-6 border-b-2 border-gray-200">
          {tabs.map((tab) => (
            <Link
              key={tab.name}
              href={tab.path}
              className={`px-4 py-2 transition duration-300 ease-in-out font-semibold rounded-t-md hover:bg-lightOrangeButtonColor ${pathname === tab.path
                ? 'border-b-2 border-lightOrange text-buttonTextColor bg-lightOrange'
                : 'border-transparent text-buttonTextColor hover:bottomNavBarColor hover:border-bottomNavBarColor'
                }`}
            >
              {tab.name}
            </Link>
          ))}
        </nav>
        <main className="bg-white shadow-md rounded-lg p-6">
          {children}
        </main>
      </div>
      <PaymentModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)} onSave={handlePayment} modalTitle={'Payment'} accountType={'Payments'}      
      />
    </div>
  );
};

export default PartyLayout;
