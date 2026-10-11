require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const errorHandler = require('./middleware/errorHandler');
const itemsRoutes = require('./routes/items.routes');
const usersRoutes = require('./routes/users.routes');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/items', itemsRoutes);
app.use('/api/users', usersRoutes);

app.use('/api/auth', authRoutes);

app.use(errorHandler);

connectDB().then(() => {
  app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));
});