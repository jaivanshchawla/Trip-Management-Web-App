import { useMemo, useState } from 'react';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { motion } from 'framer-motion'
import { usePathname, useRouter } from 'next/navigation';
import { getDocType } from '@/helpers/ImageOperation';
import { createWorker } from 'tesseract.js';
import { extractLatestDate } from '@/helpers/ImageOperation';
import { mutate } from 'swr';
import { Loader2 } from 'lucide-react';
import SingleFileUploader from '../SingleFileUploader';
import { useToast } from '../hooks/use-toast';
import { useExpenseData } from '../hooks/useExpenseData';

const DriverDocumentUpload = ({ open, setOpen, driverId, documentId, setDocuments, setDriver }) => {
    const { drivers } = useExpenseData()
    const [formData, setFormData] = useState({
        filename: '',
        validityDate: new Date().toISOString().split('T')[0],
        docType: '',
        file: null,
        driverId: driverId || ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const { toast } = useToast()
    const isOtherPage = usePathname() === '/user/documents/otherDocuments'



    // Filter drivers based on search term

    const filteredDrivers = useMemo(() => {
        if (!drivers || drivers.length === 0) return []
        let filtered = [...drivers]
        if (searchTerm) {
            const lowercaseQuery = searchTerm.toLowerCase()
            filtered = drivers.filter((driver) =>
                driver.name.toLowerCase().includes(lowercaseQuery) ||
                driver.contactNumber.toLowerCase().includes(lowercaseQuery)
            )
        }
        return filtered
    }, [drivers, searchTerm])


    // Handle option selection for lorry (driver)
    const handleOptionSelect = (value) => {
        setFormData((prev) => ({ ...prev, driverId: value }));
    };

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const extractTextFromImage = async (file) => {
        const worker = await createWorker('eng');
        const { data: { text } } = await worker.recognize(file);
        await worker.terminate();
        return text;
    };

    // Handle file change
    // Handle file change
    const handleFileChange = async (file) => {
        // e.preventDefault(); // prevent any accidental form submission due to file input change

        const types = new Set(['License', 'Aadhar', 'PAN', 'Police Verification'])

        const fileData = new FormData();
        if (file) {
            setFormData({
                ...formData,
                filename: file.name,
                file: file,
            });

            fileData.append('file', file);
            setLoading(true);
            try {
                if (file.type.includes('image/')) {
                    const text = await extractTextFromImage(file);
                    const type = getDocType(text);
                    const validity = extractLatestDate(text);
                    setFormData((prev) => ({
                        ...prev,
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
                        filename: file.name,
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
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.file) {
            setError('Please upload a document.');
            return;
        }
        if (!formData.docType || !formData.validityDate) {
            setError('Please fill out all fields')
            toast({
                description: 'Please fill out all fields',
                variant: 'warning'
            })
            setLoading(false)
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
            const response = await fetch(`/api/drivers/${driverId || formData.driverId}/documents`, {
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
                    driverId: ''
                });
                setOpen(false);
                const data = await response.json()
                mutate('/api/documents/recent')
                if (setDocuments) {
                    setDocuments((prev) => [
                        { ...data.document },
                        ...prev
                    ])
                } else if (setDriver) {
                    setDriver((prev) => ({
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
                    description: 'Something went wrong',
                    variant: 'destructive'
                })
                setError(errorData.message || 'Something went wrong.');
            }
        } catch (err) {
            setLoading(false);
            toast({
                description: 'Something went wrong',
                variant: 'destructive'
            })
            setError('Failed to upload document.');
        }
    };

    const handleMove = async (e) => {
        e.preventDefault()
        setLoading(true)
        if (!formData.docType || !formData.validityDate) {
            setError('Please fill out all fields')
            toast({
                description: 'Please fill out all fields',
                variant: 'warning'
            })
            setLoading(false)
            return;
        }
        try {
            const res = await fetch(`/api/documents/${documentId}?movingto=driver`, {
                method: 'PATCH',
                body: JSON.stringify({
                    driverId: formData.driverId,
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
        setDocuments((prev) => prev.filter((doc) => doc._id !== documentId))
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
                <h1 className="text-2xl font-semibold mb-4 text-black">{isOtherPage ? 'Moving to Driver Document' : "Upload Document"}</h1>

                {/* Loading indicator */}


                {error && <p className="text-red-500 mb-4">{error}</p>}
                {successMessage && <p className="text-green-500 mb-4">{successMessage}</p>}

                <form onSubmit={isOtherPage ? handleMove : handleSubmit}>

                    {!isOtherPage && <SingleFileUploader onFileChange={handleFileChange} />}
                    {/* Lorry (driver) select */}
                    <div className="mb-4">
                        <label className="block text-sm text-gray-700">Driver*</label>
                        <Select name="driver" defaultValue={formData.driverId} onValueChange={handleOptionSelect}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Driver" />
                            </SelectTrigger>
                            <SelectContent>
                                <div className="p-2">
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                    />
                                </div>
                                {filteredDrivers.length > 0 ? (
                                    filteredDrivers.map((driver) => (
                                        <SelectItem key={driver.driver_id} value={driver.driver_id} >
                                            <div className='grid grid-cols-3 text-left w-full gap-4'>
                                                <p className='col-span-1'>{driver.name}</p>
                                                <p className='col-span-1'>{driver.contactNumber}</p>
                                                <p
                                                    className={`col-span-1 p-1 rounded ${driver.status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                                                >
                                                    {driver.status}
                                                </p>
                                            </div>


                                        </SelectItem>
                                    ))
                                ) : (
                                    <div className="p-2 text-gray-500">No drivers found</div>
                                )}
                            </SelectContent>
                        </Select>
                    </div>



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
                            <option value="License">License</option>
                            <option value="Aadhar">Aadhar</option>
                            <option value="PAN">PAN (Permanent Account Number)</option>
                            <option value="Police Verification">Police Verification</option>
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
                            onClick={(e) => e.target.showPicker()}
                            className="w-full mt-1 p-2 border rounded"
                            required
                        />
                    </div>



                    {/* Submit button */}
                    <div className="flex items-center space-x-2 justify-end">
                        <Button type="submit" disabled={loading}>
                            {loading ? (
                                <div className="flex items-center justify-center ">
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

export default DriverDocumentUpload;
