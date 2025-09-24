import React from "react";

export default function Navbar({ transformer, setTransformer }) {
    const transformerOptions = Array.from({ length: 17 }, (_, i) => i + 1);

    return (
        <div className="navbar">
            <h1>Phase Identification</h1>
            <select
                value={transformer}
                onChange={(e) => setTransformer(Number(e.target.value))}
            >
                <option value="">Select Transformer</option>
                {transformerOptions.map((t) => (
                    <option key={t} value={t}>
                        Transformer {t}
                    </option>
                ))}
            </select>
        </div>
    );
}
