'use client'

import { useState } from 'react';
import { Button } from '../ui/button';
import { motion } from 'framer-motion'
import { Loader2, X, Edit2 } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import FileUploader from '../FileUploader';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { v4 as uuidV4 } from 'uuid'
import { useSWRConfig } from 'swr';

interface FileData {
  id: string;
  file: File;
  filename: string;
  validityDate: string;
}

interface DocumentForm {
  files: FileData[];
}

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
  setUser?: any;
};

const OtherDocumentUpload: React.FC<Props> = ({ open, setOpen, setUser }) => {
  const [formData, setFormData] = useState<DocumentForm>({
    files: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { toast } = useToast();
  const { mutate } = useSWRConfig()

  const handleFilesChange = (files: File[]) => {
    const newFiles = files.map(file => ({
      id: uuidV4(),
      file,
      filename: file.name,
      validityDate: '',
    }));
    setFormData(prevData => ({
      ...prevData,
      files: [...prevData.files, ...newFiles],
    }));
  };

  const removeFile = (id: string) => {
    setFormData(prevData => ({
      ...prevData,
      files: prevData.files.filter(file => file.id !== id),
    }));
  };

  const updateFileData = (id: string, data: Partial<FileData>) => {
    setFormData(prevData => ({
      ...prevData,
      files: prevData.files.map(file =>
        file.id === id ? { ...file, ...data } : file
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formData.files.length === 0) {
      setError('Please upload at least one document.');
      toast({
        description: 'Please upload at least one document.',
        variant: 'warning'
      });
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    const data = new FormData();
    formData.files.forEach((fileData) => {
      data.append(`file-${fileData.id}`, fileData.file);
    });
    data.append('filesData', JSON.stringify(formData.files.map(({ id, filename, validityDate }) => ({ id, filename, validityDate }))));

    try {
      const response = await fetch(`/api/documents`, {
        method: 'POST',
        body: data,
      });

      setLoading(false);

      if (response.ok) {
        toast({
          description: 'Documents uploaded successfully!',
        })
        const responseData = await response.json();
        setSuccessMessage('Documents uploaded successfully!');
        setError('');
        setFormData({ files: [] });
        setOpen(false);
        if (setUser)
          setUser((prev: any[]) => [
            ...responseData.documents,
            ...prev
          ]);
        mutate('/api/documents/recent')
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Something went wrong.');
        toast({
          description: 'Failed to upload documents',
          variant: 'destructive'
        });
      }
    } catch (err) {
      setLoading(false);
      setError('Failed to upload documents.');
      toast({
        description: 'Failed to upload documents',
        variant: 'destructive'
      });
    }
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
        }}
        className="w-full max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md flex flex-col z-50"
      >
        <h1 className="text-2xl font-semibold mb-4 text-black">Upload Documents</h1>

        {error && <p className="text-red-500 mb-4">{error}</p>}
        {successMessage && <p className="text-green-500 mb-4">{successMessage}</p>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Upload Files (PDF or Image)*</label>
            <FileUploader onFilesChange={handleFilesChange} />
          </div>

          {formData.files.length > 0 && (
            <div className="mb-4 max-h-[400px] overflow-auto thin-scrollbar">
              <h3 className="text-lg font-semibold mb-2">Uploaded Files:</h3>
              <ul className="space-y-2">
                {formData.files.map((fileData) => (
                  <li key={fileData.id} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                    <span>{fileData.filename}</span>
                    <div className="flex items-center space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit File Details</DialogTitle>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <label htmlFor="filename" className="text-right">
                                Filename
                              </label>
                              <Input
                                id="filename"
                                value={fileData.filename}
                                onChange={(e) => updateFileData(fileData.id, { filename: e.target.value })}
                                className="col-span-3"
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <label htmlFor="validity" className="text-right">
                                Validity Date
                              </label>
                              <Input
                                id="validity"
                                type="date"
                                value={fileData.validityDate}
                                onChange={(e) => updateFileData(fileData.id, { validityDate: e.target.value })}
                                className="col-span-3"
                              />
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(fileData.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

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

export default OtherDocumentUpload;

