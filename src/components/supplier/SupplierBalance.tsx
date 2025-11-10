import { formatNumber } from '@/utils/utilArray';
import React, { useState, useEffect } from 'react';

interface DriverNameProps {
    supplierId: string;
}

const SupplierBalance: React.FC<DriverNameProps> = ({ supplierId }) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<boolean>(false);
    const [balance, setBalance] = useState<number>(0)

    useEffect(() => {
        const loadSupplierBalance = async () => {
            try {
                const res = await fetch(`/api/suppliers/${supplierId}/calculateBalance`);
                const data = await res.json()
                const {balance} = data
                setBalance(balance);
            } catch (error: any) {
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        loadSupplierBalance();
    }, [supplierId]);

    if (loading) return <span>Loading...</span>;
    if (error || !balance) return <span>NA</span>;

    return <span className={balance < 0 ? 'text-red-600 p-2 font-semibold' : 'text-green-600 p-2 font-semibold'}>₹{formatNumber(balance) || ''}</span>;
};

export default SupplierBalance;
