import express from "express";
import apiRoutes from './routes/apiRoutes.js';
const app = express();
const PORT = 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.send('Hello');
});

app.use('/api', apiRoutes)

app.listen(PORT, () => console.log("Server running on port " + PORT));
