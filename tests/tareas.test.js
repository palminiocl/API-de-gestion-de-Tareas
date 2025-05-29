import request from 'supertest';
import app from '../app.js';
import sequelize from '../sequelize.js';

// Before all tests, reset the database
beforeAll(async () => {
    await sequelize.sync({ force: true }); // Reset the database before tests
});

// After all tests, close the database connection
afterAll(async () => {
    await sequelize.close(); // Close the database connection after tests
});

describe('Task API', () => {
    test('Creates a task', async () => {
        const res = await request(app).post('/tasks').send({
            titulo: 'Tarea de prueba', // Task title
            descripcion: 'Descripción de la tarea de prueba', // Task description
        });
        expect(res.statusCode).toBe(201); // Expect HTTP status code 201 (Created)
        expect(res.body).toHaveProperty('id'); // Expect response to have an 'id' property
    });

    test('Lists all tasks', async () => {
        const res = await request(app).get('/tasks');
        expect(res.statusCode).toBe(200); // Expect HTTP status code 200 (OK)
        expect(Array.isArray(res.body)).toBe(true); // Expect response to be an array
        expect(res.body.length).toBeGreaterThan(0); // Expect at least one task in the list
    });

    test('Updates a task', async () => {
        const res = await request(app).get('/tasks');
        const tareaId = res.body[0].id; // Get the ID of the first task

        const updateRes = await request(app).put(`/tasks/${tareaId}`).send({
            titulo: 'Tarea actualizada', // Updated task title
            descripcion: 'Descripción actualizada', // Updated task description
        });
        expect(updateRes.statusCode).toBe(200); // Expect HTTP status code 200 (OK)
        expect(updateRes.body.titulo).toBe('Tarea actualizada'); // Expect updated title in response
    });

    test('Deletes a task', async () => {
        const res = await request(app).get('/tasks');
        const tareaId = res.body[0].id; // Get the ID of the first task

        const deleteRes = await request(app).delete(`/tasks/${tareaId}`);
        expect(deleteRes.statusCode).toBe(200); // Expect HTTP status code 200 (OK)
        expect(deleteRes.body.status).toBe('deleted'); // Expect 'status' to be 'eliminada' in response
    });

    test('Fails to find a task when deleting', async () => {
        let res = await request(app).get('/tasks');
        if (res.body.length === 0) {
            // If no tasks exist, create one to test deletion
            const createRes = await request(app).post('/tasks').send({
                titulo: 'Tarea de prueba', // Task title
                descripcion: 'Descripción de la tarea de prueba', // Task description
            });
            expect(createRes.statusCode).toBe(201); // Expect HTTP status code 201 (Created)
        }
        res = await request(app).get('/tasks');
        const tareaId = res.body[0].id; // Get the ID of the first task

        // Delete the task
        await request(app).delete(`/tasks/${tareaId}`);

        // Attempt to delete the task again
        const deleteRes = await request(app).delete(`/tasks/${tareaId}`);
        expect(deleteRes.statusCode).toBe(404); // Expect HTTP status code 404 (Not Found)
        expect(deleteRes.body.error).toBe('Task not found'); // Expect error message in response
    });

    test('Fails to find a task when updating', async () => {
        const tareaId = 9999; // Non-existent task ID

        const updateRes = await request(app).put(`/tasks/${tareaId}`).send({
            titulo: 'Tarea actualizada', // Updated task title
            descripcion: 'Descripción actualizada', // Updated task description
        });
        expect(updateRes.statusCode).toBe(404); // Expect HTTP status code 404 (Not Found)
        expect(updateRes.body.error).toBe('Task not found'); // Expect error message in response
    });

    test('Fails to create a task with invalid data', async () => {
        const res = await request(app).post('/tasks').send({
            titulo: '', // Empty title to trigger validation error
        });
        expect(res.statusCode).toBe(400); // Expect HTTP status code 400 (Bad Request)
        expect(res.body.error).toBeDefined(); // Expect error message in response
    });

    test('Lists empty tasks', async () => {
        // Delete all tasks
        await request(app).delete('/tasks/1'); // Assuming at least one task exists

        const res = await request(app).get('/tasks');
        expect(res.statusCode).toBe(200); // Expect HTTP status code 200 (OK)
        expect(res.body.length).toBe(0); // Expect empty task list
    });
});
