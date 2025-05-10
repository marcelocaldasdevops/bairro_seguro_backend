"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const app_1 = require("./app");
const db_1 = require("./config/db");
const server = http_1.default.createServer(app_1.app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "http://localhost:3001",
        methods: ["GET", "POST"]
    }
});
// Socket.io connection
io.on('connection', (socket) => {
    console.log('New client connected');
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    // Test DB connection
    db_1.pool.query('SELECT NOW()', (err, res) => {
        if (err) {
            console.error('Error connecting to database:', err);
        }
        else {
            console.log('Database connected successfully:', res.rows[0]);
        }
    });
});
