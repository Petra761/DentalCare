// Configuration
const API_BASE = 'http://localhost:5020/api';

// State
let appointments = [];
let clients = [];
let services = [];
let users = [];
let selectedClient = null;
let currentStatusFilter = 'Todas';
let currentSearchQuery = '';

// DOM Elements
const btnNuevaCita = document.getElementById('btnNuevaCita');
const modalNuevaCita = document.getElementById('modalNuevaCita');
const btnCerrarModal = document.getElementById('btnCerrarModal');
const btnCancelarCita = document.getElementById('btnCancelarCita');
const appointmentForm = document.getElementById('appointmentForm');

const searchInput = document.getElementById('searchInput');
const filterBtns = document.querySelectorAll('.filter-btn');
const appointmentsTableBody = document.getElementById('appointmentsTableBody');

const buscarPacienteInput = document.getElementById('buscarPaciente');
const patientSuggestions = document.getElementById('patientSuggestions');
const nombreCompletoReadOnly = document.getElementById('nombreCompleto');
const selectedClienteIdInput = document.getElementById('selectedClienteId');
const servicioSelect = document.getElementById('servicioSelect');
const fechaInput = document.getElementById('fechaInput');
const horaInput = document.getElementById('horaInput');
const medioComunicacionSelect = document.getElementById('medioComunicacion');

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    init();
    setupEventListeners();
});

