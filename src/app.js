require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const pool = require('./config/db');
const productoRoutes = require('./routes/producto.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('API backendUpb funcionando');
});

app.use('/api/productos', productoRoutes);

// Ruta no encontrada
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejador de errores: HttpError usa su status, cualquier otro error es 500
app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ error: 'JSON inválido' });
    }
    if (err.status) {
        return res.status(err.status).json({ error: err.message });
    }
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
});

const port = process.env.PORT || 3000;

// Crea la tabla si no existe (el plan gratuito de Render no tiene Shell para db:init)
const schema = fs.readFileSync(path.join(__dirname, 'db', 'schema.sql'), 'utf8');

pool.query(schema)
    .catch((err) => console.error('No se pudo inicializar la tabla', err.message))
    .finally(() => {
        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });
    });
