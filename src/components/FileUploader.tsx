'use client'

import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

const FileUploader = ({ onFilesChange }: { onFilesChange: (files: File[]) => void }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFilesChange(acceptedFiles)
    }
  }, [onFilesChange])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    multiple: true
  })

  return (
    <div {...getRootProps()} className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors">
      <input {...getInputProps()} />
      {
        isDragActive ?
          <p className="text-gray-600">Drop the files here ...</p> :
          <p className="text-gray-600">Drag &apos;n&apos; drop files here, or click to select files</p>
      }
    </div>
  )
}

export default FileUploader
