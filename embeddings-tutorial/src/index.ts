import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { Vectorize, Ai, VectorizeMatch } from './types';

interface Env {
	VECTORIZE: Vectorize;
	AI: Ai;
}

interface EmbeddingResponse {
	shape: number[];
	data: number[][];
}

interface VectorizeVector {
	id: string;
	values: number[];
	metadata?: Record<string, any>;
}

const app = new Hono<{ Bindings: Env }>();

// Schema for FAQ insertion
const faqSchema = z.object({
	question: z.string().min(1),
	answer: z.string().min(1),
});

// Generate embeddings using Workers AI
async function generateEmbedding(ai: Ai, text: string): Promise<number[]> {
	try {
		const modelResp: EmbeddingResponse = await ai.run('@cf/baai/bge-base-en-v1.5', {
			text: [text],
		});
		return modelResp.data[0];
	} catch (error) {
		throw new Error(`Failed to generate embedding: ${error instanceof Error ? error.message : 'Unknown error'}`);
	}
}

// Insert FAQ endpoint
app.post('/insert', zValidator('json', faqSchema), async (c) => {
	const { question, answer } = await c.req.json();
	
	try {
		// Generate embedding for the question
		const embedding = await generateEmbedding(c.env.AI, question);
		
		// Create unique ID (in production, use UUID or similar)
		const id = Date.now().toString();
		
		// Insert into Vectorize
		const vector: VectorizeVector = {
			id,
			values: embedding,
			metadata: { question, answer }
		};
		
		await c.env.VECTORIZE.upsert([vector]);
		
		return c.json({ success: true, id });
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
		return c.json({ success: false, error: errorMessage }, 500);
	}
});

// Query FAQs endpoint
app.get('/search', async (c) => {
	const query = c.req.query('q');
	
	if (!query) {
		return c.json({ error: 'Query parameter "q" is required' }, 400);
	}
	
	try {
		// Generate embedding for the query
		const queryEmbedding = await generateEmbedding(c.env.AI, decodeURIComponent(query));
		
		// Search for similar vectors with metadata included
		const response = await c.env.VECTORIZE.query(queryEmbedding, {
			topK: 1,
			returnMetadata: true,
		});
		
		if (!response.matches || response.matches.length === 0) {
			return c.json({ matches: [], message: 'No matching FAQs found' });
		}
		
		// Format the response to include metadata
		const formattedMatches = response.matches.map(match => ({
			id: match.id,
			score: match.score,
			question: match.metadata?.question,
			answer: match.metadata?.answer
		}));
		
		return c.json({ matches: formattedMatches });
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
		return c.json({ error: errorMessage }, 500);
	}
});

export default app;