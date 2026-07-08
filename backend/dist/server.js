"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const socket_1 = require("./socket");
const db_1 = require("./db");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
app.use((0, cors_1.default)({
    origin: '*', // In production, replace with specific frontend URL
    methods: ['GET', 'POST'],
}));
app.use(express_1.default.json());
app.get('/health', (req, res) => {
    res.json({ status: 'ok', time: new Date() });
});
// Create Socket.io server
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});
(0, socket_1.setupSocketHandlers)(io);
const PORT = process.env.PORT || 3001;
async function start() {
    try {
        // Basic DB connection test
        await db_1.prisma.$connect();
        console.log('Database connected successfully.');
        server.listen(PORT, () => {
            console.log(`Backend server running on port ${PORT}`);
        });
    }
    catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
}
start();
