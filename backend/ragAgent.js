import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOCAL_KNOWLEDGE_PATH = path.resolve(__dirname, '..', 'data', 'portfolio-knowledge.json');

let cachedKnowledge = null;
let cachedDynamoClient = null;

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'but', 'by', 'for', 'from', 'has',
  'have', 'he', 'i', 'in', 'is', 'it', 'its', 'me', 'my', 'of', 'on', 'or',
  'our', 'that', 'the', 'this', 'to', 'was', 'we', 'what', 'which', 'who',
  'with', 'you', 'your'
]);

const ROLE_KEYWORDS = {
  'Backend Developer': ['backend', 'api', 'rest', 'node', 'fastapi', 'lambda', 'server', 'webhook'],
  'Cloud Serverless Developer': ['aws', 'lambda', 'api gateway', 'serverless', 'dynamodb', 'cloud', 'deployment'],
  'AI Application Developer': ['ai', 'llm', 'agent', 'gemini', 'groq', 'langchain', 'chatbot', 'rag'],
  'Computer Vision Engineer': ['computer vision', 'cnn', 'image', 'sobel', 'attention', 'damage', 'detection'],
  'IoT / Edge AI Engineer': ['iot', 'esp32', 'nodemcu', 'mpu6050', 'sensor', 'firebase', 'edge', 'wearable'],
  'Full-Stack React Developer': ['react', 'javascript', 'frontend', 'full stack', 'ui', 'api']
};

const SKILL_KEYWORDS = [
  'aws', 'lambda', 'api gateway', 'dynamodb', 'serverless', 'react', 'javascript',
  'node', 'fastapi', 'python', 'java', 'sql', 'firebase', 'flutter', 'iot',
  'esp32', 'nodemcu', 'tensorflow lite', 'computer vision', 'cnn', 'leaflet',
  'rest api', 'webhook', 'langchain', 'groq', 'gemini', 'rag'
];

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'content-type': 'application/json',
      'access-control-allow-origin': process.env.ALLOWED_ORIGIN || '*',
      'access-control-allow-methods': 'POST,OPTIONS',
      'access-control-allow-headers': 'content-type'
    },
    body: JSON.stringify(body)
  };
}

async function streamToString(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString('utf-8');
}

async function loadKnowledge() {
  if (cachedKnowledge) return cachedKnowledge;

  const bucket = process.env.KNOWLEDGE_BUCKET;
  const key = process.env.KNOWLEDGE_KEY || 'portfolio-knowledge.json';

  if (bucket) {
    const client = new S3Client({ region: process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'us-east-1' });
    const response = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    cachedKnowledge = JSON.parse(await streamToString(response.Body));
    return cachedKnowledge;
  }

  cachedKnowledge = JSON.parse(await fs.readFile(LOCAL_KNOWLEDGE_PATH, 'utf-8'));
  return cachedKnowledge;
}

