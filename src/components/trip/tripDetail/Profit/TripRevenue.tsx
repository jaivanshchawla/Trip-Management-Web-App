import { loadingIndicator } from '@/components/ui/LoadingIndicator';
import { formatNumber } from '@/utils/utilArray';
import React, { useState, useEffect } from 'react';

interface DriverNameProps {
    tripId: string;
    amount : number
}

const TripRevenue: React.FC<DriverNameProps> = ({ tripId , amount}) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<boolean>(false);
    const [revenue, setRevenue] = useState<number>(amount)

    useEffect(() => {
        const calculateRevenue = async () => {
            try {
                const res = await fetch(`/api/trips/${tripId}/expenses`);
                const data = await res.json()
                const charges = data.charges
                const totalCharges = charges.reduce((acc : any, curr : any) => {
                    return curr.partyBill ? acc + curr.amount : acc - curr.amount;
                  }, 0);
                  

                setRevenue(revenue + parseInt(totalCharges))
            } catch (error: any) {
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        calculateRevenue();
    }, [tripId]);

    if (loading) return loadingIndicator;
    if (error || !revenue) return <span>NA</span>;

    return <span className='text-green-500 font-semibold'>₹{formatNumber(revenue) || ''}</span>;
};

export default TripRevenue;
