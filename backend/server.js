// server.js (MODIFICADO para servir archivos estáticos)
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors()); // Permite peticiones desde el frontend (HTML)
app.use(express.json()); // Para parsear el body de las peticiones POST

// 🔑 SOLUCIÓN AL "Cannot GET /":
// Sirve todos los archivos (HTML, CSS, JS) dentro de la carpeta 'public'.
// Al acceder a http://localhost:3000, buscará el index.html en esa carpeta.
app.use(express.static('public'));

// 🔹 Configuración de Conexión a PostgreSQL
const pool = new Pool({
    host: 'localhost',
    user: 'postgres', 
    password: '1234', 
    database: 'Umedic IPS', 
    port: 5432,
});

// Prueba de conexión
pool.connect((err, client, done) => {
    if (err) {
        console.error('❌ Error al conectar a PostgreSQL:', err.message);
        return;
    }
    console.log('✅ Conexión a PostgreSQL exitosa!');
    done();
});

// =======================================================
// RUTAS DE API: MÉDICOS
// =======================================================
// POST: Registrar un nuevo médico
app.post('/medicos', async (req, res) => {
    const { idMedico, nombreMedico, apellidoMedico, espMedico, regMedico, correoMedico, telMedico } = req.body;
    try {
        const query = 'INSERT INTO medicos (id_medico, nombre, apellido, especialidad, registro_medico, correo, telefono) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *';
        const values = [idMedico, nombreMedico, apellidoMedico, espMedico, regMedico, correoMedico, telMedico];
        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error al registrar médico:', err.message);
        res.status(500).json({ error: 'Error al registrar médico: ' + err.message });
    }
});

// GET: Obtener todos los médicos
app.get('/medicos', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM medicos ORDER BY apellido, nombre');
        res.json(result.rows);
    } catch (err) {
        console.error('Error al obtener médicos:', err.message);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});


// ===========================================================
// RUTAS DE API: PACIENTES
// ===========================================================

// POST: Registrar un nuevo paciente
app.post('/pacientes', async (req, res) => {
    const { docPaciente, nombrePaciente, apellidoPaciente, telPaciente, correoPaciente, edadPaciente, sexoPaciente } = req.body;
    try {
        const query = 'INSERT INTO pacientes (documento, nombre, apellido, telefono, correo, edad, sexo) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *';
        const values = [docPaciente, nombrePaciente, apellidoPaciente, telPaciente, correoPaciente, edadPaciente, sexoPaciente];
        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error al registrar paciente:', err.message);
        res.status(500).json({ error: 'Error al registrar paciente: ' + err.message });
    }
});

// GET: Obtener todos los pacientes
app.get('/pacientes', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM pacientes ORDER BY apellido, nombre');
        res.json(result.rows);
    } catch (err) {
        console.error('Error al obtener pacientes:', err.message);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});


// =========================================================
// RUTAS DE API: CITAS
// =========================================================

// POST: Agendar una nueva cita
app.post('/citas', async (req, res) => {
    const { idCita, idPaciente, idMedico, fechaCita, horaCita, estadoCita } = req.body;
    try {
        const query = 'INSERT INTO citas (id_cita, id_paciente, id_medico, fecha, hora, estado) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *';
        const values = [idCita, idPaciente, idMedico, fechaCita, horaCita, estadoCita];
        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error al agendar cita:', err.message);
        res.status(500).json({ error: 'Error al agendar cita. Verifique IDs: ' + err.message });
    }
});

// GET: Obtener todas las citas
app.get('/citas', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM citas ORDER BY fecha DESC, hora DESC');
        res.json(result.rows);
    } catch (err) {
        console.error('Error al obtener citas:', err.message);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});


// Inicialización del Servidor
app.listen(PORT, () => {
    console.log(`✅ Servidor Express corriendo en http://localhost:${PORT}`);
});