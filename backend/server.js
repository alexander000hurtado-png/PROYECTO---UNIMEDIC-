const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 🔗 Conexión PostgreSQL
const db = new Pool({
  host: "localhost",
  user: "postgres",       // 👈 Tu usuario
  password: "1234", // 👈 Cambia por tu contraseña real
  database: "Unimedic.IPS",
  port: 5432
});

db.connect()
  .then(() => console.log("✅ Conectado a PostgreSQL (unimedic)"))
  .catch(err => console.error("❌ Error al conectar con la BD:", err));

// =======================================================
// 📌 MÉDICOS
// =======================================================
app.post("/medicos", async (req, res) => {
  try {
    const { id, nombre, especialidad, registro, correo, tel, disponibilidad } = req.body;
    await db.query(
      "INSERT INTO medicos (id, nombre, especialidad, registro, correo, tel, disponibilidad) VALUES ($1,$2,$3,$4,$5,$6,$7)",
      [id, nombre, especialidad, registro, correo, tel, disponibilidad]
    );
    res.json({ message: "✅ Médico registrado correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/medicos", async (req, res) => {
  const result = await db.query("SELECT * FROM medicos ORDER BY nombre ASC");
  res.json(result.rows);
});

// =======================================================
// 📌 PACIENTES
// =======================================================
app.post("/pacientes", async (req, res) => {
  try {
    const { id, nombre, fecha_nacimiento, correo, tel, direccion } = req.body;
    await db.query(
      "INSERT INTO pacientes (id, nombre, fecha_nacimiento, correo, tel, direccion) VALUES ($1,$2,$3,$4,$5,$6)",
      [id, nombre, fecha_nacimiento, correo, tel, direccion]
    );
    res.json({ message: "✅ Paciente registrado correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/pacientes", async (req, res) => {
  const result = await db.query("SELECT * FROM pacientes ORDER BY nombre ASC");
  res.json(result.rows);
});

// =======================================================
// 📌 CITAS
// =======================================================
app.post("/citas", async (req, res) => {
  try {
    const { paciente_id, medico_id, especialidad, fecha, hora } = req.body;
    await db.query(
      "INSERT INTO citas (paciente_id, medico_id, especialidad, fecha, hora) VALUES ($1,$2,$3,$4,$5)",
      [paciente_id, medico_id, especialidad, fecha, hora]
    );
    res.json({ message: "✅ Cita registrada correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/citas", async (req, res) => {
  const result = await db.query(`
    SELECT c.id, p.nombre AS paciente, m.nombre AS medico, c.especialidad, c.fecha, c.hora, c.estado
    FROM citas c
    JOIN pacientes p ON c.paciente_id = p.id
    JOIN medicos m ON c.medico_id = m.id
    ORDER BY c.fecha ASC
  `);
  res.json(result.rows);
});

app.put("/citas/:id/cancelar", async (req, res) => {
  await db.query("UPDATE citas SET estado='Cancelada' WHERE id=$1", [req.params.id]);
  res.json({ message: "✅ Cita cancelada" });
});

// =======================================================
// 🚀 Servidor
// =======================================================
const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`));


