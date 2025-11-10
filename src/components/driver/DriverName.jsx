import React, { useState, useEffect } from 'react';
import { fetchDriverName } from '@/helpers/driverOperations';

const DriverName = ({ driverId }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [driverName, setDriverName] = useState('')

    useEffect(() => {
        const LoadDriverName = async () => {
            try {
                const name = await fetchDriverName(driverId);
                console.log(name)
                if (!name) {
                    throw new Error('Name not found');
                }
                setDriverName(name);
            } catch (error) {
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
