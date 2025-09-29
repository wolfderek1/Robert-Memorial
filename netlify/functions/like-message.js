// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// Fallback storage for development
let fallbackMessages = [
  {
    "id": "1759182796117",
    "name": "dw", 
    "email": "",
    "relationship": "friend",
    "message": "ewww",
    "timestamp": "2025-09-29T21:53:16.117Z",
    "likes": 0
  }
];

// Supabase API helper
async function supabaseRequest(endpoint, options = {}) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Supabase not configured');
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
      ...options.headers
    },
    ...options
  });

  if (!response.ok) {
    throw new Error(`Supabase error: ${response.status}`);
  }

  return response.json();
}

async function likeMessage(messageId) {
  try {
    // Increment likes in database
    const result = await supabaseRequest(`messages?id=eq.${messageId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        likes: 'likes + 1'
      }),
      headers: {
        'Prefer': 'return=representation'
      }
    });

    return result[0]?.likes || 0;
  } catch (error) {
    console.log('Using fallback storage:', error.message);
    // Fallback to in-memory
    const messageIndex = fallbackMessages.findIndex(msg => msg.id === messageId);
    if (messageIndex !== -1) {
      fallbackMessages[messageIndex].likes = (fallbackMessages[messageIndex].likes || 0) + 1;
      return fallbackMessages[messageIndex].likes;
    }
    throw new Error('Message not found');
  }
}

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const pathParts = event.path.split('/');
    const messageId = pathParts[pathParts.length - 2]; // Get ID from path like /messages/123/like

    // Increment likes in database
    const newLikeCount = await likeMessage(messageId);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, likes: newLikeCount })
    };

  } catch (error) {
    console.error('Like function error:', error);
    
    if (error.message === 'Message not found') {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Message not found' })
      };
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};