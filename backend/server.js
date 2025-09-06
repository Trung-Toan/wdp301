const express = require('express');
const app = express();
const connectDB = require("./config/db");
const cors = require("cors");

// Cho phép frontend localhost:3000 truy cập
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
connectDB();

app.use("/api", require("./router/AutherRouter"));

app.get('/', async(req, res)=>{
    try {
        res.send({message: 'Welcome to WDP301!'});
    } catch (error) {
        res.send({error: error.message});
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));