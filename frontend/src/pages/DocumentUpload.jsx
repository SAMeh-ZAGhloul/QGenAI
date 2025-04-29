import { useState, useEffect } from 'react'
import { useQuery } from 'react-query'
import DocumentUploader from '../components/Documents/DocumentUploader'
import DocumentList from '../components/Documents/DocumentList'
import { getDocuments } from '../services/documents'

const DocumentUpload = () => {
  const [documents, setDocuments] = useState([])
  
  const { data, isLoading, refetch } = useQuery('documents', getDocuments)
  
  useEffect(() => {
    if (data) {
      setDocuments(data)
    }
  }, [data])
  
  const handleUploadSuccess = (document) => {
    // Add the new document to the list
    setDocuments([document, ...documents])
    // Refetch the documents to get the updated list
    refetch()
  }
  
  const handleDocumentDelete = (id) => {
    setDocuments(documents.filter(doc => doc.id !== id))
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Upload Documents</h1>
        <p className="mt-1 text-sm text-gray-500">
          Upload your documents to make them searchable. We support PDF and TXT files.
        </p>
      </div>
      
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <DocumentUploader onUploadSuccess={handleUploadSuccess} />
        </div>
      </div>
      
      <div>
        <h2 className="text-lg font-medium text-gray-900">Your Documents</h2>
        <div className="mt-3">
          {isLoading ? (
            <div className="text-center py-4 text-gray-500">Loading documents...</div>
          ) : (
            <DocumentList
              documents={documents}
              onDelete={handleDocumentDelete}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default DocumentUpload
