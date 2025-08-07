const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config({ path: './config/config.env' });

const app = express();
app.use(cors());


app.use(express.json());

const PORT = process.env.SERVER_PORT || 5000;

app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));

const amazonRoutes = require('./routes/amazonRoutes');

//http://localhost:3000/api/scrape
app.use('/api/', amazonRoutes);