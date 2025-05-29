import { Server } from 'socket.io';
import { createServer } from 'http';
import { io as Client } from 'socket.io-client';
import app, { setSocketIO } from '../app.js';
import sequelize from '../sequelize.js';
import request from 'supertest';

let ioServer, httpServer, clientSocket;

beforeAll(async () => {
    // Initialize a clean database
    await sequelize.sync({ force: true });

    // Create HTTP + WebSocket server
    httpServer = createServer(app);
    ioServer = new Server(httpServer);

    // Inject socket into the app
    setSocketIO(ioServer);

    // Start the server and wait for it to listen on port 3000
    await new Promise(resolve => httpServer.listen(3000, resolve));

    // Connect the client to the WebSocket server
    clientSocket = new Client('http://localhost:3000');

    // Wait for the client to successfully connect
    await new Promise(resolve => clientSocket.on('connect', resolve));
});

afterAll(async () => {
    // Disconnect the client socket
    clientSocket.disconnect();

    // Close the WebSocket server
    ioServer.close();

    // Close the database connection
    await sequelize.close();
});

describe('WebSocket API', () => {
    test('emits "tasksUpdated" event when a task is created', async () => {
        // Create a promise to capture the "tasksUpdated" event
        const taskPromise = new Promise(resolve => {
            clientSocket.once('tasksUpdated', (tareas) => {
                resolve(tareas);
            });
        });

        // Send a POST request to create a new task
        await request(app).post('/tasks').send({
            titulo: 'Tarea WebSocket',
            descripcion: 'Emitida por WS',
            status: 'pendiente'
        });

        // Wait for the "tasksUpdated" event and retrieve the tasks
        const tareas = await taskPromise;

        // Validate the received tasks
        expect(Array.isArray(tareas)).toBe(true);
        expect(tareas.length).toBe(1);
        expect(tareas[0].titulo).toBe('Tarea WebSocket');
    });
});
