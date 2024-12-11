# FAQ Retrieval System with Cloudflare Workers and Vectorize

This project is a headless API system designed to manage Frequently Asked Questions (FAQs) using vector embeddings for semantic search. Built on Cloudflare’s serverless infrastructure, it leverages Workers AI for embedding generation and Vectorize as a vector database.

Features
	•	Question Matching: Submit a user question to retrieve the most relevant FAQ based on semantic similarity.
	•	Admin FAQ Management: Add new FAQs and store their embeddings in the vector database.
	•	Scalability: Powered by Cloudflare Workers for low-latency responses and global scalability.

## Architecture

![plot](./Architecture.png)


## API Endpoints

### 1. Insert FAQ Entry
Add a new FAQ entry to the vector database.

```bash
curl -X POST "https://faq-vectordb.fupsonline.workers.dev/insert" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What is your return policy?",
    "answer": "You can return items within 30 days."
  }'
```

**Response:**
```json
{
  "success": true,
  "id": "1733915502976"
}
```

### 2. Search FAQs
Search for FAQs using natural language queries.

```bash
curl "https://faq-vectordb.fupsonline.workers.dev/search?q=how%20do%20returns%20work"
```

**Response:**
```json
{
  "matches": [
    {
      "id": "1733915502976",
      "score": 0.8723968,
      "question": "What is your return policy?",
      "answer": "You can return items within 30 days."
    }
  ]
}
```

## Understanding Results

- `score`: Similarity score between 0 and 1 (higher is better)
- `question`: The original FAQ question
- `answer`: The corresponding answer
- `id`: Unique identifier for the FAQ entry

## Example Queries

1. Basic policy questions:
```bash
curl "https://faq-vectordb.fupsonline.workers.dev/search?q=return%20policy"
```

2. Natural language queries:
```bash
curl "https://faq-vectordb.fupsonline.workers.dev/search?q=I%20want%20to%20send%20back%20my%20order"
```

