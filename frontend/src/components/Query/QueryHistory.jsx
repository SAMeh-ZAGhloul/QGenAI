import { FiClock } from 'react-icons/fi'

const QueryHistory = ({ queries, onSelect, selectedId }) => {
  if (!queries || queries.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No previous queries found.
      </div>
    )
  }
  
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {queries.map((query) => (
          <li
            key={query.id}
            className={`cursor-pointer hover:bg-gray-50 ${
              selectedId === query.id ? 'bg-primary-50' : ''
            }`}
            onClick={() => onSelect(query)}
          >
            <div className="px-4 py-4 sm:px-6">
              <div className="flex items-center">
                <FiClock className="h-5 w-5 text-gray-400 mr-3" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-primary-600 truncate">
                    {query.query_text}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(query.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default QueryHistory
