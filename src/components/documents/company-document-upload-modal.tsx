'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import CompanyDocumentUpload from '@/components/documents/CompanyDocumentUpload';
import { CloudUpload } from 'lucide-react';

type Props = {
  setDocs: React.Dispatch<React.SetStateAction<any>>;
};

const CompanyDocumentUploadModal: React.FC<Props> = ({ setDocs }) => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
     <div className='flex justify-end my-2 fixed right-4 bottom-4'>
        <Button onClick={() => setModalOpen(true)} className='rounded-full h-full py-2'><CloudUpload size={40} /></Button>
      </div>
          <CompanyDocumentUpload open={modalOpen} setOpen={setModalOpen} setDocs={setDocs} />
        
    </>
  );
};

export default CompanyDocumentUploadModal;

