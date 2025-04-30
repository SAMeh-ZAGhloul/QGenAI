#!/bin/bash

# Set environment variables for Ollama
export LLM_PROVIDER=ollama
export OLLAMA_MODEL=llama2
export OLLAMA_URL=http://localhost:11434

# Run the application
./start.sh
