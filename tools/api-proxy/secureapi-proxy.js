/**
 * This is a secure API proxy that forwards requests to a secure API.
 * It is intended to be used as a Cloudflare Worker.
 * It reads the request body and forwards it to the secure API.
 * It forwards the response from the secure API back to the client.
 * Authorization Token and Origin Host is read from the environment variables to keep it secure.
 * @param request
 * @param env
 * @returns {Promise<Response>}
 */

// eslint-disable-next-line no-unused-vars
const handleRequest = async (request, env) => {
  if (request.method === 'OPTIONS') {
    // Handle CORS preflight requests
    // eslint-disable-next-line no-use-before-define
    return handleOptions(request);
  }
  if (request.method === 'POST') {
    try {
      const body = await request.json(); // Extract JSON body from the incoming request
      const isMarketAPI = request.url.includes('CDNMarketAPI'); // Check if the URL contains "CDNMarketAPI"
      let authHeader;
      let newUrl = env.ORIGIN_HOSTNAME + request.url.substr(request.url.indexOf('/', 8));
      if (isMarketAPI) {
        authHeader = env.Authorization_Marketing;
      } else {
        authHeader = env.Authorization_Research;
      }

      if (newUrl === `${env.ORIGIN_HOSTNAME}/`) {
        // If newUrl is just env.ORIGIN_HOSTNAME + "/", add "CDNResearchAPI/CallResearchAPI" to it
        newUrl += 'CDNResearchAPI/CallResearchAPI';
      }

      // Set up the new request to forward the data
      const init = {
        method: 'POST',
        headers: {
          Authorization: authHeader, // Use the Authorization token from the environment variable
          'Content-Type': 'application/json', // Set Content-Type to application/json
        },
        body: JSON.stringify(body), // Forward the original request body as JSON
      };

      // Forward the request to the new URL
      const response = await fetch(newUrl, init);

      // Return the response from the forwarded request back to the original client
      return new Response(response.body, {
        status: response.status,
        headers: response.headers,
      });
    } catch (error) {
      // Handle any errors that might occur during the request forwarding
      return new Response(`Error forwarding request: ${error.message}`, { status: 500 });
    }
  } else if (request.method === 'GET') {
    try {
      const newUrl = env.ORIGIN_HOSTNAME + request.url.substr(request.url.indexOf('/', 8));

      // Fetch the data from the new URL
      const response = await fetch(newUrl);

      // Return the response back to the original client
      return new Response(response.body, {
        status: response.status,
        headers: response.headers,
      });
    } catch (error) {
      // Handle any errors that might occur during the request forwarding
      return new Response(`Error fetching data: ${error.message}`, { status: 500 });
    }
  } else {
    // If not a POST or GET request, return 405 Method Not Allowed
    return new Response('Method Not Allowed', { status: 405 });
  }
};

// eslint-disable-next-line no-unused-vars
async function handleOptions(request) {
  // Handle CORS preflight requests.
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*',
    },
  });
}

export default {
  fetch: handleRequest,
};
