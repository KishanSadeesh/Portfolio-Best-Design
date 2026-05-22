# AWS Amplify + Lambda Gemini RAG Deployment

## Frontend: Amplify Hosting

1. Push this repo to GitHub.
2. In AWS Amplify Hosting, connect the repo and use the included `amplify.yml`.
3. Add this environment variable in Amplify:
   - `VITE_CHAT_API_URL=https://YOUR_API_ENDPOINT/api/chat`

## Backend: Lambda

Create a Node.js 20 Lambda using `backend/lambda.js` as the handler module:

```txt
backend/lambda.handler
```

Set Lambda environment variables:

```txt
GEMINI_API_KEY=your_real_gemini_key
GEMINI_MODEL=gemini-1.5-flash
ALLOWED_ORIGIN=https://your-amplify-domain.amplifyapp.com
```

Optional S3 knowledge base:

```txt
KNOWLEDGE_BUCKET=your-bucket-name
KNOWLEDGE_KEY=portfolio-knowledge.json
```

If `KNOWLEDGE_BUCKET` is not set, the Lambda bundle uses `data/portfolio-knowledge.json`.

Optional lead capture with DynamoDB:

```txt
CHAT_LEADS_TABLE=PortfolioChatLeads
```

If this is set, give the Lambda IAM role `dynamodb:PutItem` permission for that table. If it is not set, `saveChatLeadTool` still runs but returns a skipped status.

## API Endpoint

Use either API Gateway HTTP API or a Lambda Function URL. The endpoint must accept:

```http
POST /api/chat
Content-Type: application/json

{ "message": "Which role is suitable for Kishan?" }
```

Expected response:

```json
{
  "answer": "grounded answer text",
  "mode": "general_portfolio_qa | role_recommendation | job_description_match",
  "agentic": true,
  "toolsUsed": [
    "retrievePortfolioEvidenceTool",
    "recommendRoleTool",
    "generateRecruiterSummaryTool",
    "saveChatLeadTool"
  ],
  "sources": []
}
```

## Local Development

```bash
cp .env.example .env
npm run dev
```

The Vite dev server proxies `/api/chat` to the local Express server on port `5000`.
