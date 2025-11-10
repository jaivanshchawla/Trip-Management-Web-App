import { useMemo, useState } from 'react';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { motion } from 'framer-motion'
import { usePathname, useRouter } from 'next/navigation';
import { createWorker } from 'tesseract.js';
import { getDocType } from '@/helpers/ImageOperation';
import { extractLatestDate } from '@/helpers/ImageOperation';
import { mutate } from 'swr';
import { statuses } from '@/utils/schema';
import { Loader2 } from 'lucide-react';
import SingleFileUploader from '../SingleFileUploader';
import { useToast } from '../hooks/use-toast';
import { useExpenseData } from '../hooks/useExpenseData';

interface DocumentForm {
    filename: string;
    validityDate: string;  // ISO string for the date input
    docType: string;
    file: File | null;
    tripId: string;

}

type Props = {
    open: boolean;
    tripId?: string;
    setOpen: (open: boolean) => void;
    setTrip?: any
    documentId?: string
    setDocuments?: any
};

const TripDocumentUpload: React.FC<Props> = ({ open, setOpen, tripId, setTrip, documentId, setDocuments }) => {
    const { trips } = useExpenseData()
    const { toast } = useToast()
    const [formData, setFormData] = useState<DocumentForm>({
        filename: '',
        validityDate: new Date().toISOString().split('T')[0],
        docType: '',
        file: null,
        tripId: tripId || ''
    });

    const isOtherPage = usePathname() === '/user/documents/otherDocuments'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter()

    // Filter trucks based on search term
    const filteredTrips = useMemo(() => {
        if (!trips || trips.length === 0) return []
        let filtered = [...trips]
        if (searchTerm) {
            const lowercaseQuery = searchTerm.toLowerCase()
            filtered = trips.filter((trip) =>
                trip.LR.toLowerCase().includes(lowercaseQuery) ||
                trip.partyName.toLowerCase().includes(lowercaseQuery) ||
                trip.route.origin.toLowerCase().includes(lowercaseQuery) ||
                trip.route.destination.toLowerCase().includes(lowercaseQuery) ||
                new Date(trip.startDate).toLocaleDateString().includes(lowercaseQuery) ||
                trip.amount.toString().includes(lowercaseQuery) ||
                trip.truckHireCost.toString().includes(lowercaseQuery) ||
                trip.balance.toString().includes(lowercaseQuery) ||
                trip.truck.toLowerCase().includes(lowercaseQuery)
            )
        }
        return filtered
    }, [trips, searchTerm])


    // Handle option selection for lorry (trip)
    const handleOptionSelect = (value: string) => {
        setFormData((prev) => ({ ...prev, tripId: value }));
    };


    // Handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
        }));
    };

    const extractTextFromImage = async (file: File): Promise<string> => {
        const worker = await createWorker('eng');
        const { data: { text } } = await worker.recognize(file);
        await worker.terminate();
        return text;
    };

    // Handle file change
    const handleFileChange = async (file: File) => {
        // e.preventDefault()
        const fileData = new FormData();
        const types = new Set(['E-Way Bill', 'POD', 'Bilty'])
        if (file) {
            setFormData({
                ...formData,
                file: file,
                filename : file.name
            });

            fileData.append('file', file as File);
            setLoading(true);
            try {
                if (file.type.includes('image/')) {
                    const text = await extractTextFromImage(file);
                    const type = getDocType(text)
                    const validity: string = extractLatestDate(text) as any
                    setFormData((prev) => ({
                        ...prev,
                        filename: file.name,
                        docType: types.has(type) ? type : 'Other',
                        validityDate: new Date(validity || Date.now()).toISOString().split('T')[0]
                    }))
                    setLoading(false)
                    return
                } else {
                    const res = await fetch(`/api/documents/validate`, {
                        method: 'POST',
                        body: fileData,
                    });

                    setLoading(false);

                    if (!res.ok) {
                        toast({
                            description: 'Failed to get validity and docType. Please enter manually',
                            variant: 'destructive'
                        })
                        setError('Failed to get validity and docType. Please enter manually.');
                        return;
                    }

                    const data = await res.json();
                    if (data.status === 402) {
                        setError(data.error)
                        return
                    }
                    setFormData({
                        ...formData,
                        file: file,
                        filename: file.name,
                        validityDate: new Date(data.validity).toISOString().split('T')[0],
                        docType: types.has(data.docType) ? data.docType : 'Other',
                    });
                }
            } catch (error) {
                setLoading(false);
                toast({
                    description: 'Error occured while validating document',
                    variant: 'destructive'
                })
                setError('Error occurred while validating document.');
            }
        }
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!formData.file) {
            setError('Please upload a document.');
            return;
        }

        setLoading(true);
        setError('');
        setSuccessMessage('');

        const data = new FormData();
        data.append('file', formData.file);
        data.append('filename', formData.filename);
        data.append('validityDate', formData.validityDate);
        data.append('docType', formData.docType);

        try {
            const response = await fetch(`/api/trips/${tripId || formData.tripId}/documents`, {
                method: 'PUT',
                body: data,
            });

            setLoading(false);

            if (response.ok) {
                toast({
                    description: 'Documents uploaded successfully!',
                })
                setSuccessMessage('Document uploaded successfully!');
                setError('');
                setFormData({
                    filename: '',
                    validityDate: new Date().toISOString().split('T')[0],
                    docType: '',
                    file: null,
                    tripId: ''
                });
                setOpen(false)
                mutate('/api/documents/recent')
                const data = await response.json();
                if (setTrip) {
                    setTrip((prev: any) => ({
                        ...prev,
                        documents: data.documents
                    }))
                }
                router.refresh()
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Something went wrong.');
            }
        } catch (err) {
            setLoading(false);
            toast({
                description: 'Error uploading document',
                variant: 'destructive'
            })
            setError('Failed to upload document.');
        }
    };

    const handleMove = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await fetch(`/api/documents/${documentId}?movingto=trip`, {
                method: 'PATCH',
                body: JSON.stringify({
                    tripId: formData.tripId,
                    filename: formData.filename,
                    validityDate: new Date(formData.validityDate),
                    docType: formData.docType
                })
            })
            if (res.ok) {
                toast({
                    description: 'Document moved successfully!',
                    variant: 'default'
                })
                const data = await res.json();
            } else {
                toast({
                    description: 'Failed to move document!',
                    variant: 'destructive'
                })
            }
        } catch (error) {
            toast({
                description: 'Internal Server Error',
                variant: 'destructive'
            })
        }
        setOpen(false)
        setLoading(false)
        setDocuments((prev: any) => prev.filter((doc: any) => doc._id !== documentId))
    }

    if (!open) {
        return null;
    }

    return (
        <div
            className="modal-class"
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                    duration: 0.5,
                    ease: [0, 0.71, 0.2, 1.01]
                }} className="w-full max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md flex flex-col">
                <h1 className="text-2xl font-semibold mb-4 text-black">{isOtherPage ? 'Moving to Trip Document' : 'Upload Document'}</h1>

                {/* Loading indicator */}


                {error && <p className="text-red-500 mb-4">{error}</p>}
                {successMessage && <p className="text-green-500 mb-4">{successMessage}</p>}

                <form onSubmit={isOtherPage ? handleMove : handleSubmit}>

                    {!isOtherPage && <SingleFileUploader onFileChange={handleFileChange} />}
                    {/* Lorry (trip) select */}
                    <div className="mb-4">
                        <label className="block text-sm text-gray-700">Trip*</label>
                        <Select name="tripId" defaultValue={formData.tripId} onValueChange={handleOptionSelect}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Trip" />
                            </SelectTrigger>
                            <SelectContent>
                                <div className="p-2">
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                {filteredTrips && filteredTrips.length > 0 ? (
                                    filteredTrips.map((trip) => (
                                        <SelectItem key={trip.trip_id} value={trip.trip_id}>
                                            <div className="flex items-center justify-between w-full p-2 space-x-4">

                                                {/* Display route origin to destination */}
                                                <span className="font-semibold text-gray-700 whitespace-nowrap">
                                                    {trip.route.origin.split(',')[0]} &rarr; {trip.route.destination.split(',')[0]}
                                                </span>

                                                {/* Status indicator with progress bar */}
                                                <div className="flex flex-col w-1/2 space-y-1">
                                                    {/* Status label */}
                                                    <span className="text-sm text-gray-600">
                                                        {statuses[trip.status as number]}
                                                    </span>

                                                    {/* Progress bar for status */}
                                                    <div className="relative w-full h-1 bg-gray-200 rounded">
                                                        <div
                                                            className={`absolute top-0 left-0 h-1 rounded transition-width duration-500 ${trip.status === 0
                                                                ? 'bg-red-500'
                                                                : trip.status === 1
                                                                    ? 'bg-yellow-500'
                                                                    : trip.status === 2
                                                                        ? 'bg-blue-500'
                                                                        : trip.status === 3
                                                                            ? 'bg-green-500'
                                                                            : 'bg-green-800'
                                                                }`}
                                                            style={{ width: `${(trip.status as number / 4) * 100}%` }}
                                                        />
                                                    </div>
                                                </div>

                                                {/* LR number */}
                                                <span className="text-sm text-gray-600 whitespace-nowrap">
                                                    {trip.LR}
                                                </span>

                                                {/* Start date */}
                                                <span className="text-sm text-gray-600 whitespace-nowrap">
                                                    {new Date(trip.startDate).toISOString().split('T')[0]}
                                                </span>

                                            </div>
                                        </SelectItem>

                                    ))
                                ) : (
                                    <div className="p-2 text-gray-500">No Trips found</div>
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* File upload input */}
                    {/* <div className="mb-4">
                    <label className="block text-gray-700">Upload File(pdf)*</label>
                    <input
                        type="file"
                        name="file"
                        onChange={handleFileChange}
                        className="w-full mt-1 p-2 border rounded"
                        accept="application/pdf, image/*"
                        required
                    />
                </div> */}


                    {/* Filename input */}
                    <div className="mb-4">
                        <label className="block text-gray-700">Filename</label>
                        <input
                            type="text"
                            name="filename"
                            value={formData.filename}
                            onChange={handleChange}
                            className="w-full mt-1 p-2 border rounded"
                            placeholder="(optional)"
                        />
                    </div>

                    {/* Document Type select */}
                    <div className="mb-4">
                        <label className="block text-gray-700">Document Type*</label>
                        <select
                            name="docType"
                            value={formData.docType}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Document Type</option>
                            <option value="E-Way Bill">E-Way Bill</option>
                            <option value="POD">POD (Proof of Delivery)</option>
                            <option value="Bilty">Bilty</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    {/* Validity Date input */}
                    <div className="mb-4">
                        <label className="block text-gray-700">Validity Date*</label>
                        <input
                            type="date"
                            name="validityDate"
                            value={formData.validityDate}
                            onChange={handleChange}
                            className="w-full mt-1 p-2 border rounded"
                            required
                        />
                    </div>



                    {/* Submit button */}
                    <div className="flex items-center space-x-2 justify-end">
                        <Button type="submit" disabled={loading} >
                            {loading ? (
                                <div className="flex justify-center ">
                                    <Loader2 className='animate-spin text-white' />
                                </div>
                            ) : 'Submit'}
                        </Button>
                        <Button variant={'outline'} onClick={() => setOpen(false)} disabled={loading}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default TripDocumentUpload;
