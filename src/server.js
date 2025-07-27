require('dotenv').config();
const authRoute = require('./routes/authRoute');
const inventoryRoutes = require('./routes/inventoryRoutes');
// const fishTypeRoute = require('./routes/fishTypeRoute.js');
const middlewareLogRequest = require('./middleware/logs.js');
const multer = require('multer');

const PORT = process.env.PORT || 5000;
const express = require('express');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const upload = multer();
app.use(upload.none());
app.use(middlewareLogRequest);


app.use('/auth', authRoute);
// app.use('/fish', fishTypeRoute);
app.use('/inventory', inventoryRoutes);
app.use('/uploads', express.static('uploads'));

app.get("/", (req, res, next) => {
    res.json({
        message: 'Service is Up'
    });
});

app.use((err, req, res, next) => {
    res.json({
        message: err.message
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
});