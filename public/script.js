const socket = io(); // Initialize socket.io connection
const taskList = document.getElementById('taskList'); // Get the task list container
const form = document.getElementById('taskForm'); // Get the task form element
const tituloInput = document.getElementById('titulo'); // Get the title input field
const descripcionInput = document.getElementById('descripcion'); // Get the description input field

// Handle form submission
form.addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    const titulo = tituloInput.value.trim(); // Get and trim the title input value
    const descripcion = descripcionInput.value.trim(); // Get and trim the description input value

    if (!titulo) return; // Do nothing if the title is empty

    // Send a POST request to create a new task
    await fetch('/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo, descripcion }) // Send title and description as JSON
    });

    form.reset(); // Reset the form fields
});

// Display tasks on the screen
function mostrarTareas(tareas) {
    taskList.innerHTML = ''; // Clear the task list container

    tareas.forEach(t => {
        const div = document.createElement('div'); // Create a new div for each task
        div.className = 'task'; // Add a class to the div
        div.innerHTML = `
          <strong>${t.titulo}</strong><br/>
          <em>${t.descripcion || ''}</em><br/>
          <small>Estado: ${t.status}</small><br/>
          <button onclick="eliminarTarea(${t.id})">Eliminar</button>
          <button onclick="editTask(${t.id})">Editar</button>
          <button onclick="cambiarEstado(${t.id},'${t.status}')">${t.status === 'pendiente' ? 'Completar' : 'Reabrir'}</button>
        `; // Add task details and action buttons
        taskList.appendChild(div); // Append the task div to the task list container
    });
}

// Delete a task
async function eliminarTarea(id) {
    // Send a DELETE request to remove the task
    await fetch(`/tasks/${id}`, { method: 'DELETE' });
}

async function editTask(id) {
    const titulo = prompt('Nuevo título:'); // Prompt for a new title
    const descripcion = prompt('Nueva descripción:'); // Prompt for a new description

    // Update the task if either title or description is provided
    if ((titulo !== null && titulo.trim() !== '') || (descripcion !== null && descripcion.trim() !== '')) {
        await fetch(`/tasks/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ titulo, descripcion }) // Send updated title and description as JSON
        });
        loadTasks(); // Reload tasks after updating
    }
}

// Change the status of a task
async function cambiarEstado(id, estado) {
    // Send a PUT request to update the task status
    await fetch(`/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: `${(estado == 'pendiente') ? 'completada' : 'pendiente'}` }) // Toggle the status
    });
}

// Listen for task updates from the server
socket.on('tasksUpdated', mostrarTareas);

// Load tasks for the first time
fetch('/tasks')
    .then(res => res.json()) // Parse the response as JSON
    .then(mostrarTareas); // Display the tasks
