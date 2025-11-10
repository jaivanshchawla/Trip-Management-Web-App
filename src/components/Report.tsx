'use client'
import { AnimatePresence } from 'framer-motion'
import React, { useState } from 'react'
import { Button } from './ui/button'
import { Loader2, X } from 'lucide-react'
import 'jspdf/dist/polyfills.es.js';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

type props = {
    reportContent: string,
    setModalOpen: (isOpen: boolean) => void,
    reportRef : any,
    month : string,
    year : string
}

const Report: React.FC<props> = ({reportContent, setModalOpen, reportRef, month, year}) => {
    
  const [pdfDownloading, setPDFDownloading] = useState<boolean>(false);
    const handleDownloadPDF = async () => {
        try {
          const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
          });
          if (reportRef.current) {
            setPDFDownloading(true);
            const canvas = await html2canvas(reportRef.current, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
    
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    
            const imgX = (pdfWidth - imgWidth * ratio) / 2;
            const imgY = (pdfHeight - imgHeight * ratio) / 2;
    
            pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
    
          }
          pdf.save(`Report-${month}-${year}.pdf`);
          setPDFDownloading(false);
        } catch (error) {
          alert('Failed to download pdf')
        }
      };
  return (
    <AnimatePresence mode="wait">
            <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50 overflow-hidden">
              <div className="bg-white max-w-4xl max-h-[700px] w-full p-6 rounded-lg shadow-lg overflow-auto thin-scrollbar">
                <div className="flex justify-between">
                  <h3 className="text-lg font-semibold mb-4">Generated Report</h3>
                  <Button variant='ghost' size='icon' onClick={() => setModalOpen(false)}><X /></Button>
                </div>

                <div id="report" ref={reportRef}
                  className="overflow-auto border border-gray-300 rounded-md p-4 thin-scrollbar"
                  dangerouslySetInnerHTML={{ __html: reportContent }}
                />
                <Button disabled={pdfDownloading} className="mt-4 w-full" onClick={handleDownloadPDF}>
                  {pdfDownloading ? <Loader2 className="text-white animate-spin" /> : "Download as PDF"}
                </Button>

              </div>
            </div>
          </AnimatePresence>
  )
}

export default Report