function connectWebSocket(block) {
  const wsUrl = 'wss://contentfeeds.icicidirect.com/socket.io/?EIO=4&transport=websocket';
  const websocket = new WebSocket(wsUrl);

  websocket.addEventListener('open', (event) => {
    block.textContent = `Connected to the WebSocket server ${event.data}`;
  });

  // Listen for incoming messages from the server
  websocket.addEventListener('message', (event) => {
    // Handle the incoming message here
    console.log('Message from server:', event.data);
    // Update block content with the received message
    block.textContent = event.data;
  });

  // eslint-disable-next-line no-unused-vars
  websocket.addEventListener('close', (event) => {
    console.log('WebSocket connection closed, attempting to reconnect...');
    setTimeout(connectWebSocket, 1000); // Attempt to reconnect after 1 second
  });

  websocket.addEventListener('error', (event) => {
    console.error('WebSocket error:', event);
  });
}

export default function decorate(block) {
  connectWebSocket(block);
}
