import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import Tarea from './models/Tarea.js';


const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Inyectar socket.io si existe
let io = null;
export function setSocketIO(ioInstance) {
  io = ioInstance;
}

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

const broadcastTasks = async () => {
    const tareas = await Tarea.findAll();
    io.emit('tasksUpdated', tareas);
};
  
export default app;