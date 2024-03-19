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
  if (request.method === 'POST') {
    try {
      const body = await request.json();
      const newUrl = env.ORIGIN_HOSTNAME;

      // Set up the new request to forward the data
      const init = {
        method: 'POST',
        headers: {
          Authorization: env.Authorization,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      };

      const response = await fetch(newUrl, init);

      return new Response(response.body, {
        status: response.status,
        headers: response.headers,
      });
    } catch (error) {
      return new Response(`Error forwarding request: ${error.message}`, { status: 500 });
    }
  } else {
    // If not a POST request, return 405 Method Not Allowed
    return new Response('Method Not Allowed', { status: 405 });
  }
};

export default {
  fetch: handleRequest,
};
