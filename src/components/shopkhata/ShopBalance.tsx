import { formatNumber } from '@/utils/utilArray';
import React, { useEffect, useState } from 'react';

type Props = {
  shopId: string;
};

const ShopBalance: React.FC<Props> = ({ shopId }) => {
  const [balance, setBalance] = useState<number>(0);

  const fetchBalance = async () => {
    try {
      const res = await fetch(`/api/shopkhata/${shopId}/accounts/calculate`);
      const data = res.ok ? await res.json() : alert('Failed to calculate balance');
      setBalance(data.balance);
    } catch (error) {
      console.log(error);
      alert('Failed to calculate balance');
    }
  };

  useEffect(() => {
    if (shopId) {
      fetchBalance();
    }
  }, [shopId]);

  return (
    <div
      className={`text-xl font-bold ${
        balance < 0 ? 'text-red-500' : 'text-green-500'
      }`}
    >
      {balance < 0 ? `- ₹${formatNumber(Math.abs(balance))}` : `₹${formatNumber(balance)}`}
    </div>
  );
};

export default ShopBalance;
