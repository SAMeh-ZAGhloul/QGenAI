import { useState } from 'react'
import { FiFile, FiTrash2 } from 'react-icons/fi'
import { deleteDocument } from '../../services/documents'

const DocumentList = ({ documents, onDelete }) => {
  const [deletingId, setDeletingId] = useState(null)
  
  const handleDelete = async (id) => {
    try {
      setDeletingId(id)
      await deleteDocument(id)
      onDelete(id)
    } catch (error) {
      console.error('Error deleting document:', error)
    } finally {
      setDeletingId(null)
    }
  }
  
  if (!documents || documents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No documents found. Upload some documents to get started.
      </div>
    )
  }
  
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {documents.map((document) => (
          <li key={document.id}>
            <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
              <div className="flex items-center">
                <FiFile className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-primary-600 truncate">
                    {document.filename}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(document.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  document.processed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {document.processed ? 'Processed' : 'Processing'}
                </span>
                <button
                  onClick={() => handleDelete(document.id)}
                  disabled={deletingId === document.id}
                  className="ml-4 text-red-500 hover:text-red-700 disabled:opacity-50"
                >
                  {deletingId === document.id ? (
                    <span className="text-xs">Deleting...</span>
                  ) : (
                    <FiTrash2 className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default DocumentList
