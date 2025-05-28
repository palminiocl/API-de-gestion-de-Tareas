import request from 'supertest';
import app from '../app.js';
import sequelize from '../sequelize.js';

beforeAll(async () => {

    await sequelize.sync({ force: true }); // Reiniciar la base de datos antes de las pruebas
});


afterAll(async () => {
    await sequelize.close(); // Cerrar la conexión a la base de datos después de las pruebas
});

describe('API de Tareas', () => {
    test('Crea tarea', async () => {
        const res = await request(app).post('/tasks').send({
            titulo: 'Tarea de prueba',
            description: 'Descripción de la tarea de prueba',
        });
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('id');
    });

    test('Lista todas las tareas', async () => {
        const res = await request(app).get('/tasks');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0); // Debería haber al menos una tarea
    });
});



