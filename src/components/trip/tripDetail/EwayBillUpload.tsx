import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useRef, useEffect } from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

interface EWayBillUploadProps {
  tripId: string;
  ewayBillUrl?: string;
  validity?: Date | null;
  setEwayBillUrl: (url: string) => void;
}

const EWayBillUpload: React.FC<EWayBillUploadProps> = ({ tripId, ewayBillUrl, setEwayBillUrl, validity }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [ewbValidityDate, setEwbValidityDate] = useState<string | null>(null);
  const [showManualDateInput, setShowManualDateInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (validity) {
      setEwbValidityDate(new Date(validity).toISOString().split('T')[0]);
    }
  }, [validity]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setShowManualDateInput(false); // Reset manual date input if a new file is selected
    }
  };

  const handleSubmit = async () => {
    if (selectedFile || ewbValidityDate) {
      setIsUploading(true);
      try {
        const formData = new FormData();
        if (selectedFile) {
          formData.append('file', selectedFile);
        }
        formData.append('tripId', tripId);
        if (ewbValidityDate) {
          formData.append('ewbValidityDate', ewbValidityDate);
        }

        const response = await fetch(`/api/s3Upload`, {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (response.ok) {
          setEwayBillUrl(data.fileUrl);

          if (data.ewbValidityDate) {
            setEwbValidityDate(data.ewbValidityDate);
            setShowManualDateInput(false); // No need for manual input if date is extracted
          } else if (!ewbValidityDate) {
            setShowManualDateInput(true);
            alert(data.message || 'Failed to extract validity date. Please enter it manually.');
          }
        } else {
          alert('Failed to upload e-way bill');
        }
      } catch (error) {
        console.error('Error uploading e-way bill:', error);
        alert('Error uploading e-way bill');
      } finally {
        setIsUploading(false);
        setSelectedFile(null);
      }
    }
  };

  const handleImageClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="p-6 border rounded-lg border-lightOrange shadow-lg bg-white w-full hover:shadow-lightOrangeButtonColor transition-shadow duration-300 relative">
      <h3 className="text-lg font-semibold">E-Way Bill</h3>
      {ewayBillUrl ? (
        <div className="mt-4">
          <div className="relative flex-col space-y-2">
            {ewayBillUrl.endsWith('.pdf') ?
              <Button variant={'link'}><Link href={ewayBillUrl.split('.pdf')[0]} >View PDF</Link></Button> :
              <>
                <Image
                  src={ewayBillUrl}
                  alt="e-way bill"
                  height={100}
                  width={100}
                  className="cursor-pointer transition-transform transform duration-300 ease-out hover:scale-105"
                  onClick={handleImageClick}
                />
              </>}
            <input
              type="file"
              accept=".pdf,.jpg,.png"
              onChange={handleFileChange}
              disabled={isUploading}
              className="w-full text-sm text-gray-700 file:bg-lightOrangeButtonColor file:border-none file:rounded-lg file:px-4 file:py-2 file:cursor-pointer hover:file:bg-darkOrangeButtonColor mt-2"
            />



          </div>
        </div>
      ) : (
        <div className="mt-4">
          <input
            type="file"
            accept=".pdf,.jpg,.png"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </div>
      )}

      {ewbValidityDate && !showManualDateInput && (
        <div className="mt-4">
          <label htmlFor="ewbValidityDate" className="block text-sm font-medium text-gray-700">
            Validity Date:
          </label>
          <input
            type="text"
            id="ewbValidityDate"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            value={ewbValidityDate}
            readOnly
          />
        </div>
      )}

      {showManualDateInput && (
        <div className="mt-4">
          <label htmlFor="ewbValidityDate" className="block text-sm font-medium text-gray-700">
            Enter Validity Date (YYYY-MM-DD):
          </label>
          <input
            type="date"
            id="ewbValidityDate"
            onClick={(e) => (e.target as HTMLInputElement).showPicker()}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            value={ewbValidityDate || ''}
            onChange={(e) => setEwbValidityDate(e.target.value)}
          />
        </div>
      )}
      <Button
        onClick={handleSubmit}
        disabled={isUploading || (!selectedFile && !ewbValidityDate)}
        className="mt-4"
      >
        {isUploading ? 'Uploading...' : 'Submit E-Way Bill'}
      </Button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
          <div className="p-4 rounded-lg shadow-lg flex-col space-y-1 bg-lightOrangeButtonColor">

            <Image
              src={ewayBillUrl || ""}
              alt="E-Way Bill Large View"
              height={500}
              width={500}
              className="max-w-full h-auto"
            />
            <Button
              onClick={handleCloseModal}
              className='w-full'
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EWayBillUpload;
