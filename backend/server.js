import express from 'express';
import http from 'node:http';
import { Server } from 'socket.io';
import cors from 'cors';
import Redis from 'ioredis';

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

// Connect to local Redis for testing to - to change
const redis = new Redis({ host: 'localhost', port: 6379 });
const subscriber = new Redis({ host: 'localhost', port: 6379 });

subscriber.subscribe('whiteboard_updates');

subscriber.on('message', (channel, message) => {
    if (channel === 'whiteboard_updates') {
        const payload = JSON.parse(message);
        if (payload.type === 'clear') {
            io.emit('clear_update');
        } else {
            io.emit('draw_update', payload);
        }
    }
});

app.get('/api/whiteboard', async (req, res) => {
    const items = await redis.lrange('whiteboard_items', 0, -1);
    const parsedItems = items.map(i => JSON.parse(i));
    res.json(parsedItems);
});

io.on('connection', (socket) => {
    console.log('Client connected');

    socket.on('draw', async (item) => {
        // 'item' can be pen, rect, text, etc.
        await redis.rpush('whiteboard_items', JSON.stringify(item));
        await redis.publish('whiteboard_updates', JSON.stringify(item));
    });

    socket.on('clear', async () => {
        await redis.del('whiteboard_items');
        redis.publish('whiteboard_updates', JSON.stringify({ type: 'clear' }));
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

const port = process.env.PORT || 8080;
server.listen(port, () => {
    console.log(`Backend server running on port ${port}`);
});
