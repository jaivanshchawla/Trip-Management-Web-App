'use client'

import { useState } from 'react';
import { Button } from '../ui/button';
import { motion } from 'framer-motion'
import { createWorker } from 'tesseract.js';
import { Loader2, X } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import FileUploader from '../FileUploader';
import { useSWRConfig } from 'swr';

interface DocumentForm {
    files: File[];
    filenames: string[];
}

type Props = {
    open: boolean;
    setOpen: (open: boolean) => void;
    setDocs?: any
};

const CompanyDocumentUpload: React.FC<Props> = ({ open, setOpen, setDocs }) => {
    const [formData, setFormData] = useState<DocumentForm>({
        files: [],
        filenames: [],
    });
    const {mutate} = useSWRConfig()
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const { toast } = useToast()

    // Handle input changes for filenames
    const handleFilenameChange = (index: number, value: string) => {
        setFormData(prevData => ({
            ...prevData,
            filenames: prevData.filenames.map((filename, i) => i === index ? value : filename),
        }));
    };

    const extractTextFromImage = async (file: File): Promise<string> => {
        const worker = await createWorker('eng');
        const { data: { text } } = await worker.recognize(file);
        await worker.terminate();
        return text;
    };

    // Handle file change
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();

        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setFormData(prevData => ({
                files: [...prevData.files, ...newFiles],
                filenames: [...prevData.filenames, ...newFiles.map(file => file.name)],
            }));
        }
    };

    const handleFilesChange = (files: File[]) => {
        setFormData(prevData => ({
            files: [...prevData.files, ...files],
            filenames: [...prevData.filenames, ...files.map(file => file.name)],
        }));
    };

    // Remove file
    const removeFile = (index: number) => {
        setFormData(prevData => ({
            files: prevData.files.filter((_, i) => i !== index),
            filenames: prevData.filenames.filter((_, i) => i !== index),
        }));
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        setLoading(true)
        e.preventDefault();

        if (formData.files.length === 0) {
            setError('Please upload at least one document.');
            toast({
                description: 'Please upload at least one document.',
                variant: 'warning',
            });
            return;
        }

        const data = new FormData();

        formData.files.forEach((file, index) => {
            data.append(`file${index}`, file);
            // Ensure a filename is always provided
            data.append(`filename${index}`, formData.filenames[index] || file.name);
        });


        try {
            const response = await fetch(`/api/users`, {
                method: 'PATCH',
                body: data,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Unknown error');
            }
            toast({
                description: 'Documents uploaded successfully!',
            })
            const responseData = await response.json();
            setSuccessMessage(responseData.message);
            setFormData({ files: [], filenames: [] });
            setOpen(false);
            if (setDocs)
                setDocs(responseData.user.documents);
            mutate('/api/documents/recent')
        } catch (err: any) {
            setError(err.message);
            toast({
                description: err.message,
                variant: 'destructive',
            });
        }
        setLoading(false)
    };



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
                }} className="w-full max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md flex flex-col z-50">
                <h1 className="text-2xl font-semibold mb-4 text-black">Upload Documents</h1>

                {error && <p className="text-red-500 mb-4">{error}</p>}
                {successMessage && <p className="text-green-500 mb-4">{successMessage}</p>}

                <form onSubmit={handleSubmit}>
                    {/* File upload input */}
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Upload Files (PDF or Image)*</label>
                        <FileUploader onFilesChange={handleFilesChange} />
                    </div>

                    {/* Display uploaded files */}
                    {formData.files.length > 0 && (
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold mb-2">Uploaded Files:</h3>
                            <ul className="space-y-2">
                                {formData.files.map((file, index) => (
                                    <li key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                                        <input
                                            type="text"
                                            value={formData.filenames[index]}
                                            onChange={(e) => handleFilenameChange(index, e.target.value)}
                                            className="flex-grow mr-2 p-1 border rounded"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeFile(index)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Submit button */}
                    <div className="flex items-center space-x-2 justify-end">
                        <Button type="submit" disabled={loading}>
                            {loading ? <Loader2 className='text-white animate-spin' /> : 'Submit'}
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

export default CompanyDocumentUpload;

