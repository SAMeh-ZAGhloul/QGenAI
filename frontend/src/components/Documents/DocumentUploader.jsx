import { useCallback, useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { FiUpload, FiFile } from 'react-icons/fi'
import { uploadDocument, getDocumentStatus } from '../../services/documents'

const DocumentUploader = ({ onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [processingFiles, setProcessingFiles] = useState({})

  // Poll for document processing status
  useEffect(() => {
    const processingDocIds = Object.keys(processingFiles)
    if (processingDocIds.length === 0) return

    const pollInterval = setInterval(async () => {
      let allCompleted = true

      for (const docId of processingDocIds) {
        try {
          const status = await getDocumentStatus(docId)

          // Update the processing status
          setProcessingFiles(prev => ({
            ...prev,
            [docId]: {
              ...prev[docId],
              progress: status.processing_progress,
              status: status.processing_status,
              processed: status.processed
            }
          }))

          // Update the uploaded files list
          setUploadedFiles(prev =>
            prev.map(file =>
              file.id === parseInt(docId)
                ? { ...file, processed: status.processed, processing_progress: status.processing_progress, processing_status: status.processing_status }
                : file
            )
          )

          // Check if this file is still processing
          if (!status.processed && status.processing_status !== 'error') {
            allCompleted = false
          }
        } catch (error) {
          console.error(`Error getting status for document ${docId}:`, error)
        }
      }

      // If all documents are processed or errored, stop polling
      if (allCompleted) {
        clearInterval(pollInterval)
        setProcessingFiles({})
      }
    }, 2000) // Poll every 2 seconds

    return () => clearInterval(pollInterval)
  }, [processingFiles])

  const onDrop = useCallback(async (acceptedFiles) => {
    // Only accept PDF and TXT files
    const validFiles = acceptedFiles.filter(
      file => file.type === 'application/pdf' || file.type === 'text/plain'
    )

    if (validFiles.length === 0) {
      setError('Only PDF and TXT files are supported')
      return
    }

    setError(null)
    setUploading(true)

    try {
      // Upload each file
      for (const file of validFiles) {
        const result = await uploadDocument(file)

        // Add to uploaded files
        setUploadedFiles(prev => [...prev, result])

        // Add to processing files to track progress
        setProcessingFiles(prev => ({
          ...prev,
          [result.id]: {
            filename: result.filename,
            progress: result.processing_progress || 0,
            status: result.processing_status || 'pending',
            processed: result.processed
          }
        }))

        if (onUploadSuccess) {
          onUploadSuccess(result)
        }
      }
    } catch (error) {
      console.error('Error uploading document:', error)
      setError(error.response?.data?.detail || 'Error uploading document')
    } finally {
      setUploading(false)
    }
  }, [onUploadSuccess])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt']
    },
    disabled: uploading,
    maxFiles: 5,
  })

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'
        } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-2">
          <FiUpload className="h-10 w-10 text-gray-400" />
          <p className="text-lg font-medium text-gray-700">
            {isDragActive
              ? 'Drop the files here...'
              : 'Drag & drop files here, or click to select files'}
          </p>
          <p className="text-sm text-gray-500">
            Only PDF and TXT files are supported
          </p>
          {uploading && <p className="text-sm text-primary-600">Uploading...</p>}
        </div>
      </div>

      {error && (
        <div className="text-red-500 text-sm mt-2">
          {error}
        </div>
      )}

      {uploadedFiles.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-medium text-gray-900">Uploaded Files</h3>
          <ul className="mt-2 divide-y divide-gray-200 border rounded-md">
            {uploadedFiles.map((file) => (
              <li key={file.id} className="px-4 py-3">
                <div className="flex items-center">
                  <FiFile className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.filename}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(file.created_at).toLocaleString()}
                    </p>
                  </div>
                  <span className={`ml-auto px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    file.processed ? 'bg-green-100 text-green-800' :
                    file.processing_status === 'error' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {file.processed ? 'Processed' :
                     file.processing_status === 'error' ? 'Error' :
                     file.processing_status === 'processing' ? 'Processing' : 'Pending'}
                  </span>
                </div>

                {/* Progress bar */}
                {!file.processed && file.processing_status !== 'error' && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-primary-600 h-2.5 rounded-full"
                        style={{ width: `${file.processing_progress || 0}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 text-right">
                      {file.processing_progress || 0}% complete
                    </p>
                  </div>
                )}

                {/* Error message */}
                {file.processing_status === 'error' && (
                  <p className="text-xs text-red-500 mt-1">
                    There was an error processing this document. Please try uploading it again.
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default DocumentUploader
