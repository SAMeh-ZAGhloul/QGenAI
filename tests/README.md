# QGenAI Tests

This directory contains tests for the QGenAI application.

## Test Structure

```
tests/
├── data/                  # Test data files
│   ├── sample_text.txt    # Sample text for testing
│   ├── sample_document.pdf # Sample PDF document for testing
│   └── create_pdf.py      # Script to create PDF from text
├── e2e/                   # End-to-end tests
│   └── test_end_to_end.py # End-to-end test script
└── README.md              # This file
```

## End-to-End Test

The end-to-end test (`test_end_to_end.py`) verifies the complete workflow of the QGenAI application:

1. User Registration: Creates a new user account
2. User Authentication: Logs in and obtains an authentication token
3. Document Upload: Uploads a sample PDF document
4. Document Processing: Waits for the document to be processed
5. Query Processing: Submits queries about the document and receives responses

### Running the Test

To run the end-to-end test:

```bash
# Make sure the backend server is running
cd backend
source venv/bin/activate
python main.py

# In a separate terminal, run the test
cd tests/e2e
python test_end_to_end.py
```

### Test Data

The test uses a sample PDF document created from `sample_text.txt`. The document contains information about QGenAI, its features, and technical details.

### Known Issues

- The test may time out waiting for document processing to complete. This is expected, as document processing can take some time.
- There may be warnings about the Chroma vector store configuration. This is a known issue with the current version of Chroma.

## Adding New Tests

To add new tests:

1. Create a new test file in the appropriate directory
2. Follow the existing test structure
3. Run the test to verify it works correctly

## Future Improvements

- Add unit tests for individual components
- Add integration tests for specific API endpoints
- Add performance tests for the RAG pipeline
- Add more comprehensive test data
