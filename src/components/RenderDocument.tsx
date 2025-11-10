'use client'

import { useState } from 'react';
import Link from "next/link";
import Image from "next/image";
import { Button } from './ui/button';

type props = {
    documentUrl : string
}

const isPdf = (fileName: string) => {
    return fileName?.toLowerCase().endsWith('.pdf');
};


const RenderDocument: React.FC<props> = ({documentUrl}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleDownload = async () => {
        try {
            const response = await fetch(documentUrl.split('.pdf')[0]);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.setAttribute('download', documentUrl.split('/').pop() || 'file'); // Set file name or fallback to 'file'
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link); // Clean up link element
            window.URL.revokeObjectURL(blobUrl); // Revoke blob URL after download
        } catch (error) {
            console.error('Error downloading the file:', error);
        }
    };


    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    return (
        <>
            {/* Document Preview Block */}
            <div onClick={openModal} className="relative overflow-hidden h-40 rounded-lg border border-gray-300 transition-shadow duration-200 group w-[200px] cursor-pointer">
                {isPdf(documentUrl) ? (
                    <div className="flex justify-center items-center h-full w-full group-hover:opacity-90 overflow-y-hidden overflow-x-hidden">
                        <iframe
                            src={documentUrl.split('.pdf')[0]}
                            className="w-full h-full"
                            title="PDF Preview"
                        />
                    </div>
                ) : (
                    <div className="flex justify-center items-center h-full w-full">
                        <Image
                            src={documentUrl}
                            alt='Document preview'
                            className="rounded-md object-cover w-full h-full"
                            height={160}
                            width={160}
                        />
                    </div>
                )}
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-lg"></div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-50">
                    <div className="relative bg-white rounded-lg shadow-lg p-6 w-[80vw] max-w-3xl">
                        {/* Close button */}
                        <button
                            className="absolute top-3 right-3 text-gray-600 hover:text-gray-800 transition-colors"
                            onClick={closeModal}
                        >
                            &#x2715; {/* Close icon */}
                        </button>

                        {/* Document content */}
                        <div className="h-[70vh] overflow-auto">
                            {isPdf(documentUrl) ? (
                                <iframe
                                    src={documentUrl.split('.pdf')[0]}
                                    className="w-full h-full"
                                    title="Full PDF Preview"
                                />
                            ) : (
                                <Image
                                    src={documentUrl}
                                    alt='Full document preview'
                                    className="rounded-md object-cover w-full h-auto"
                                    height={600}
                                    width={600}
                                />
                            )}
                        </div>

                        {/* Download Button */}
                        <div className="mt-4 flex justify-end">
                            <Button
                                
                                onClick={handleDownload}
                            >
                                Download
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default RenderDocument