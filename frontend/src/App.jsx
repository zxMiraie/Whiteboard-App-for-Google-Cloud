import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import WhiteboardCanvas from './WhiteboardCanvas.jsx';
import Toolbar from './Toolbar.jsx';

const socket = io('http://localhost:8080'); // Backend URL

export default function App() {
    const [items, setItems] = useState([]);
    const [tool, setTool] = useState('pen');   // pen | rect | text
    const [color, setColor] = useState('#000000');

    useEffect(() => {
        // Fetch initial state
        fetch('http://localhost:8080/api/whiteboard')
            .then(res => res.json())
            .then(data => setItems(data));

        // Listen for draw updates
        socket.on('draw_update', (item) => {
            setItems(prev => [...prev, item]);
        });

        // Listen for clear updates
        socket.on('clear_update', () => {
            setItems([]);
        });

        return () => {
            socket.off('draw_update');
            socket.off('clear_update');
        };
    }, []);

    const handleDraw = (newItem) => {
        // Emit draw item to backend
        socket.emit('draw', newItem);
    };

    const handleClear = () => {
        socket.emit('clear');
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
            <h1>Collaborative Whiteboard</h1>
            <Toolbar
                tool={tool}
                setTool={setTool}
                color={color}
                setColor={setColor}
                onClear={handleClear}
            />
            <WhiteboardCanvas items={items} onDraw={handleDraw} tool={tool} color={color} />
        </div>
    );
}
