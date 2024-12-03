const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:6000');

ws.on('open', function open() {
  console.log('Connected to WebSocket server');
  // Simulate sending a default agent configuration
  ws.send(JSON.stringify({
    event: 'default_agents',
    data: {
      agents: [
        {
          id: 1,
          name: 'Simulated Agent',
          role: 'Tester',
          goal: 'Simulate WebSocket communication',
          tasks: ['Task 1', 'Task 2'],
          expected_output: 'Simulated output'
        }
      ]
    }
  }));
});

ws.on('message', function incoming(data) {
  console.log('Received:', data);
});

ws.on('close', function close() {
  console.log('Disconnected from WebSocket server');
});

ws.on('error', function error(err) {
  console.error('WebSocket error:', err);
});