async function init() {
    showLoading();
    try {
        // Load initial data in parallel
        await Promise.all([
            loadClients(),
            loadServices(),
            loadUsers()
        ]);
        
        // Load appointments after supporting data is loaded so we can resolve names immediately
        await loadAppointments();
    } catch (error) {
        console.error('Error during initialization:', error);
        appointmentsTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="table-loading" style="color: var(--status-cancelled-text);">
                    <i class="fa-solid fa-triangle-exclamation"></i> Error al conectar con el servidor. Asegúrese de que el backend está corriendo.
                </td>
            </tr>
        `;
    }
}

function setupEventListeners() {
    // Modal Open/Close
    btnNuevaCita.addEventListener('click', openModal);
    btnCerrarModal.addEventListener('click', closeModal);
    btnCancelarCita.addEventListener('click', closeModal);
    
    // Close modal when clicking outside the card
    modalNuevaCita.addEventListener('click', (e) => {
        if (e.target === modalNuevaCita) {
            closeModal();
        }
    });

    // Search Bar Input
    searchInput.addEventListener('input', (e) => {
        currentSearchQuery = e.target.value.trim().toLowerCase();
        renderAppointments();
    });

    // Filter Buttons
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentStatusFilter = btn.dataset.status;
            renderAppointments();
        });
    });

    // Patient Autocomplete Search in Modal
    buscarPacienteInput.addEventListener('input', handlePatientSearchInput);
    
    // Hide suggestions list when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.autocomplete-container')) {
            patientSuggestions.style.display = 'none';
        }
    });

    // Form Submission
    appointmentForm.addEventListener('submit', handleFormSubmit);
}

// API Fetches
async function loadClients() {
    const res = await fetch(`${API_BASE}/Clientes`);
    if (!res.ok) throw new Error('Failed to fetch clients');
    clients = await res.json();
}

async function loadServices() {
    const res = await fetch(`${API_BASE}/Servicios`);
    if (!res.ok) throw new Error('Failed to fetch services');
    // Load only active services ("Disponible" / "Activo")
    services = await res.json();
    const activeServices = services.filter(s => s.estado === 'Activo' && s.estadoServicio === 'Disponible');
    
    // Populate Service Select
    servicioSelect.innerHTML = '<option value="" disabled selected>Elegir servicio...</option>';
    activeServices.forEach(srv => {
        const option = document.createElement('option');
        option.value = srv.idServicio;
        option.textContent = srv.nombre;
        servicioSelect.appendChild(option);
    });
}

async function loadUsers() {
    try {
        const res = await fetch(`${API_BASE}/Usuarios`);
        if (res.ok) {
            users = await res.json();
        }
    } catch (e) {
        console.warn('Could not load users list, using default user ID = 1', e);
    }
}

async function loadAppointments() {
    const res = await fetch(`${API_BASE}/Citas`);
    if (!res.ok) throw new Error('Failed to fetch appointments');
    const citasRaw = await res.json();
    
    // Also load Details in parallel to link treatment names
    const detailsRes = await fetch(`${API_BASE}/DetallesCita`);
    let details = [];
    if (detailsRes.ok) {
        details = await detailsRes.json();
    }

    // Map raw appointments to include patient info and service name
    appointments = citasRaw.map(cita => {
        const client = clients.find(c => c.idCliente === cita.idCliente);
        
        // Find appointment details to get service name
        const detail = details.find(d => d.idCita === cita.idCita);
        const service = detail ? services.find(s => s.idServicio === detail.idServicio) : null;

        return {
            ...cita,
            clientName: client ? `${client.nombre} ${client.apellidoPaterno} ${client.apellidoMaterno}`.trim() : 'Paciente Desconocido',
            clientCi: client ? client.ci : 'N/A',
            clientFirstChar: client ? client.nombre.charAt(0) : 'P',
            serviceName: service ? service.nombre : 'No asignado'
        };
    });

    // Sort by Date & Time (newest or closest first)
    appointments.sort((a, b) => {
        const dateA = new Date(`${a.fecha}T${a.hora}`);
        const dateB = new Date(`${b.fecha}T${b.hora}`);
        return dateB - dateA; // Newest first
    });

    renderAppointments();
}

// Render Table
function renderAppointments() {
    appointmentsTableBody.innerHTML = '';

    // Filter appointments
    const filtered = appointments.filter(appo => {
        // Status filter
        const matchStatus = currentStatusFilter === 'Todas' || appo.estadoCita === currentStatusFilter;
        
        // Search query filter
        const client = clients.find(c => c.idCliente === appo.idCliente);
        let matchQuery = true;
        if (currentSearchQuery) {
            const ciStr = appo.clientCi.toString();
            const fullName = appo.clientName.toLowerCase();
            const name = client ? client.nombre.toLowerCase() : '';
            const patLast = client ? client.apellidoPaterno.toLowerCase() : '';
            const matLast = client ? client.apellidoMaterno.toLowerCase() : '';
            
            matchQuery = ciStr.includes(currentSearchQuery) || 
                         fullName.includes(currentSearchQuery) ||
                         name.includes(currentSearchQuery) ||
                         patLast.includes(currentSearchQuery) ||
                         matLast.includes(currentSearchQuery);
        }

        return matchStatus && matchQuery;
    });

    if (filtered.length === 0) {
        appointmentsTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="table-loading">No se encontraron citas coincidentes.</td>
            </tr>
        `;
        return;
    }

    filtered.forEach(appo => {
        const tr = document.createElement('tr');
        
        // Format Date nicely
        // Date comes as YYYY-MM-DD, parse manually to avoid timezone shift
        const [year, month, day] = appo.fecha.split('-');
        const dateObj = new Date(year, month - 1, day);
        const formattedDate = dateObj.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });

        // Format Time nicely (from HH:MM:SS to hh:mm AM/PM)
        const [hours, minutes] = appo.hora.split(':');
        let hr = parseInt(hours, 10);
        const ampm = hr >= 12 ? 'PM' : 'AM';
        hr = hr % 12;
        hr = hr ? hr : 12; // the hour '0' should be '12'
        const formattedTime = `${hr.toString().padStart(2, '0')}:${minutes} ${ampm}`;

        const statusClass = appo.estadoCita.toLowerCase();

        tr.innerHTML = `
            <td>
                <div class="client-info">
                    <div class="client-avatar">${appo.clientFirstChar}</div>
                    <div class="client-details">
                        <div class="client-name">${appo.clientName}</div>
                        <div class="client-ci">CI: ${appo.clientCi}</div>
                    </div>
                </div>
            </td>
            <td>
                <div class="appointment-datetime">
                    <span class="appointment-date">${formattedDate}</span>
                    <span class="appointment-time">${formattedTime}</span>
                </div>
            </td>
            <td>
                <span class="treatment-badge">${appo.serviceName}</span>
            </td>
            <td>
                <span class="status-pill ${statusClass}">${appo.estadoCita}</span>
            </td>
            <td class="actions-cell">
                <button class="btn-manage">Gestionar</button>
            </td>
        `;
        
        appointmentsTableBody.appendChild(tr);
    });
}

function showLoading() {
    appointmentsTableBody.innerHTML = `
        <tr>
            <td colspan="5" class="table-loading"><i class="fa-solid fa-spinner fa-spin"></i> Cargando citas...</td>
        </tr>
    `;
}

