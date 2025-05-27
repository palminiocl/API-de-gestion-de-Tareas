import sequelize from './sequelize.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import app, { setSocketIO } from './app.js'; // Importar la aplicación Express

const PORT = 3000;
const server = createServer(app);
const io = new Server(server);

setSocketIO(io); // Inyectar socket.io en la aplicación

// Sincronizar base de datos
await sequelize.sync({ alter: true });


io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado');
  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});


server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
