'use client';

import React, { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { ITrip } from '@/utils/interface';
import { useParams, useRouter } from 'next/navigation';
import { MdEdit, MdDelete } from 'react-icons/md';
import { Button } from '@/components/ui/button';
import Loading from '../loading';
import { useTrip } from '@/context/tripContext';
import { Frown, Loader2, X } from 'lucide-react';
import TripDetails from '@/components/trip/tripDetail/TripDetail';
import { AnimatePresence, motion } from 'framer-motion';

// Dynamically import components
const EditTripForm = dynamic(() => import('@/components/trip/EditTripForm'), {
  ssr: false,
});


const TripPage: React.FC = () => {
  const { trip, setTrip, loading } = useTrip();
  const router = useRouter();
  const { tripId } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [docModalOpen, setDocModalOpen] = useState(false)
  const [error, setError] = useState('')
  const [deleteModal, setDeleteModal] = useState(false)

  const TripDocumentUpload = dynamic(() => import('@/components/documents/TripDocumentUpload'), { ssr: false })

  const handleEdit = useCallback(async (data: Partial<ITrip>) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/trips/${tripId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data })
      });


      const newData = await res.json();
      if (newData.status === 400) {
        alert(newData.message);
        setIsSubmitting(false);
        return;
      }
      setTrip((prev: ITrip | any) => ({
        ...prev,
        ...newData.trip,
        balance: newData.trip.amount - (prev.amount - prev.balance)
      }));
      setIsEditing(false); // Close editing mode after successful edit

    } catch (error) {
      console.error('Error editing trip:', error);
    } finally {
      setIsSubmitting(false);
      setIsEditing(false);
    }
  }, [trip, tripId, router, setTrip]);

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleDelete = useCallback(async () => {
    try {
      const res = await fetch(`/api/trips/${tripId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) throw new Error('Failed to delete trip');
      router.push('/user/trips'); // Redirect to trips list after deletion
    } catch (error) {
      console.error('Error deleting trip:', error);
    }
  }, [tripId, router]);

  if (loading) {
    return <Loading />;
  }

  if (!trip) {
    return <div className='flex items-center justify-center space-x-2'><Frown className='text-bottomNavBarColor' /> Trip Not Found</div>
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="mx-auto p-4">

      {
        isSubmitting &&
        <div className=''>
          <Loading /> {/* Ensure Loading component shows the GIF */}
        </div>
      }

      <div className='flex items-center justify-between'>
        <Button onClick={() => setDocModalOpen(true)}>
          Upload Document
        </Button>
        <div className="flex justify-end space-x-4 mb-4">
          <Button
            variant="outline"
            onClick={() => {
              setIsEditing(true);
            }}
            className="transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            <MdEdit className="mr-2" /> Edit
          </Button>
          <Button
            variant="destructive"
            onClick={()=>setDeleteModal(true)}
            className="transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            <MdDelete className="mr-2" /> Delete
          </Button>
        </div>
      </div>



      <EditTripForm
        isOpen={isEditing}
        onClose={handleCancelEdit}
        trip={trip as ITrip}
        onSubmit={handleEdit}
      />
      <TripDetails />
      {docModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <TripDocumentUpload open={docModalOpen} setOpen={setDocModalOpen} tripId={tripId as string} />
        </div>
      )}
      {deleteModal &&
        <AnimatePresence>
          <motion.div
            className="modal-class"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-lg shadow-xl p-4 w-full max-w-sm mx-4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 15, stiffness: 300 }}
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold">Confirm Delete</h3>
                <Button variant="ghost" size="sm" onClick={() => setDeleteModal(false)} className='px-2 py-0'>
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </Button>
              </div>
              <p className="text-gray-600 mb-6">Are you sure you want to Delete?</p>
              <div className="flex justify-end space-x-4">
                <Button variant="outline" onClick={() => setDeleteModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleDelete}>
                  Delete
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      }
    </div>
  );
};

export default TripPage;
