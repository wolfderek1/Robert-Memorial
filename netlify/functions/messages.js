// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// Simple fallback for development/demo
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
    throw new Error('Supabase not configured - using fallback storage');
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

async function getMessages() {
  try {
    const messages = await supabaseRequest('messages?order=created_at.desc');
    return messages.map(msg => ({
      id: msg.id.toString(),
      name: msg.name,
      email: msg.email || '',
      relationship: msg.relationship || '',
      message: msg.message,
      timestamp: msg.created_at,
      likes: msg.likes || 0
    }));
  } catch (error) {
    console.log('Using fallback storage:', error.message);
    return fallbackMessages;
  }
}

async function saveMessage(messageData) {
  try {
    const result = await supabaseRequest('messages', {
      method: 'POST',
      body: JSON.stringify({
        name: messageData.name,
        email: messageData.email,
        relationship: messageData.relationship,
        message: messageData.message,
        likes: 0
      })
    });

    return {
      id: result[0].id.toString(),
      name: result[0].name,
      email: result[0].email || '',
      relationship: result[0].relationship || '',
      message: result[0].message,
      timestamp: result[0].created_at,
      likes: result[0].likes || 0
    };
  } catch (error) {
    console.log('Using fallback storage:', error.message);
    // Fallback to in-memory storage
    const newMessage = {
      id: Date.now().toString(),
      name: messageData.name.trim(),
      email: messageData.email ? messageData.email.trim() : '',
      relationship: messageData.relationship || '',
      message: messageData.message.trim(),
      timestamp: new Date().toISOString(),
      likes: 0
    };
    fallbackMessages.unshift(newMessage);
    return newMessage;
  }
}

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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

  try {
    if (event.httpMethod === 'GET') {
      // Return all messages from database
      const messages = await getMessages();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(messages)
      };
    }

    if (event.httpMethod === 'POST') {
      const data = JSON.parse(event.body);
      
      // Validate required fields
      if (!data.name || !data.message) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Name and message are required' })
        };
      }

      // Save message to database
      const newMessage = await saveMessage(data);

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({ success: true, message: newMessage })
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};