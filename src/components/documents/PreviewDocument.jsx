import React, { useState } from 'react'
import Image from 'next/image';
import { Button } from '../ui/button';
import { Copy, Share2 } from 'lucide-react';
import { useToast } from '@/components/hooks/use-toast';
import { copyDocumentToClipboard, shareDocument } from '@/utils/documentActions';
import ShareFallbackDialog from './ShareFallbackDialog';

const isPdf = (fileName) => {
    return fileName?.toLowerCase().endsWith('.pdf');
};

const PreviewDocument = ({isOpen, documentUrl, documentName, onClose}) => {
    const { toast } = useToast();
    const [isShareDialogOpen, setShareDialogOpen] = useState(false);
    const [shareableUrl, setShareableUrl] = useState('');

    // Extract filename from documentUrl if documentName is not provided
    const filename = documentName || documentUrl.split('/').pop() || 'document';

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

    const handleCopy = async () => {
        try {
            const result = await copyDocumentToClipboard(documentUrl, filename);
            toast({
                description: result.message,
                variant: result.success ? 'default' : 'destructive'
            });
        } catch (error) {
            console.error('Copy handler error:', error);
            toast({
                description: 'An unexpected error occurred while copying',
                variant: 'destructive'
            });
        }
    };

    const handleShare = async () => {
        try {
            const result = await shareDocument(documentUrl, filename);
            
            if (result.requiresFallback) {
                // Store the shareable URL if available, otherwise use original URL
                setShareableUrl(result.shareableUrl || documentUrl);
                setShareDialogOpen(true);
            } else if (!result.success && result.message) {
                toast({
                    description: result.message,
                    variant: 'destructive'
                });
            }
        } catch (error) {
            console.error('Share handler error:', error);
            toast({
                description: 'An unexpected error occurred while sharing',
                variant: 'destructive'
            });
        }
    };

    if(!isOpen) return null
    return (
        <div className="fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-50">
            <div className="relative bg-white rounded-lg shadow-lg p-6 w-[80vw] max-w-3xl thin-scrollbar">
                {/* Close button */}
                <button
                    className="absolute top-3 right-3 text-gray-600 hover:text-gray-800 transition-colors"
                    onClick={onClose}
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

                {/* Action Buttons */}
                <div className="mt-4 flex justify-end gap-2">
                    <Button
                        variant="outline"
                        onClick={handleCopy}
                        className="flex items-center gap-2"
                    >
                        <Copy size={16} />
                        Copy
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleShare}
                        className="flex items-center gap-2"
                    >
                        <Share2 size={16} />
                        Share
                    </Button>
                    <Button
                        onClick={handleDownload}
                    >
                        Download
                    </Button>
                </div>
            </div>

            {/* Share Fallback Dialog */}
            <ShareFallbackDialog
                isOpen={isShareDialogOpen}
                onClose={() => setShareDialogOpen(false)}
                documentUrl={shareableUrl || documentUrl}
                filename={filename}
            />
        </div>
    )
}

export default PreviewDocument
