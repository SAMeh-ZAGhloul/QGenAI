import { useState, useEffect } from 'react'
import { useQuery } from 'react-query'
import QueryForm from '../components/Query/QueryForm'
import QueryResult from '../components/Query/QueryResult'
import QueryHistory from '../components/Query/QueryHistory'
import { submitQuery, getQueries } from '../services/queries'

const QueryInterface = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)
  const [queries, setQueries] = useState([])
  const [selectedQueryId, setSelectedQueryId] = useState(null)
  
  const { data, refetch } = useQuery('queries', getQueries)
  
  useEffect(() => {
    if (data) {
      setQueries(data)
    }
  }, [data])
  
  const handleSubmit = async (queryText) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await submitQuery(queryText)
      setResult(result)
      setSelectedQueryId(null)
      // Refetch queries to update the history
      refetch()
    } catch (error) {
      console.error('Query error:', error)
      setError(error.response?.data?.detail || 'Error processing query')
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleSelectQuery = (query) => {
    setSelectedQueryId(query.id)
    // Format the response as a result
    setResult({
      answer: query.response,
      sources: query.sources.map(source => ({
        document_name: source.document ? source.document.filename : 'Unknown',
        chunk_id: source.chunk_id,
        page_number: null, // We don't have this information in the query history
        section: '',
        content: '' // We don't have the content in the query history
      }))
    })
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Query Your Documents</h1>
        <p className="mt-1 text-sm text-gray-500">
          Ask questions about your documents and get accurate, sourced answers.
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <QueryForm onSubmit={handleSubmit} isLoading={isLoading} />
              
              {error && (
                <div className="mt-4 text-sm text-red-600">
                  {error}
                </div>
              )}
            </div>
          </div>
          
          {result && (
            <QueryResult result={result} />
          )}
        </div>
        
        <div>
          <h2 className="text-lg font-medium text-gray-900">Query History</h2>
          <div className="mt-3">
            <QueryHistory
              queries={queries}
              onSelect={handleSelectQuery}
              selectedId={selectedQueryId}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default QueryInterface
