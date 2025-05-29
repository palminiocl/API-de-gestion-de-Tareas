import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import Tarea from './models/Tarea.js';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Middleware to parse JSON requests
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Variable to hold the socket.io instance
let io = null;

// Function to inject socket.io instance
export function setSocketIO(ioInstance) {
  io = ioInstance;
}

// Endpoint to create a new task
app.post('/tasks', async (req, res) => {
  try {
    const tarea = await Tarea.create(req.body); // Create a new task in the database
    await broadcastTasks(); // Notify all clients about the updated task list
    res.status(201).json(tarea); // Respond with the created task
  } catch (error) {
    console.error('❌ Error creating task:', error); // Log error for debugging
    res.status(400).json({ error: error.message }); // Respond with error message
  }
});

// Endpoint to list all tasks
app.get('/tasks', async (req, res) => {
  const tareas = await Tarea.findAll(); // Retrieve all tasks from the database
  await broadcastTasks(); // Notify all clients about the updated task list
  res.json(tareas); // Respond with the list of tasks
});

// Endpoint to update a task
app.put('/tasks/:id', async (req, res) => {
  const { id } = req.params; // Extract task ID from request parameters
  try {
    const tarea = await Tarea.findByPk(id); // Find the task by its primary key
    if (!tarea) return res.status(404).json({ error: 'Task not found' }); // Respond if task doesn't exist

    await tarea.update(req.body); // Update the task with new data
    await broadcastTasks(); // Notify all clients about the updated task list
    res.json(tarea); // Respond with the updated task
  } catch (error) {
    res.status(400).json({ error: error.message }); // Respond with error message
  }
});

// Endpoint to delete a task
app.delete('/tasks/:id', async (req, res) => {
  const { id } = req.params; // Extract task ID from request parameters
  const tarea = await Tarea.findByPk(id); // Find the task by its primary key
  if (!tarea) return res.status(404).json({ error: 'Task not found' }); // Respond if task doesn't exist

  await tarea.destroy(); // Delete the task from the database
  tarea.status = 'deleted'; // Change the status to 'deleted'
  await broadcastTasks(); // Notify all clients about the updated task list
  res.json(tarea); // Respond with the deleted task
});

// Function to broadcast the updated task list to all clients
const broadcastTasks = async () => {
  const tareas = await Tarea.findAll(); // Retrieve all tasks from the database
  if (io) {
    io.emit('tasksUpdated', tareas); // Emit the updated task list to all connected clients
  }
};

export default app;