'use client';

import Link from 'next/link';
import React, { useCallback, useEffect, useState } from 'react';
import { FaChevronRight, FaFolderOpen, FaRegIdCard, FaIdCard, FaPassport, FaRegCheckCircle, FaThLarge, FaList } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DriverDocumentUpload from '@/components/documents/DriverDocumentUpload';
import folderIcon from '@/assets/folder-icon.png';
import dynamic from 'next/dynamic';
import { loadingIndicator } from '@/components/ui/LoadingIndicator';
import Image from 'next/image';
import { CloudUpload } from 'lucide-react';
import { motion } from 'framer-motion';

const RecentDocuments = dynamic(() => import('@/components/documents/RecentDocuments'), { ssr: false });

const DriverDocuments = () => {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [modalOpen, setModalOpen] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<string>('');

  const DriverDocArray = [
    { title: 'License', icon: <FaRegIdCard className="text-bottomNavBarColor" size={70} /> },
    { title: 'Aadhar', icon: <FaIdCard className="text-bottomNavBarColor" size={70} /> },
    { title: 'PAN', icon: <FaPassport className="text-bottomNavBarColor" size={70} /> },
    { title: 'Police Verification', icon: <FaRegCheckCircle className="text-bottomNavBarColor" size={70} /> },
    { title: 'Other', icon: <FaFolderOpen className="text-bottomNavBarColor" size={70} /> },
  ];

  useEffect(() => {
    async function fetchDrivers() {
      setLoading(true);
      try {
        const res = await fetch('/api/drivers');
        if (!res.ok) {
          setMessage('Failed to load drivers');
          setDrivers([]);
          return;
        }
        const data = await res.json();
        setDrivers(data.drivers || []);
        setMessage('');
      } catch (error) {
        setMessage('Failed to load drivers');
      } finally {
        setLoading(false);
      }
    }
    fetchDrivers();
  }, []);

  const fetchDocuments = useCallback(async () => {
    if (!type) {
      setDocuments([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/drivers/documents?type=${encodeURIComponent(type)}`);
      if (!res.ok) {
        setMessage('Failed to fetch documents');
        setDocuments([]);
        return;
      }
      const data = await res.json();
      setDocuments(data.documents || []);
      setMessage(data.documents.length === 0 ? 'No documents found' : '');
    } catch (error) {
      setMessage('Failed to fetch documents');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const filteredDrivers = drivers.filter(
    (driver) =>
      driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.contactNumber?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const filteredDocuments = documents.filter(
    (doc) =>
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.contactNumber?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex items-center justify-between mb-4 border-b-2 border-gray-300 pb-2">
        <h1 className="text-2xl font-semibold text-black flex items-center space-x-2">
          <Button variant="link" className="p-0 m-0">
            <Link href={`/user/documents`} className="text-2xl font-semibold hover:underline">
              Docs
            </Link>
          </Button>
          <FaChevronRight className="text-lg text-gray-500" />
          <span>Driver Docs</span>
        </h1>
        <div className="flex items-center space-x-4">
          <Input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 rounded-md border border-gray-300"
          />
          {!type && (
            <Button onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
              {viewMode === 'grid' ? <FaList className="text-xl" /> : <FaThLarge className="text-xl" />}
            </Button>
          )}
          <div className="flex justify-end my-2 fixed right-4 bottom-4">
            <Button onClick={() => setModalOpen(true)} className="rounded-full h-full py-2">
              <CloudUpload size={40} />
            </Button>
          </div>
        </div>
      </div>

      <div className="my-4">
        <h1 className="text-lg font-semibold text-black my-4">Select Document Type</h1>
        <div className="grid grid-cols-5 gap-4">
          {DriverDocArray.map((item, index) => (
            <motion.div
              key={index}
              onClick={() => setType((prev) => (prev === item.title ? '' : item.title))}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.1, boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)' }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="col-span-1 max-h-[200px]"
            >
              <div
                className={`flex flex-col items-center justify-center border border-gray-300 gap-4 bg-[#FBFBFB] rounded-lg p-6 transition-all hover:shadow-md transform hover:scale-105 cursor-pointer ${
                  type === item.title ? 'bg-lightOrange' : ''
                }`}
              >
                {item.icon}
                <h2 className="text-xl font-semibold text-black text-center">{item.title}</h2>
                {/* File count under each document type */}
                {type === item.title && filteredDocuments.length > 0 && (
                  <p className="text-sm text-gray-500">{filteredDocuments.length} files</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {!type ? (
        <div>
          <h1 className="text-lg font-semibold text-black py-4 mt-4">Or Select Driver</h1>
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'flex flex-col space-y-4'}>
            {filteredDrivers.length > 0 ? (
              filteredDrivers.map((driver) => (
                <Link
                  href={{
                    pathname: `/user/documents/driverDocuments/${driver.driver_id}`,
                  }}
                  key={driver.driver_id}
                >
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                    className={`bg-white p-6 rounded-xl hover:shadow-lg border border-gray-300 transition-all duration-300 ease-in-out hover:bg-gray-50 cursor-pointer ${
                      viewMode === 'grid' ? 'h-full flex justify-between items-center space-x-4' : 'flex items-center space-x-6 w-full px-8 py-6'
                    }`}
                  >
                    <div className="flex-shrink-0">
                      <Image
                        src={folderIcon}
                        alt="folder icon"
                        width={48}
                        height={48}
                        className="object-contain"
                        priority
                      />
                    </div>

                    <div className="flex flex-col flex-grow">
                      <span className="font-semibold text-black">{driver.name}</span>
                      <span className="text-gray-500">{driver.contactNumber || 'No Contact Number'}</span>
                      {/* Count of files under each driver folder */}
                      <span className="text-gray-400 text-sm mt-1">{driver.documents?.length || 0} files</span>
                    </div>
                  </motion.div>
                </Link>
              ))
            ) : (
              <span className="text-center col-span-3 text-gray-500">{(loading && loadingIndicator) || message}</span>
            )}
          </div>
        </div>
      ) : (
        <div className="py-4">
          {loading ? (
            <p className="text-center">
              {loadingIndicator} {message}
            </p>
          ) : filteredDocuments.length > 0 ? (
            <RecentDocuments docs={filteredDocuments} />
          ) : (
            <p>No documents found</p>
          )}
        </div>
      )}

      <DriverDocumentUpload open={modalOpen} setOpen={setModalOpen} />
    </div>
  );
};

export default DriverDocuments;
