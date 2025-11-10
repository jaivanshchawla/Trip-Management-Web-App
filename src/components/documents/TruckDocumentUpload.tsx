'use client'
import { useMemo, useState } from 'react';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { motion } from 'framer-motion'
import { usePathname, useRouter } from 'next/navigation';
import { createWorker } from 'tesseract.js';
import { getDocType } from '@/helpers/ImageOperation';
import { extractLatestDate } from '@/helpers/ImageOperation';
import { Loader2 } from 'lucide-react';
import SingleFileUploader from '../SingleFileUploader';
import { useToast } from '../hooks/use-toast';
import { useExpenseData } from '../hooks/useExpenseData';

interface DocumentForm {
    filename: string;
    validityDate: string;  // ISO string for the date input
    docType: string;
    file: File | null;
    truckNo: string;
}

type Props = {
    open: boolean;
    truckNo?: string;
    setOpen: (open: boolean) => void;
    documentId?: string;
    setDocuments?: any
    setTruck?: any
};

const TruckDocumentUpload: React.FC<Props> = ({ open, setOpen, truckNo, documentId, setDocuments, setTruck }) => {
    const { trucks, refetchRecentDocuments } = useExpenseData()
    const [formData, setFormData] = useState<DocumentForm>({
        filename: '',
        validityDate: new Date().toISOString().split('T')[0],
        docType: '',
        file: null,
        truckNo: truckNo || ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter()
    const { toast } = useToast();
    const isOtherPage = usePathname() === '/user/documents/otherDocuments'
    // Filter trucks based on search term

    const filteredTrucks = useMemo(() => {
        if (!trucks || trucks.length === 0) return []
        let filtered = [...trucks]
        if (searchTerm) {
            let lowercaseQuery = searchTerm.toLocaleLowerCase()
            filtered = trucks.filter((truck) =>
                truck.truckNo.toLowerCase().includes(lowercaseQuery) ||
                truck.truckType.toLowerCase().includes(lowercaseQuery) ||
                truck.status.toLowerCase().includes(lowercaseQuery) ||
                truck.ownership.toLowerCase().includes(lowercaseQuery)
            )

        }
        return filtered
    }, [trucks, searchTerm])



    // Handle option selection for lorry (trip)
    const handleOptionSelect = (value: string) => {
        setFormData((prev) => ({ ...prev, truckNo: value }));
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
        // e.preventDefault(); // prevent any accidental form submission due to file input change

        const types = new Set(['License', 'Aadhar', 'PAN', 'Police Verification'])

        const fileData = new FormData();
        if (file) {
            setFormData({
                ...formData,
                filename: file.name,
                file: file,
            });

            fileData.append('file', file as File);
            setLoading(true);
            try {
                if (file.type.includes('image/')) {
                    const text = await extractTextFromImage(file);
                    const type = getDocType(text);
                    const validity: string = extractLatestDate(text) as any;
                    setFormData((prev) => ({
                        ...prev,
                        filename: file.name,
                        docType: types.has(type) ? type : 'Other',
                        validityDate: new Date(validity || Date.now()).toISOString().split('T')[0]
                    }));
                    setLoading(false);
                    return;
                } else {
                    const res = await fetch(`/api/documents/validate`, {
                        method: 'POST',
                        body: fileData,
                    });

                    setLoading(false);

                    if (!res.ok) {
                        toast({
                            description: 'Failed to get validity and docType. Please enter manually.',
                            variant: 'destructive'
                        })
                        setError('Failed to get validity and docType. Please enter manually.');
                        return;
                    }

                    const data = await res.json();
                    if (data.status === 402) {
                        setError(data.error);
                        return;
                    }
                    setFormData({
                        ...formData,
                        file: file,
                        validityDate: new Date(data.validity).toISOString().split('T')[0],
                        docType: types.has(data.docType) ? data.docType : 'Other',
                    });
                }
            } catch (error) {
                setLoading(false);
                toast({
                    description: 'Failed to get validity and docType. Please enter manually.',
                    variant: 'destructive'
                })
                setError('Error occurred while validating document. Please enter manually.');
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
            const response = await fetch(`/api/trucks/${truckNo || formData.truckNo}/documents`, {
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
                    truckNo: ''
                });
                setOpen(false)
                refetchRecentDocuments()
                const data = await response.json()
                if (setDocuments) {
                    setDocuments((prev: any) => [data.document, ...prev])
                } else if (setTruck) {
                    setTruck((prev: any) => ({
                        ...prev,
                        documents: [data.document, ...prev.documents]
                    }))
                }
                toast({
                    description: 'Document uploaded successfully',
                    variant: 'default'
                })
            } else {
                const errorData = await response.json();
                toast({
                    description: 'Something went wrong.',
                    variant: 'destructive'
                })
                setError(errorData.message || 'Something went wrong.');
            }
        } catch (err) {
            setLoading(false);
            toast({
                description: 'Failed to upload document',
                variant: 'destructive'
            })
            setError('Failed to upload document.');
        }
    };

    const handleMove = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await fetch(`/api/documents/${documentId}?movingto=truck`, {
                method: 'PATCH',
                body: JSON.stringify({
                    truckNo: formData.truckNo,
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
        <div className='modal-class'>


            <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                    duration: 0.5,
                    ease: [0, 0.71, 0.2, 1.01]
                }} className="w-full max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md flex flex-col">
                <h1 className="text-2xl font-semibold mb-4 text-black">{isOtherPage ? 'Moving to Truck Document' : 'Upload Document'}</h1>

                {/* Loading indicator */}


                {error && <p className="text-red-500 mb-4">{error}</p>}
                {successMessage && <p className="text-green-500 mb-4">{successMessage}</p>}

                <form onSubmit={isOtherPage ? handleMove : handleSubmit}>
                    {!isOtherPage && <SingleFileUploader onFileChange={handleFileChange} />}
                    {/* Lorry (trip) select */}
                    <div className="mb-4">
                        <label className="block text-sm text-gray-700">Lorry*</label>
                        <Select name="truckNo" defaultValue={formData.truckNo} value={formData.truckNo} onValueChange={handleOptionSelect}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Lorry" />
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
                                {filteredTrucks.length > 0 ? (
                                    filteredTrucks.map((truck) => (
                                        <SelectItem key={truck.truckNo} value={truck.truckNo}>
                                            <span>{truck.truckNo}</span>
                                            <span
                                                className={`ml-2 p-1 rounded ${truck.status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                                            >
                                                {truck.status}
                                            </span>
                                        </SelectItem>
                                    ))
                                ) : (
                                    <div className="p-2 text-gray-500">No lorries found</div>
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* File upload input */}

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
                            <option value="" disabled>Select Document Type</option>
                            <option value="Registration Certificate">Registration Certificate</option>
                            <option value="Permit">Permit</option>
                            <option value="Insurance">Insurance</option>
                            <option value="Pollution Certificate">Pollution Certificate</option>
                            <option value="Fitness Certificate">Fitness Certificate</option>
                            <option value="Tax">Tax</option>
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
                        <Button type="submit" >
                            {loading ? (
                                <div className="flex justify-center ">
                                    <Loader2 className='animate-spin text-white' />
                                </div>
                            ) : 'Submit'}
                        </Button>
                        <Button variant={'outline'} onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default TruckDocumentUpload;
