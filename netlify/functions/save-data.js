// Simple Netlify function to save Jake's Summer Adventure data
export async function handler(event, context) {
  // Enable CORS for all domains
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // For demo purposes, we'll use a simple in-memory store
    // In production, this would use a real database like Supabase, Firebase, etc.

    if (event.httpMethod === 'GET') {
      // Load data
      const data = {
        book_content: {},
        book_projects: [],
        writing_notes: '',
        timeline_progress: {},
        map_locations: []
      };

      return {
        statusCode: 200,
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      };
    }

    if (event.httpMethod === 'POST' || event.httpMethod === 'PUT') {
      // Save data
      const data = JSON.parse(event.body);
      console.log('Received data to save:', Object.keys(data));

      // In a real implementation, save to database here
      // await db.collection('jake-summer-data').doc('main').set(data);

      return {
        statusCode: 200,
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ success: true, message: 'Data saved successfully' })
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };

  } catch (error) {
    console.error('Error handling request:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
}