import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import { FiUpload, FiSearch, FiFileText } from 'react-icons/fi'
import DocumentList from '../components/Documents/DocumentList'
import { getDocuments } from '../services/documents'
import { getQueries } from '../services/queries'

const Dashboard = () => {
  const [documents, setDocuments] = useState([])
  const [queries, setQueries] = useState([])
  
  const { data: documentsData, isLoading: isLoadingDocuments } = useQuery(
    'documents',
    getDocuments
  )
  
  const { data: queriesData, isLoading: isLoadingQueries } = useQuery(
    'queries',
    getQueries
  )
  
  useEffect(() => {
    if (documentsData) {
      setDocuments(documentsData)
    }
  }, [documentsData])
  
  useEffect(() => {
    if (queriesData) {
      setQueries(queriesData)
    }
  }, [queriesData])
  
  const handleDocumentDelete = (id) => {
    setDocuments(documents.filter(doc => doc.id !== id))
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome to Knowledge Navigator. Upload documents and ask questions to get started.
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                <FiFileText className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Documents
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {isLoadingDocuments ? '...' : documents.length}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/upload" className="font-medium text-primary-600 hover:text-primary-500">
                Upload documents
              </Link>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                <FiSearch className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Queries
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {isLoadingQueries ? '...' : queries.length}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/query" className="font-medium text-primary-600 hover:text-primary-500">
                Ask a question
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <h2 className="text-lg font-medium text-gray-900">Recent Documents</h2>
        <div className="mt-3">
          {isLoadingDocuments ? (
            <div className="text-center py-4 text-gray-500">Loading documents...</div>
          ) : (
            <DocumentList
              documents={documents.slice(0, 5)}
              onDelete={handleDocumentDelete}
            />
          )}
        </div>
        {documents.length > 5 && (
          <div className="mt-4 text-right">
            <Link to="/documents" className="text-sm font-medium text-primary-600 hover:text-primary-500">
              View all documents
            </Link>
          </div>
        )}
      </div>
      
      {documents.length === 0 && !isLoadingDocuments && (
        <div className="text-center py-8">
          <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by uploading a document.
          </p>
          <div className="mt-6">
            <Link
              to="/upload"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <FiUpload className="-ml-1 mr-2 h-5 w-5" />
              Upload Document
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
