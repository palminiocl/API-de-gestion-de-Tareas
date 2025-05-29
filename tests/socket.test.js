import { Server } from 'socket.io';
import { createServer } from 'http';
import { io as Client } from 'socket.io-client';
import app, { setSocketIO } from '../app.js';
import sequelize from '../sequelize.js';
import request from 'supertest';

let ioServer, httpServer, clientSocket;

beforeAll(async () => {
  // Iniciar base de datos limpia
  await sequelize.sync({ force: true });

  // Crear servidor HTTP + WebSocket
  httpServer = createServer(app);
  ioServer = new Server(httpServer);

  // Inyectar socket en la app
  setSocketIO(ioServer);

  await new Promise(resolve => httpServer.listen(3000, resolve));

  // Conectar cliente
  clientSocket = new Client('http://localhost:3000');

  await new Promise(resolve => clientSocket.on('connect', resolve));
});

afterAll(async () => {
  clientSocket.disconnect();
  ioServer.close();
  await sequelize.close();
});

describe('WebSocket API', () => {
  test('emite evento "tasksUpdated" al crear una tarea', async () => {
    const taskPromise = new Promise(resolve => {
      clientSocket.once('tasksUpdated', (tareas) => {
        resolve(tareas);
      });
    });

    await request(app).post('/tasks').send({
      titulo: 'Tarea WebSocket',
      descripcion: 'Emitida por WS',
      status: 'pendiente'
    });

    const tareas = await taskPromise;

    expect(Array.isArray(tareas)).toBe(true);
    expect(tareas.length).toBe(1);
    expect(tareas[0].titulo).toBe('Tarea WebSocket');
  });
});