// Modal Functions
function openModal() {
    appointmentForm.reset();
    selectedClient = null;
    selectedClienteIdInput.value = '';
    nombreCompletoReadOnly.value = '';
    patientSuggestions.style.display = 'none';
    
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    fechaInput.value = today;
    
    modalNuevaCita.classList.add('active');
}

function closeModal() {
    modalNuevaCita.classList.remove('active');
}

// Patient Autocomplete Logic
function handlePatientSearchInput(e) {
    const query = e.target.value.trim().toLowerCase();
    
    if (query.length < 2) {
        patientSuggestions.style.display = 'none';
        return;
    }

    // Filter patients by CI or (Name + LastNames)
    const matches = clients.filter(c => {
        const ciStr = c.ci.toString();
        const fullName = `${c.nombre} ${c.apellidoPaterno} ${c.apellidoMaterno}`.toLowerCase();
        return ciStr.includes(query) || fullName.includes(query);
    });

    if (matches.length === 0) {
        patientSuggestions.innerHTML = '<li style="color: var(--text-muted); cursor: default;">No se encontró ningún paciente</li>';
        patientSuggestions.style.display = 'block';
        return;
    }

    patientSuggestions.innerHTML = '';
    matches.slice(0, 5).forEach(patient => {
        const li = document.createElement('li');
        const pName = `${patient.nombre} ${patient.apellidoPaterno} ${patient.apellidoMaterno}`;
        li.textContent = `${pName} (CI: ${patient.ci})`;
        li.addEventListener('click', () => {
            selectPatient(patient);
        });
        patientSuggestions.appendChild(li);
    });

    patientSuggestions.style.display = 'block';
}

function selectPatient(patient) {
    selectedClient = patient;
    selectedClienteIdInput.value = patient.idCliente;
    
    const fullName = `${patient.nombre} ${patient.apellidoPaterno} ${patient.apellidoMaterno}`;
    nombreCompletoReadOnly.value = fullName;
    buscarPacienteInput.value = `${fullName} (CI: ${patient.ci})`;
    
    patientSuggestions.style.display = 'none';
}

// Form Submission
async function handleFormSubmit(e) {
    e.preventDefault();

    const clientId = selectedClienteIdInput.value;
    if (!clientId) {
        alert('Por favor, busque y seleccione un paciente válido de la lista de sugerencias.');
        return;
    }

    const serviceId = servicioSelect.value;
    const fecha = fechaInput.value;
    const hora = horaInput.value;
    const medioComunicacion = medioComunicacionSelect.value;
    const estadoCita = 'Pendiente'; // Requisito: inicializado en Pendiente

    // Create unique random code for appointment
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const appointmentCode = `CIT-${randomNum}`;

    // Get an active User ID to satisfy foreign key requirement
    // We fall back to 1 if no users loaded
    const userId = users.length > 0 ? users[0].idUsuario : 1;

    // Build Cita payload
    const citaPayload = {
        IdCliente: parseInt(clientId, 10),
        IdUsuario: userId,
        Codigo: appointmentCode,
        MedioComunicacion: medioComunicacion,
        Fecha: fecha, // YYYY-MM-DD
        Hora: `${hora}:00`, // HH:MM:SS
        EstadoCita: estadoCita,
        Estado: "Activo"
    };

    try {
        btnCancelarCita.disabled = true;
        const submitBtn = document.getElementById('btnAgendarCita');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Agendando...';

        // POST Cita
        const resCita = await fetch(`${API_BASE}/Citas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(citaPayload)
        });

        if (!resCita.ok) {
            throw new Error(`Error al crear la cita: ${resCita.statusText}`);
        }

        const createdCita = await resCita.json();
        
        // POST DetalleCita
        const detallePayload = {
            IdCita: createdCita.idCita,
            IdServicio: parseInt(serviceId, 10)
        };

        const resDetalle = await fetch(`${API_BASE}/DetallesCita`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(detallePayload)
        });

        if (!resDetalle.ok) {
            throw new Error(`Error al crear los detalles de la cita: ${resDetalle.statusText}`);
        }

        // Success: reload, close modal, show message
        await loadAppointments();
        closeModal();
        
        // Gentle native notice
        alert('¡Cita agendada con éxito!');

    } catch (err) {
        console.error('Error scheduling appointment:', err);
        alert(`Ocurrió un error al agendar la cita: ${err.message}`);
    } finally {
        btnCancelarCita.disabled = false;
        const submitBtn = document.getElementById('btnAgendarCita');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-regular fa-calendar-check"></i> Agendar Cita';
    }
}
