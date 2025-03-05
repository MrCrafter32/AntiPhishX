const express = require("express");
const app = express();
const PORT = 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.send('Hello')
});

app.listen(PORT, () => console.log("Server running on port " + PORT));