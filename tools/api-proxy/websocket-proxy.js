/**
 * This script is a simple WebSocket Echo server which works as a Cloudflare Worker.
 * It listens for incoming WebSocket connections and echoes back any received messages.
 * The server logs each received message to the console.
 * The server responds to each message with the current timestamp.
 * @param {Request} request
 */
async function handleRequest(request) {
  const upgradeHeader = request.headers.get('Upgrade');
  if (!upgradeHeader || upgradeHeader !== 'websocket') {
    return new Response('Expected Upgrade: websocket', { status: 426 });
  }

  // eslint-disable-next-line no-undef
  const webSocketPair = new WebSocketPair();
  const [client, server] = Object.values(webSocketPair);

  server.accept();

  const niftyValues = [11200, 11250, 11300, 11350, 11400, 11450, 11500, 11550, 11600, 11650];
  const sensexValues = [38000, 38100, 38200, 38300, 38400, 38500, 38600, 38700, 38800, 38900];
  let currentIndex = -1; // To keep track of the current index
  let lastNifty = niftyValues[0];
  let lastSensex = sensexValues[0];

  server.addEventListener('message', () => {
    currentIndex = (currentIndex + 1) % 10; // Move to the next index in a round-robin fashion

    const niftyStockValue = niftyValues[currentIndex];
    const niftyChange = niftyStockValue - lastNifty;
    const niftyChangePercentage = (niftyChange / lastNifty) * 100;

    const sensexStockValue = sensexValues[currentIndex];
    const sensexChange = sensexStockValue - lastSensex;
    const sensexChangePercentage = (sensexChange / lastSensex) * 100;

    const response = [
      {
        id: 'spnNifty_n',
        indexName: 'NIFTY',
        stockValue: niftyStockValue,
        change: niftyChange,
        changePercentage: niftyChangePercentage.toFixed(2),
      },
      {
        id: 'spnSensex_s',
        indexName: 'SENSEX',
        stockValue: sensexStockValue,
        change: sensexChange,
        changePercentage: sensexChangePercentage.toFixed(2),
      },
    ];

    lastNifty = niftyStockValue;
    lastSensex = sensexStockValue;

    server.send(JSON.stringify(response));
  });

  return new Response(null, {
    status: 101,
    webSocket: client,
  });
}

export default {
  fetch: handleRequest,
};
