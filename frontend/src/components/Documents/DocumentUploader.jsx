import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { FiUpload, FiFile } from 'react-icons/fi'
import { uploadDocument } from '../../services/documents'

const DocumentUploader = ({ onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [uploadedFiles, setUploadedFiles] = useState([])
  
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
        setUploadedFiles(prev => [...prev, result])
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
              <li key={file.id} className="px-4 py-3 flex items-center">
                <FiFile className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{file.filename}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(file.created_at).toLocaleString()}
                  </p>
                </div>
                <span className={`ml-auto px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  file.processed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {file.processed ? 'Processed' : 'Processing'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default DocumentUploader
