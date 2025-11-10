import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

interface PODViewerProps {
  podUrl: string;
}

const PODViewer: React.FC<PODViewerProps> = ({ podUrl }) => {
  return (
    <div className="mt-6 bg-white p-4 rounded-md border border-lightOrange shadow-lg hover:shadow-lightOrangeButtonColor">
      <h3 className="text-lg font-semibold mb-2">POD </h3>
      <Button variant={'link'}><Link href={podUrl} target='_blank' rel='noopener noreferrer'>View Document</Link></Button>
      <Image src={podUrl} alt='pod' width={200} height={200}/>
    </div>
  );
};

export default PODViewer;
