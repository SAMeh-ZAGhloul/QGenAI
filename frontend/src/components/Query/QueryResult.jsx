import { useState } from 'react'
import ReactMarkdown from 'react-markdown'

const QueryResult = ({ result }) => {
  const [selectedSource, setSelectedSource] = useState(null)
  
  if (!result) {
    return null
  }
  
  // Function to highlight citations in the answer
  const highlightCitations = (text) => {
    // Regular expression to match citations in the format [Document Name - Location]
    const citationRegex = /\[(.*?)\]/g
    
    // Split the text by citations
    const parts = text.split(citationRegex)
    
    // Extract the citations
    const citations = text.match(citationRegex) || []
    
    // Create an array of text and citation elements
    const elements = []
    
    parts.forEach((part, index) => {
      // Add the text part
      if (part) {
        elements.push(<span key={`text-${index}`}>{part}</span>)
      }
      
      // Add the citation if there is one for this part
      if (index < citations.length) {
        const citation = citations[index]
        const sourceName = citation.slice(1, -1) // Remove the brackets
        
        // Find the source in the result.sources array
        const source = result.sources.find(s => 
          `${s.document_name}${s.page_number ? ` - Page ${s.page_number}` : ''}${s.section ? ` - ${s.section}` : ''}` === sourceName
        )
        
        elements.push(
          <span
            key={`citation-${index}`}
            className="citation"
            onClick={() => setSelectedSource(source)}
          >
            {citation}
          </span>
        )
      }
    })
    
    return elements
  }
  
  return (
    <div className="space-y-6">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Answer
          </h3>
          <div className="mt-2 text-sm text-gray-500 whitespace-pre-line">
            <ReactMarkdown>{result.answer}</ReactMarkdown>
          </div>
        </div>
      </div>
      
      {selectedSource && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Source: {selectedSource.document_name}
                {selectedSource.page_number && ` - Page ${selectedSource.page_number}`}
                {selectedSource.section && ` - ${selectedSource.section}`}
              </h3>
              <button
                onClick={() => setSelectedSource(null)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>
            <div className="mt-2 text-sm text-gray-500 whitespace-pre-line">
              {selectedSource.content}
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Sources
          </h3>
          <div className="mt-2">
            <ul className="divide-y divide-gray-200">
              {result.sources.map((source, index) => (
                <li
                  key={index}
                  className="py-3 flex cursor-pointer hover:bg-gray-50"
                  onClick={() => setSelectedSource(source)}
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {source.document_name}
                      {source.page_number && ` - Page ${source.page_number}`}
                      {source.section && ` - ${source.section}`}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {source.content}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QueryResult
