'use client'
import React, { useState } from 'react'
import RenderDocument from '../RenderDocument'
import { usePathname } from 'next/navigation'
import { Button } from '../ui/button'
import { EllipsisVertical, Eye, Download, FolderInput, X, Copy, Share2 } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Image from 'next/image'
import { useToast } from '../hooks/use-toast'
import { Dialog, DialogContent } from "@/components/ui/dialog"
import TripDocumentUpload from './TripDocumentUpload'
import TruckDocumentUpload from './TruckDocumentUpload'
import DriverDocumentUpload from './DriverDocumentUpload'
import ShareFallbackDialog from './ShareFallbackDialog'
import { copyDocumentToClipboard, shareDocument } from '@/utils/documentActions'
import PreviewDocument from './PreviewDocument'

const isPdf = (fileName) => {
    return fileName?.toLowerCase().endsWith('.pdf');
};

const RecentDocuments = ({ docs, setDocs }) => {
    const isOtherpage = usePathname() === '/user/documents/otherDocuments'
    const [isModalOpen, setModalOpen] = useState(false)
    const [documentUrl, setDocumentUrl] = useState('')
    const [documentName, setDocumentName] = useState('')
    const [isMoveToTripModalOpen, setMoveToTripModalOpen] = useState(false)
    const [isMoveToTruckModalOpen, setMoveToTruckModalOpen] = useState(false)
    const [isMoveToDriverModalOpen, setMoveToDriverModalOpen] = useState(false)
    const [isMoveToCompanyModalOpen, setMoveToCompanyModalOpen] = useState(false)
    const [selectedDocId, setSelectedDocId] = useState('')
    const [isShareDialogOpen, setShareDialogOpen] = useState(false)
    const [shareDocumentData, setShareDocumentData] = useState(null)
    const { toast } = useToast()

    const handlePreview = (url, filename) => {
        setDocumentUrl(url)
        setDocumentName(filename)
        setModalOpen(true)
    }

    const handleMoveToTripDocument = (id) => {
        setSelectedDocId(id)
        setMoveToTripModalOpen(true)
    }
    const handleMoveToTruckDocument = (id) => {
        setSelectedDocId(id)
        setMoveToTruckModalOpen(true)
    }
    const handleMoveToDriverDocument = (id) => {
        setSelectedDocId(id)
        setMoveToDriverModalOpen(true)
    }
    const handleMoveToCompanyDocument = (id) => {
        setSelectedDocId(id)
        setMoveToCompanyModalOpen(true)
    }

    const handleDownload = async (documentUrl) => {
        try {
            const response = await fetch(documentUrl.split('.pdf')[0]);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.setAttribute('download', documentUrl.split('/').pop() || 'file');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            toast({
                description: 'Failed to download document',
                variant: 'destructive'
            })
            console.error('Error downloading the file:', error);
        }
    };

    const handleMove = (docId, destination) => {
        // Implement the logic to move the document
        console.log(`Moving document ${docId} to ${destination}`)
    }

    const handleCopy = async (documentUrl, filename) => {
        try {
            const result = await copyDocumentToClipboard(documentUrl, filename)
            toast({
                description: result.message,
                variant: result.success ? 'default' : 'destructive'
            })
        } catch (error) {
            console.error('Copy handler error:', error)
            toast({
                description: 'An unexpected error occurred while copying',
                variant: 'destructive'
            })
        }
    }

    const handleShare = async (documentUrl, filename) => {
        try {
            const result = await shareDocument(documentUrl, filename)
            
            if (result.requiresFallback) {
                // Use the shareable URL if available, otherwise use original URL
                const urlToShare = result.shareableUrl || documentUrl
                setShareDocumentData({ url: urlToShare, filename })
                setShareDialogOpen(true)
            } else if (!result.success && result.message) {
                toast({
                    description: result.message,
                    variant: 'destructive'
                })
            }
        } catch (error) {
            console.error('Share handler error:', error)
            toast({
                description: 'An unexpected error occurred while sharing',
                variant: 'destructive'
            })
        }
    }

    return (
        <div className="py-2 px-1 rounded-lg shadow-sm border-2 border-gray-300">
            <table className="min-w-full table-auto border-collapse border border-gray-200 rounded-xl">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Name</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Type</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Date Uploaded</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Validity Date</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600"></th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                    {docs?.map((doc, index) => (
                        doc.url &&
                        <tr key={index} className="hover:bg-gray-50">
                            <td className="py-2 px-3 border-b border-gray-200 text-sm">
                                <div className="flex items-center space-x-3">
                                    <div className="flex-shrink-0"><RenderDocument documentUrl={doc.url} /></div>
                                    <div className="flex flex-col space-y-1 max-w-md">
                                        <p className="font-semibold text-gray-800">{doc.filename}</p>
                                        {doc.trip_id && (
                                            <div className="text-xs text-gray-600">
                                                <p><span className="font-medium">LR:</span> {doc.LR}</p>
                                                <p><span className="font-medium">Truck:</span> {doc.truck}</p>
                                                <p><span className="font-medium">Route:</span> {doc.route.origin} &rarr; {doc.route.destination}</p>
                                                <p><span className="font-medium">Start Date:</span> {new Date(doc.startDate).toLocaleDateString()}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </td>
                            <td className="py-2 px-3 text-sm text-gray-500 border-b border-gray-200">{doc.type}</td>
                            <td className="py-2 px-3 text-sm text-gray-500 border-b border-gray-200">{new Date(doc.uploadedDate).toLocaleDateString('en-IN')}</td>
                            <td className="py-2 px-3 text-sm text-gray-500 border-b border-gray-200">
                                {doc.validityDate ? new Date(doc.validityDate).toLocaleDateString('en-IN') : 'NA'}
                            </td>
                            <td className="py-2 px-3 text-sm text-gray-500 border-b border-gray-200">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Open menu</span>
                                            <EllipsisVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => handlePreview(doc.url, doc.filename)}>
                                            <Eye className="mr-2 h-4 w-4" />
                                            <span>Preview</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleDownload(doc.url)}>
                                            <Download className="mr-2 h-4 w-4" />
                                            <span>Download</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleCopy(doc.url, doc.filename)}>
                                            <Copy className="mr-2 h-4 w-4" />
                                            <span>Copy</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleShare(doc.url, doc.filename)}>
                                            <Share2 className="mr-2 h-4 w-4" />
                                            <span>Share</span>
                                        </DropdownMenuItem>
                                        {isOtherpage && (
                                            <>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuLabel>Move to</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => handleMoveToTripDocument(doc._id)}>
                                                    <FolderInput className="mr-2 h-4 w-4" />
                                                    <span>Trip Document</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleMoveToCompanyDocument(doc._id)}>
                                                    <FolderInput className="mr-2 h-4 w-4" />
                                                    <span>Company Document</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleMoveToDriverDocument(doc._id)}>
                                                    <FolderInput className="mr-2 h-4 w-4" />
                                                    <span>Driver Document</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleMoveToTruckDocument(doc._id)}>
                                                    <FolderInput className="mr-2 h-4 w-4" />
                                                    <span>Lorry Document</span>
                                                </DropdownMenuItem>
                                            </>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <PreviewDocument
                isOpen={isModalOpen}
                documentUrl={documentUrl}
                documentName={documentName}
                onClose={() => setModalOpen(false)}
            />

            <Dialog open={isMoveToTripModalOpen} onOpenChange={setMoveToTripModalOpen}>
                <DialogContent className='p-0'>
                    <TripDocumentUpload open={isMoveToTripModalOpen} setOpen={setMoveToTripModalOpen} documentId={selectedDocId} setDocuments={setDocs} />
                </DialogContent>
            </Dialog>

            <Dialog open={isMoveToTruckModalOpen} onOpenChange={setMoveToTruckModalOpen}>
                <DialogContent className='p-0'>
                    <TruckDocumentUpload open={isMoveToTruckModalOpen} setOpen={setMoveToTruckModalOpen} documentId={selectedDocId} setDocuments={setDocs} />
                </DialogContent>
            </Dialog>

            <Dialog open={isMoveToDriverModalOpen} onOpenChange={setMoveToDriverModalOpen}>
                <DialogContent className='p-0'>
                    <DriverDocumentUpload open={isMoveToDriverModalOpen} setOpen={setMoveToDriverModalOpen} documentId={selectedDocId} setDocuments={setDocs} />
                </DialogContent>
            </Dialog>

            {shareDocumentData && (
                <ShareFallbackDialog
                    isOpen={isShareDialogOpen}
                    onClose={() => {
                        setShareDialogOpen(false)
                        setShareDocumentData(null)
                    }}
                    documentUrl={shareDocumentData.url}
                    filename={shareDocumentData.filename}
                />
            )}

        </div>
    )
}

export default RecentDocuments
