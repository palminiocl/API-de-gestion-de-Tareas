import express from 'express';
import sequelize from './sequelize.js';
import Tarea from './models/Tarea.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const PORT = 3000;
const server = createServer(app);
const io = new Server(server);

const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
// Sincronizar base de datos
await sequelize.sync({ alter: true });

// Crear una tarea
app.post('/tasks', async (req, res) => {
  try {
    const tarea = await Tarea.create(req.body);
    await broadcastTasks(); // Emitir el cambio a todos los clientes
    res.status(201).json(tarea);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Listar todas las tareas
app.get('/tasks', async (req, res) => {
  const tareas = await Tarea.findAll();
  await broadcastTasks(); // Emitir el cambio a todos los clientes

  res.json(tareas);
});

// Actualizar una tarea
app.put('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const tarea = await Tarea.findByPk(id);
    if (!tarea) return res.status(404).json({ error: 'Tarea no encontrada' });
    
    await tarea.update(req.body);
    await broadcastTasks(); // Emitir el cambio a todos los clientes

    res.json(tarea);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Eliminar una tarea
app.delete('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const tarea = await Tarea.findByPk(id);
  if (!tarea) return res.status(404).json({ error: 'Tarea no encontrada' });

  await tarea.destroy();
  tarea.status = 'eliminada'; // Cambiar el estado a 'eliminada'
  await broadcastTasks(); // Emitir el cambio a todos los clientes
  res.json(tarea);
});


io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado');
  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});

const broadcastTasks = async () => {
  const tareas = await Tarea.findAll();
  io.emit('tasksUpdated', tareas);
};

server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
