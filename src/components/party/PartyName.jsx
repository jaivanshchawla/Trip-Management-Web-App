import React, { useState, useEffect } from 'react';
import { fetchPartyName } from '@/helpers/fetchPartyName';
import { loadingIndicator } from '../ui/LoadingIndicator';

const PartyName = ({ partyId }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [driverName, setDriverName] = useState('')

    useEffect(() => {
        const loadPartyName = async () => {
            try {
                const name = await fetchPartyName(partyId);
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
        loadPartyName();
    }, [partyId]);

    if (loading) return loadingIndicator;
    if (error || !driverName) return <span>NA</span>;

    return <span>{driverName || ''}</span>;
};

export default PartyName;
