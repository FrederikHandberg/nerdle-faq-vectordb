<FAQSystemSetupAndImplementation>
    <Setup>
        <Description>
            This section outlines the required steps and configurations before implementing 
            the FAQ vector search system using Cloudflare Workers, Workers AI, and Vectorize.
        </Description>
        <Requirements>
            - Cloudflare account  
            - Node.js version 16.17.0 or later  
            - npm/yarn/pnpm  
            - wrangler CLI version 3.71.0 or later  
        </Requirements>
        <Steps>
            <Step index="1">
                Create a Vectorize index with the following parameters:
                - Dimensions: 768 (required for the bge-base-en-v1.5 model)
                - Metric: cosine  
                Make sure to add a binding in your `wrangler.toml` for `VECTORIZE`.
                
                Example (wrangler.toml):
                ```toml
                [vars]
                VECTORIZE = "<your_vectorize_binding>"

                [env.staging]
                VECTORIZE = "<your_staging_vectorize_binding>"
                ```
            </Step>
            <Step index="2">
                Configure Workers AI:
                - Add an AI binding in `wrangler.toml`.
                - Use `@cf/baai/bge-base-en-v1.5` for embeddings.
                
                Example (wrangler.toml):
                ```toml
                [vars]
                AI = "<your_workers_ai_binding>"
                ```

                Confirm that Workers AI is accessible and that you have the necessary credentials and bindings.
            </Step>
            <Step index="3">
                Prepare your environment:
                - Install dependencies: `npm install hono`
                - Ensure `wrangler.toml` is properly configured with `main` entry point, compatibility date, and bindings.
                - For local development: `wrangler dev`
            </Step>
        </Steps>
    </Setup>

    <Implementation>
        <Description>
            This section covers the technical implementation details: defining types, handling FAQ insertions, 
            generating embeddings, and querying for the most similar FAQs.
        </Description>

        <Types>
            ```typescript
            interface Env {
                VECTORIZE: Vectorize; // Binding to your Vectorize instance
                AI: Ai;               // Binding to Workers AI
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
            ```
        </Types>

        <CoreFunctionality>
            <Step index="1">
                **FAQ Storage Flow**:
                - A user (admin) sends a POST request to `/insert` with `question` and `answer`.
                - The system generates an embedding for `question` using Workers AI.
                - The system inserts a new vector into Vectorize with a unique ID, embedding values, and metadata containing `question` and `answer`.
            </Step>

            <Step index="2">
                **Query Processing**:
                - A user sends a GET request to `/` with a `query` parameter.
                - The system converts the `query` into an embedding using Workers AI.
                - It then performs a similarity search against Vectorize, retrieving the top K most similar FAQs.
                - The most similar FAQ (or FAQs) is returned to the user.
            </Step>

            <Step index="3">
                **API Endpoints**:
                - `POST /insert`  
                  **Usage**: Insert a new FAQ.  
                  **Request Body**: `{ "question": "Your FAQ question", "answer": "Your FAQ answer" }`  
                  **Response**: A success message with the inserted vector’s ID or an error message.
                
                - `GET /`  
                  **Usage**: Query FAQs by `?query=...`  
                  **Response**: Returns the most similar FAQ(s) as a JSON array, including question and answer.
                
                **Error Handling**:
                - If `query` param is missing or empty, return a 400 Bad Request.
                - If embeddings or vector queries fail, return a 500 Internal Server Error.
            </Step>
        </CoreFunctionality>
    </Implementation>

    <Deployment>
        <Description>
            Steps to deploy and test your FAQ system on Cloudflare Workers.
        </Description>
        <Steps>
            <Step index="1">
                Login with Wrangler: `wrangler login`
            </Step>
            <Step index="2">
                Deploy using Wrangler: `wrangler deploy`
            </Step>
            <Step index="3">
                Test the endpoints:
                - To insert a FAQ:  
                  `curl -X POST "<your-worker-url>/insert" -H "Content-Type: application/json" -d '{"question":"What is your return policy?","answer":"You can return any item within 30 days."}'`
                  
                  Check the response for a success message and the vector ID.
                
                - To query FAQs:  
                  `curl "<your-worker-url>/?query=return policy"`  
                  Expect to receive the most similar FAQ with its answer.
            </Step>
        </Steps>
    </Deployment>
</FAQSystemSetupAndImplementation>