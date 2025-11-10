import React, { useState, useEffect } from 'react';
import { fetchTripRoute } from '@/helpers/TripOperation';
import { FaArrowRight } from 'react-icons/fa';

interface TripRouteProps {
  tripId: string;
}

const TripRoute: React.FC<TripRouteProps> = ({ tripId }) => {
  const [tripRoute, setTripRoute] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        const tripData = await fetchTripRoute(tripId);
        if (tripData) {
          setTripRoute(<div className="flex items-center space-x-2">
            <span>{tripData.origin.split(',')[0]}</span>
            <FaArrowRight className='text-xs'/>
            <span>{tripData.destination.split(',')[0]}</span>
          </div>);
        } else {
          setError('Failed to fetch trip route');
          setTripRoute('NA')
        }
      } catch (err) {
        setError('Failed to fetch trip route');
      } finally {
        setLoading(false);
      }
    };

    fetchRoute();
  }, [tripId]);

  if (loading) return <span>Loading...</span>;
  if (error) return <span>NA</span>;

  return <span>{tripRoute}</span>;
};

export default TripRoute;
