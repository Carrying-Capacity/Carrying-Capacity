import React from "react";

export default function InfoModal({ node, onClose }) {
    if (!node) return null;

    return (
        <div
            style={{
                position: "absolute",
                top: "100px",
                right: "50px",
                background: "white",
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "1rem",
                zIndex: 10,
                boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                width: "15vw",
            }}
        >
            <h3>{node.label}</h3>

            <p>Type: {node.type}</p>
            {node.type === "house" && (
                <>
                    <p>House ID: {node.HouseID}</p>
                    <p>Predicted Phase: {node.predicted_phase}</p>
                    <p>Solar: {node.solar ? "Yes" : "No"}</p>
                    <p>Parent Transformer: {node.parent}</p>
                </>
                )}
            {node.type === "transformer" && (
                <>
                    <p>Transformer Phase Distribution: </p>
                    <p>Transformer Power Draw:</p>
                    <p>Transformer Phase Power Distribution: </p>
                </>
            )}
            <button
                onClick={onClose}
                style={{
                    marginTop: "1rem",
                    padding: "0.25rem 0.5rem",
                    cursor: "pointer",
                }}
            >
                Close
            </button>
        </div>
    );
}
