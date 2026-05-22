import { handleChatRequest } from './ragAgent.js';

export async function handler(event) {
  if (event.requestContext?.http?.method === 'OPTIONS' || event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'access-control-allow-origin': process.env.ALLOWED_ORIGIN || '*',
        'access-control-allow-methods': 'POST,OPTIONS',
        'access-control-allow-headers': 'content-type'
      },
      body: ''
    };
  }

  const body = typeof event.body === 'string' ? JSON.parse(event.body || '{}') : event.body || {};
  return handleChatRequest(body);
}
