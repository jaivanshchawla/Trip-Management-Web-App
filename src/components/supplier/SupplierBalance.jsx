import { formatNumber } from '@/utils/utilArray';
import React, { useState, useEffect } from 'react';

const SupplierBalance = ({ supplierId }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [balance, setBalance] = useState(0)

    useEffect(() => {
        const loadSupplierBalance = async () => {
            try {
                const res = await fetch(`/api/suppliers/${supplierId}/calculateBalance`);
                const data = await res.json()
                const {balance} = data
                setBalance(balance);
            } catch (error) {
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
