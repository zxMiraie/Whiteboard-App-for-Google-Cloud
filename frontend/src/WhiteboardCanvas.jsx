import React, { useRef, useEffect, useState } from 'react';

export default function WhiteboardCanvas({ items, onDraw, tool, color }) {
    const canvasRef = useRef(null);
    const [drawing, setDrawing] = useState(false);
    const [startPos, setStartPos] = useState(null);
    const [currentPos, setCurrentPos] = useState(null);

    useEffect(() => {
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        items.forEach(item => {
            drawItem(ctx, item);
        });


        if (drawing && tool === 'rect' && startPos && currentPos) {
            drawItem(ctx, {
                type: 'rect',
                x: startPos.x,
                y: startPos.y,
                x2: currentPos.x,
                y2: currentPos.y,
                color: color
            }, true); // preview
        }
    }, [items, drawing, startPos, currentPos, tool, color]);

    const drawItem = (ctx, item, preview = false) => {
        if (item.type === 'pen') {
            ctx.strokeStyle = item.color || '#000';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(item.x, item.y);
            ctx.lineTo(item.x2, item.y2);
            ctx.stroke();
        } else if (item.type === 'rect') {
            ctx.strokeStyle = item.color || '#000';
            ctx.lineWidth = 2;
            const x = Math.min(item.x, item.x2);
            const y = Math.min(item.y, item.y2);
            const width = Math.abs(item.x2 - item.x);
            const height = Math.abs(item.y2 - item.y);
            ctx.strokeRect(x, y, width, height);
        } else if (item.type === 'text') {
            ctx.font = "20px Arial";
            ctx.fillStyle = item.color || '#000';
            ctx.fillText(item.text, item.x, item.y);
        }
    };

    const getMousePos = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const handleMouseDown = (e) => {
        if (tool === 'text') {
            // For text, just place text at click position
            const pos = getMousePos(e);
            const userText = prompt("Enter text:");
            if (userText && userText.trim() !== "") {
                onDraw({ type: 'text', x: pos.x, y: pos.y, text: userText, color: color });
            }
            return;
        }

        const pos = getMousePos(e);
        setDrawing(true);
        setStartPos(pos);
        setCurrentPos(pos);
    };

    const handleMouseMove = (e) => {
        if (!drawing || tool === 'text') return;
        const pos = getMousePos(e);

        if (tool === 'pen') {

            onDraw({ type: 'pen', x: startPos.x, y: startPos.y, x2: pos.x, y2: pos.y, color });
            setStartPos(pos); // continuous line
        } else if (tool === 'rect') {
            setCurrentPos(pos);
        }
    };

    const handleMouseUp = () => {
        if (!drawing) return;
        if (tool === 'rect' && startPos && currentPos) {
            onDraw({ type: 'rect', x: startPos.x, y: startPos.y, x2: currentPos.x, y2: currentPos.y, color });
        }
        setDrawing(false);
        setStartPos(null);
        setCurrentPos(null);
    };

    return (
        <canvas
            ref={canvasRef}
            width={800}
            height={600}
            style={{ border: '1px solid #000', cursor: tool === 'text' ? 'text' : 'crosshair' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        />
    );
}
