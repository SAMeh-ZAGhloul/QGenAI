import { useState } from 'react'
import { FiSearch } from 'react-icons/fi'

const QueryForm = ({ onSubmit, isLoading }) => {
  const [queryText, setQueryText] = useState('')
  
  const handleSubmit = (e) => {
    e.preventDefault()
    if (queryText.trim()) {
      onSubmit(queryText)
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="query" className="block text-sm font-medium text-gray-700">
          Ask a question about your documents
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <input
            type="text"
            id="query"
            className="focus:ring-primary-500 focus:border-primary-500 block w-full pr-10 sm:text-sm border-gray-300 rounded-md"
            placeholder="e.g., What is the company's refund policy?"
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            disabled={isLoading}
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <FiSearch className="h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>
      <button
        type="submit"
        disabled={isLoading || !queryText.trim()}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
      >
        {isLoading ? 'Searching...' : 'Search'}
      </button>
    </form>
  )
}

export default QueryForm
