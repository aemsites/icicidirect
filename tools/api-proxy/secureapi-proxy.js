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

const TOKEN_ID = 'http://icicidirect.finoux.com/CDNResearchAPI/CallResearchAPI.TokenId';

const tokenRequest = new Request(TOKEN_ID, {
  method: 'GET',
});

async function getSessionData(url, cache, env) {
  // Define the request body
  const requestBody = {
    apiName: 'GenerateSession',
  };

  // Make a POST request to the API to fetch session data
  const apiurl = 'http://icicidirect.finoux.com/CDNResearchAPI/CallResearchAPI';
  const response = await fetch(apiurl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: env.Authorization_Research,
    },
    body: JSON.stringify(requestBody),
  });

  // Check if the response is successful
  if (!response.ok) {
    throw new Error(`Failed to fetch session data: ${response.statusText}`);
  }

  // Parse the JSON response
  const responseData = await response.json();

  // Check if the response contains the TokenId
  if (responseData && responseData.IsSuccess && responseData.Data && responseData.Data.TokenId) {
    // Store the TokenId into the cache

    await cache.put(tokenRequest, new Response(responseData.Data.TokenId));
    // Return the session data from the API response
    return responseData.Data.TokenId;
  }
  throw new Error('Session data retrieval failed: TokenId not found in the response');
}

async function removeFromCache() {
  const cache = caches.default;
  await cache.delete(tokenRequest);
}

async function getCachedAuthHeader(url, env) {
  // Retrieve auth header from cache
  const cache = caches.default;
  const cachedResponse = await cache.match(TOKEN_ID);
  if (cachedResponse) {
    const cachedData = await cachedResponse.text();
    return cachedData;
  }
  const cachedData = await getSessionData(url, cache, env);
  return cachedData;
}

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

const handleRequest = async (request, env) => {
  const allowedOriginRegex = /^(https:\/\/.*\.(hlx\.live|hlx\.page|aem\.live|aem\.page))$/;

  const requestOrigin = request.headers.get('Origin');

  // Check if the request origin matches the regex pattern
  if (!allowedOriginRegex.test(requestOrigin)) {
    // If not allowed, return a response indicating forbidden access
    return new Response('Forbidden', { status: 403 });
  }

  if (request.method === 'OPTIONS') {
    // Handle CORS preflight requests
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
        authHeader = await getCachedAuthHeader(newUrl, env);
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

      const responseBody = await response.json();
      if (responseBody.Message === 'Session expired. Please create new session.') {
        // Session expired, remove token from cache
        await removeFromCache();
        // Call handleOptions to trigger token generation
        return handleOptions(request, env);
      }

      // Return the response from the forwarded request back to the original client
      const newResponse = new Response(JSON.stringify(responseBody), {
        status: response.status,
        headers: response.headers,
      });
      return newResponse;
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

export default {
  fetch: handleRequest,
};
