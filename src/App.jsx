import React, { useState } from "react";
import Navbar from "./components/Navbar";
import TransformerGraph from "./components/TransformerGraph";

export default function App() {
    const [transformer, setTransformer] = useState("");

    return (
        <>
            <Navbar transformer={transformer} setTransformer={setTransformer} />
            <TransformerGraph transformer={transformer} />
        </>
    );
}
