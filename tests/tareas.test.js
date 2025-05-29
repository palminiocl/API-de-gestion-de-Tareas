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
            descripcion: 'Descripción de la tarea de prueba',
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

    test('Actualiza una tarea', async () => {
        const res = await request(app).get('/tasks');
        const tareaId = res.body[0].id; // Obtener el ID de la primera tarea

        const updateRes = await request(app).put(`/tasks/${tareaId}`).send({
            titulo: 'Tarea actualizada',
            descripcion: 'Descripción actualizada',
        });
        expect(updateRes.statusCode).toBe(200);
        expect(updateRes.body.titulo).toBe('Tarea actualizada');
    });
    test('Elimina una tarea', async () => {
        const res = await request(app).get('/tasks');
        const tareaId = res.body[0].id; // Obtener el ID de la primera tarea

        const deleteRes = await request(app).delete(`/tasks/${tareaId}`);
        expect(deleteRes.statusCode).toBe(200);
        expect(deleteRes.body.status).toBe('eliminada'); // Verificar que el estado sea 'eliminada'
    });
    test('No encuentra tarea al eliminar', async () => {
        let res = await request(app).get('/tasks');
        if (res.body.length === 0) {
            // Si no hay tareas, crear una para poder probar la eliminación
            const createRes = await request(app).post('/tasks').send({
                titulo: 'Tarea de prueba',
                descripcion: 'Descripción de la tarea de prueba',
            });
            expect(createRes.statusCode).toBe(201);
        }
        res = await request(app).get('/tasks');
        const tareaId = res.body[0].id; // Obtener el ID de la primera tarea

        // Eliminar la tarea
        await request(app).delete(`/tasks/${tareaId}`);

        // Intentar eliminarla de nuevo
        const deleteRes = await request(app).delete(`/tasks/${tareaId}`);
        expect(deleteRes.statusCode).toBe(404);
        expect(deleteRes.body.error).toBe('Tarea no encontrada');
    });
    test('No encuentra tarea al actualizar', async () => {
        const tareaId = 9999; // ID que no existe

        const updateRes = await request(app).put(`/tasks/${tareaId}`).send({
            titulo: 'Tarea actualizada',
            descripcion: 'Descripción actualizada',
        });
        expect(updateRes.statusCode).toBe(404);
        expect(updateRes.body.error).toBe('Tarea no encontrada');
    });
    test('Crea tarea con error', async () => {
        const res = await request(app).post('/tasks').send({
            titulo: '', // Título vacío para provocar un error
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBeDefined(); // Verificar que se retorne un error
    });
    test('Lista tareas vacías', async () => {
        // Eliminar todas las tareas
        await request(app).delete('/tasks/1'); // Asumiendo que hay al menos una tarea

        const res = await request(app).get('/tasks');
        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(0); // Debería estar vacío
    });
});



