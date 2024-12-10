import React from 'react';

export default function Toolbar({ tool, setTool, color, setColor, onClear }) {
    return (
        <div style={{ marginBottom: '10px', display: 'flex', gap: '10px', alignItems: 'center' }}>
            <label>Tool:</label>
            <select value={tool} onChange={e => setTool(e.target.value)}>
                <option value="pen">Pen</option>
                <option value="rect">Rectangle</option>
                <option value="text">Text</option>
            </select>

            <label>Color:</label>
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />

            <button onClick={onClear}>Clear Whiteboard</button>
        </div>
    );
}
