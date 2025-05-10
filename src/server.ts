import http from 'http';
import { Server } from 'socket.io';
import { app } from './app';
import { pool } from './config/db';

const server = http.createServer(app);
const io = new Server(server, {
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
    pool.query('SELECT NOW()', (err, res) => {
        if (err) {
            console.error('Error connecting to database:', err);
        } else {
            console.log('Database connected successfully:', res.rows[0]);
        }
    });
});