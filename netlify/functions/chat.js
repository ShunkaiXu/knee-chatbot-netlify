// Netlify Function to proxy Anthropic API requests
// This avoids CORS issues by calling the API from the server instead of the browser

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse the request body
    const { messages, system } = JSON.parse(event.body);

    // Call Anthropic API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY, // API key stored securely in environment variables
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: system,
        messages: messages
      })
    });

    const data = await response.json();

    // Return the response
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Allow requests from any origin
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify(data)
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        error: 'Failed to process request',
        details: error.message 
      })
    };
  }
};
