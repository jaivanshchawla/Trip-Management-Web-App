import React, { useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from 'lucide-react';

interface Document {
  type: string;
  validityDate: string;
  uploadedDate: string;
}

interface Reminder {
  _id: string;
  trip_id?: string;
  truck?: string;
  truckNo?: string;
  startDate?: string;
  LR?: string;
  name?: string;
  contactNumber?: string;
  documents: Document;
}

interface NotificationProps {
  tripReminders: Reminder[];
  truckReminders: Reminder[];
  driverReminders: Reminder[];
  isOpen: boolean;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ tripReminders, truckReminders, driverReminders, isOpen, onClose }) => {
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderReminders = (reminders: Reminder[], type: string) => {
    return reminders.map((reminder) => (
      <div key={reminder._id} className="mb-4 last:mb-0">
        <h4 className="font-semibold">{type} Reminder</h4>
        <p>{type === 'Trip' ? `LR: ${reminder.LR}` : type === 'Truck' ? `Truck: ${reminder.truckNo}` : `Driver: ${reminder.name}`}</p>
        <p>Document: {reminder.documents.type}</p>
        <p>Valid until: {formatDate(reminder.documents.validityDate)}</p>
        <span className={`mt-2 inline-block px-2 py-1 text-[10px] font-semibold rounded-full ${
          new Date(reminder.documents.validityDate) < new Date() 
            ? "bg-red-100 text-red-800" 
            : "bg-yellow-100 text-yellow-800"
        }`}>
          {new Date(reminder.documents.validityDate) < new Date() ? "Expired" : "Expiring Soon"}
        </span>
      </div>
    ));
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={notificationRef}
      className="absolute right-0 top-full mt-2 w-80 z-50 transform transition-all duration-300 ease-in-out thin-scrollbar"
    >
      <Card className="w-full shadow-lg">
        <CardHeader >
          <CardTitle className="flex items-center justify-between ">Reminders
          <button onClick={onClose} className="p-2">
            <X size={24} />
          </button>
          </CardTitle>
          
        </CardHeader>
        <CardContent>
          <div className="max-h-[400px] overflow-y-auto pr-4 text-xs">
            {renderReminders(tripReminders, 'Trip')}
            {renderReminders(truckReminders, 'Truck')}
            {renderReminders(driverReminders, 'Driver')}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Notification;
