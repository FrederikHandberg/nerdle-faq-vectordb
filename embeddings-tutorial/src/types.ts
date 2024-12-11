export interface VectorizeMatch {
    id: string;
    score: number;
    values: number[];
    metadata?: {
        question: string;
        answer: string;
    };
}

export interface VectorQueryResponse {
    matches: VectorizeMatch[];
}

export interface VectorQueryOptions {
    topK: number;
    returnMetadata?: boolean;
}

export interface Vectorize {
    query(vector: number[], options: VectorQueryOptions): Promise<VectorQueryResponse>;
    upsert(vectors: { id: string; values: number[]; metadata?: Record<string, any> }[]): Promise<void>;
}

export interface Ai {
    run(model: string, options: { text: string[] }): Promise<{
        shape: number[];
        data: number[][];
    }>;
} 