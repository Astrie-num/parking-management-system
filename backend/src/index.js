require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes');
const logRoutes = require('./routes/logRoutes');
const parkingRoutes = require('./routes/parkingRoutes');


const app = express();

app.use(cors());
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/auth', authRoutes);
app.use('/api/parking', parkingRoutes)
app.use('/api/users', userRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/parking', parkingRoutes);


const PORT = process.env.PORT || 5000;
const host = process.env.DB_HOST;
app.listen(PORT, () => console.log(`Server running on http://${host}:${PORT}`));