function tokenize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/[^a-z0-9+#.]+/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}

function classifyMessage(message) {
  const text = message.toLowerCase();
  const looksLikeJobDescription =
    text.length > 250 ||
    /responsibilit|requirement|qualification|job description|we are hiring|candidate|minimum|preferred/.test(text);

  if (looksLikeJobDescription) return 'job_description_match';
  if (/role|position|suitable|fit|career|apply|job/.test(text)) return 'role_recommendation';
  return 'general_portfolio_qa';
}

function scoreChunk(chunk, queryTokens, queryText, mode) {
  const haystack = `${chunk.title} ${chunk.type} ${(chunk.tags || []).join(' ')} ${chunk.content}`.toLowerCase();
  let score = 0;

  queryTokens.forEach((token) => {
    if (haystack.includes(token)) score += 1;
    if ((chunk.tags || []).some((tag) => tag.toLowerCase().includes(token))) score += 2;
    if (chunk.title.toLowerCase().includes(token)) score += 2;
  });

  if (mode === 'job_description_match' && ['skills', 'project', 'experience', 'role-fit'].includes(chunk.type)) score += 4;
  if (mode === 'role_recommendation' && ['skills', 'project', 'experience', 'role-fit'].includes(chunk.type)) score += 3;
  if (mode === 'general_portfolio_qa' && queryText.includes(chunk.type)) score += 2;

  return score;
}

function retrieveRelevantChunks(knowledge, message, mode, limit = 6) {
  const queryTokens = tokenize(message);
  const queryText = message.toLowerCase();

  return knowledge
    .map((chunk) => ({ ...chunk, score: scoreChunk(chunk, queryTokens, queryText, mode) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .filter((chunk) => chunk.score > 0);
}

function rankRoles(message, chunks) {
  const text = `${message} ${chunks.map((chunk) => `${chunk.title} ${chunk.content}`).join(' ')}`.toLowerCase();

  return Object.entries(ROLE_KEYWORDS)
    .map(([role, keywords]) => ({
      role,
      score: keywords.reduce((total, keyword) => total + (text.includes(keyword) ? 1 : 0), 0)
    }))
    .sort((a, b) => b.score - a.score);
}

export async function retrievePortfolioEvidenceTool({ message, mode, limit = 6 }) {
  const knowledge = await loadKnowledge();
  const chunks = retrieveRelevantChunks(knowledge, message, mode, limit);

  return {
    tool: 'retrievePortfolioEvidenceTool',
    evidence: chunks,
    sources: chunks.map(({ id, title, type }) => ({ id, title, type }))
  };
}

export function analyzeJobDescriptionTool({ message }) {
  const text = message.toLowerCase();
  const requiredSkills = SKILL_KEYWORDS.filter((skill) => text.includes(skill));
  const seniority =
    /senior|lead|principal|architect/.test(text) ? 'senior' :
    /intern|trainee|entry|junior|fresher/.test(text) ? 'entry-level' :
    'mid-level or unspecified';

  const responsibilities = [];
  if (/api|backend|server|microservice/.test(text)) responsibilities.push('backend API development');
  if (/aws|lambda|cloud|serverless/.test(text)) responsibilities.push('cloud/serverless development');
  if (/react|frontend|ui/.test(text)) responsibilities.push('React/frontend development');
  if (/ai|llm|rag|machine learning|computer vision/.test(text)) responsibilities.push('AI/ML application work');
  if (/iot|sensor|embedded|esp32|nodemcu/.test(text)) responsibilities.push('IoT/embedded integration');

  return {
    tool: 'analyzeJobDescriptionTool',
    isJobDescription: classifyMessage(message) === 'job_description_match',
    seniority,
    requiredSkills,
    responsibilities,
    rawLength: message.length
  };
}

export function recommendRoleTool({ message, evidence }) {
  const rankedRoles = rankRoles(message, evidence);
  const recommendedRoles = rankedRoles
    .filter((role) => role.score > 0)
    .slice(0, 4)
    .map((role) => ({
      ...role,
      reason: `${role.role} matches ${role.score} portfolio/job signal${role.score === 1 ? '' : 's'}.`
    }));

  return {
    tool: 'recommendRoleTool',
    recommendedRoles: recommendedRoles.length > 0
      ? recommendedRoles
      : [
          { role: 'Backend Developer', score: 3, reason: 'Strong REST API, AWS Lambda, and backend project evidence.' },
          { role: 'Cloud Serverless Developer', score: 3, reason: 'Portfolio shows AWS Lambda, API Gateway, and DynamoDB exposure.' },
          { role: 'AI Application Developer', score: 2, reason: 'Portfolio includes applied AI agent and LLM integration projects.' }
        ]
  };
}

export function calculateMatchScoreTool({ jobAnalysis, roleRecommendation, evidence }) {
  const portfolioText = evidence.map((chunk) => `${chunk.title} ${(chunk.tags || []).join(' ')} ${chunk.content}`).join(' ').toLowerCase();
  const matchedSkills = jobAnalysis.requiredSkills.filter((skill) => portfolioText.includes(skill));
  const missingSkills = jobAnalysis.requiredSkills.filter((skill) => !portfolioText.includes(skill));
  const skillRatio = jobAnalysis.requiredSkills.length === 0 ? 0.65 : matchedSkills.length / jobAnalysis.requiredSkills.length;
  const roleBoost = Math.min(0.2, (roleRecommendation.recommendedRoles[0]?.score || 0) / 30);
  const evidenceBoost = Math.min(0.15, evidence.length / 40);
  const score = Math.round(Math.min(96, Math.max(35, (skillRatio + roleBoost + evidenceBoost) * 100)));
  const verdict = score >= 75 ? 'Good fit' : score >= 55 ? 'Partial fit' : 'Not ideal';

  return {
    tool: 'calculateMatchScoreTool',
    verdict,
    score,
    matchedSkills,
    missingSkills,
    strongMatches: matchedSkills.length > 0
      ? matchedSkills
      : roleRecommendation.recommendedRoles.slice(0, 3).map((role) => role.role)
  };
}

export function generateRecruiterSummaryTool({ mode, evidence, roleRecommendation, matchScore }) {
  const bestRole = roleRecommendation?.recommendedRoles?.[0]?.role || 'Backend / Cloud Developer';
  const evidenceTitles = evidence.slice(0, 4).map((chunk) => chunk.title);

  if (mode === 'job_description_match') {
    return {
      tool: 'generateRecruiterSummaryTool',
      summary: `Kishan is a ${matchScore.verdict.toLowerCase()} for this role, especially when the position values ${bestRole.toLowerCase()} skills, serverless APIs, React, applied AI, and IoT/edge-AI project experience.`
    };
  }

  if (mode === 'role_recommendation') {
    return {
      tool: 'generateRecruiterSummaryTool',
      summary: `The strongest role angle is ${bestRole}, backed by evidence from ${evidenceTitles.join(', ') || 'the portfolio knowledge base'}.`
    };
  }

  return {
    tool: 'generateRecruiterSummaryTool',
    summary: `Answer using grounded portfolio evidence from ${evidenceTitles.join(', ') || 'the knowledge base'}.`
  };
}

function extractLead(message) {
  const email = message.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0];
  const phone = message.match(/(?:\+?\d[\d\s().-]{7,}\d)/)?.[0];
  const looksLikeLead = Boolean(email || phone || /hire|recruiter|interview|contact|call me|reach me/.test(message.toLowerCase()));

  if (!looksLikeLead) return null;

  return {
    email,
    phone,
    message: message.slice(0, 2000)
  };
}

function getDynamoClient() {
  if (!cachedDynamoClient) {
    cachedDynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'us-east-1' });
  }
  return cachedDynamoClient;
}

export async function saveChatLeadTool({ message, mode, summary }) {
  const lead = extractLead(message);

  if (!lead) {
    return {
      tool: 'saveChatLeadTool',
      saved: false,
      reason: 'No lead/contact intent detected.'
    };
  }

  const tableName = process.env.CHAT_LEADS_TABLE;
  if (!tableName) {
    return {
      tool: 'saveChatLeadTool',
      saved: false,
      reason: 'CHAT_LEADS_TABLE is not configured.',
      lead
    };
  }

  const item = {
    id: { S: randomUUID() },
    createdAt: { S: new Date().toISOString() },
    mode: { S: mode },
    message: { S: lead.message },
    summary: { S: summary || '' }
  };

  if (lead.email) item.email = { S: lead.email };
  if (lead.phone) item.phone = { S: lead.phone };

  await getDynamoClient().send(new PutItemCommand({ TableName: tableName, Item: item }));

  return {
    tool: 'saveChatLeadTool',
    saved: true,
    lead: {
      email: lead.email,
      phone: lead.phone
    }
  };
}

async function runAgentTools(message, mode) {
  const toolCalls = [];
  const retrieval = await retrievePortfolioEvidenceTool({ message, mode });
  toolCalls.push(retrieval);

  let jobAnalysis = null;
  let roleRecommendation = null;
  let matchScore = null;

  if (mode === 'job_description_match') {
    jobAnalysis = analyzeJobDescriptionTool({ message });
    toolCalls.push(jobAnalysis);
  }

  if (mode === 'job_description_match' || mode === 'role_recommendation') {
    roleRecommendation = recommendRoleTool({ message, evidence: retrieval.evidence });
    toolCalls.push(roleRecommendation);
  }

  if (mode === 'job_description_match') {
    matchScore = calculateMatchScoreTool({
      jobAnalysis,
      roleRecommendation,
      evidence: retrieval.evidence
    });
    toolCalls.push(matchScore);
  }

  const recruiterSummary = generateRecruiterSummaryTool({
    mode,
    evidence: retrieval.evidence,
    roleRecommendation,
    matchScore
  });
  toolCalls.push(recruiterSummary);

  const leadSave = await saveChatLeadTool({
    message,
    mode,
    summary: recruiterSummary.summary
  });
  toolCalls.push(leadSave);

  return {
    evidence: retrieval.evidence,
    sources: retrieval.sources,
    jobAnalysis,
    roleRecommendation,
    matchScore,
    recruiterSummary,
    leadSave,
    toolCalls
  };
}

function fallbackAnswer(message, mode, agentState) {
  const chunks = agentState.evidence;
  const topRoles = agentState.roleRecommendation?.recommendedRoles?.slice(0, 3) || [];
  const evidence = chunks.map((chunk) => `- ${chunk.title}: ${chunk.content}`).join('\n');

  if (mode === 'job_description_match') {
    const matchScore = agentState.matchScore;
    return `**Fit verdict**: ${matchScore.verdict}\n\n**Match score**: ${matchScore.score}%\n\n**Strong matches**: ${matchScore.strongMatches.join(', ') || 'Backend, cloud, AI, and IoT experience from the portfolio'}.\n\n**Gaps**: ${matchScore.missingSkills.join(', ') || 'No major explicit gaps found in the provided job description keywords.'}\n\n**Best role angle**: ${topRoles[0]?.role || 'Backend / Cloud Developer'}.\n\n**Short recruiter-style summary**: ${agentState.recruiterSummary.summary}\n\n**Evidence used**:\n${evidence}`;
  }

  if (mode === 'role_recommendation') {
    return `**Most suitable roles**\n\n${topRoles.map((role, index) => `${index + 1}. **${role.role}**`).join('\n') || '1. **Backend Developer**\n2. **Cloud Serverless Developer**\n3. **AI Application Developer**'}\n\n**Why**: Kishan's portfolio shows AWS Lambda/API Gateway, REST APIs, DynamoDB, React, applied AI agents, computer vision, and IoT/edge-AI systems.\n\n**Evidence used**:\n${evidence}`;
  }

  if (chunks.length === 0) {
    return "I do not have enough information in Kishan's portfolio knowledge base to answer that confidently.";
  }

  return `Based on Kishan's portfolio knowledge base:\n\n${chunks.slice(0, 4).map((chunk) => `**${chunk.title}**: ${chunk.content}`).join('\n\n')}`;
}

function buildPrompt(message, mode, agentState) {
  const context = agentState.evidence.map((chunk, index) => (
    `[${index + 1}] ${chunk.title} (${chunk.type})\n${chunk.content}`
  )).join('\n\n');
  const toolOutput = agentState.toolCalls.map((call) => JSON.stringify(call, null, 2)).join('\n\n');

  return `You are HoverBot, Kishan S's agentic portfolio assistant.

Answer only using the provided portfolio context. If context is insufficient, say that clearly.
Keep answers useful, specific, and recruiter-friendly. Do not invent facts.
You have already executed tools. Use the tool results as the source of truth.

Mode: ${mode}

For job_description_match, return these sections exactly:
- Fit verdict
- Match score
- Strong matches
- Gaps
- Best role angle
- Short recruiter-style summary

For role_recommendation, recommend the top 2-4 suitable roles and explain with evidence.
For general_portfolio_qa, answer directly with portfolio evidence.

Portfolio context:
${context || 'No relevant context found.'}

Executed tool results:
${toolOutput}

User message:
${message}`;
}

async function callGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') return null;

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
    generationConfig: {
      temperature: 0.35,
      topP: 0.9,
      maxOutputTokens: 900
    }
  });

  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function answerPortfolioQuestion({ message }) {
  const cleanMessage = String(message || '').trim();
  if (!cleanMessage) {
    return {
      statusCode: 400,
      answer: 'Please send a question or job description.',
      mode: 'invalid',
      sources: []
    };
  }

  const mode = classifyMessage(cleanMessage);
  const agentState = await runAgentTools(cleanMessage, mode);
  const prompt = buildPrompt(cleanMessage, mode, agentState);

  let answer = await callGemini(prompt);
  if (!answer) {
    answer = fallbackAnswer(cleanMessage, mode, agentState);
  }

  return {
    statusCode: 200,
    answer,
    mode,
    agentic: true,
    toolsUsed: agentState.toolCalls.map((call) => call.tool),
    toolCalls: agentState.toolCalls,
    sources: agentState.sources
  };
}

export async function handleChatRequest(body) {
  try {
    const result = await answerPortfolioQuestion({ message: body?.message });
    return jsonResponse(result.statusCode, result);
  } catch (error) {
    console.error('Chat agent failed:', error);
    return jsonResponse(500, {
      answer: 'HoverBot is having trouble reaching the portfolio knowledge service right now. Please try again in a moment.',
      mode: 'error',
      sources: []
    });
  }
}
