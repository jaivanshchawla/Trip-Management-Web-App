import React, { useState, useEffect } from 'react';
import { fetchDriverName } from '@/helpers/driverOperations';

interface DriverNameProps {
    driverId: string;
}

const DriverName: React.FC<DriverNameProps> = ({ driverId }) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<boolean>(false);
    const [driverName, setDriverName] = useState<string>('')

    useEffect(() => {
        const LoadDriverName = async () => {
            try {
                const name = await fetchDriverName(driverId);
                console.log(name)
                if (!name) {
                    throw new Error('Name not found');
                }
                setDriverName(name);
            } catch (error: any) {
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        LoadDriverName();
    }, [driverId]);

    if (loading) return <span>Loading...</span>;
    if (error || !driverName) return <span>NA</span>;

    return <span>{driverName}</span>;
};

export default DriverName;
