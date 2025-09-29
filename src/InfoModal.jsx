import React from "react";

export default function InfoModal({ node, onClose, x, y }) {
    return (
        <div style={{
            position: "absolute",
            left: x + 15,  // offset to not overlap node
            top: y + 15,
            width: "220px",
            padding: "0.8rem",
            background: "white",
            border: "1px solid #ccc",
            borderRadius: "8px",
            boxShadow: "0 0 10px rgba(0,0,0,0.3)",
            pointerEvents: "auto",
            zIndex: 10
        }}>
            <button onClick={onClose} style={{ float: "right" }}>X</button>
            <h3>{node.id}</h3>
            <p>Type: {node.type}</p>
            {node.type === "house" && (
                <>
                    <p>Phase: {node.phase}</p>
                    <p>Voltage: {node.voltage} V</p>
                    <p>Owner: {node.owner}</p>
                </>
            )}
            {node.type === "transformer" && (
                <>
                    <p>Capacity: {node.capacity} kVA</p>
                    <p>Connected Houses: {node.connectedHouses.length}</p>
                </>
            )}
        </div>
    );
}
