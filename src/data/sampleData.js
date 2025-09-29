// src/data/sampleData.js
export default {
    nodes: [
        { id: "grid1", type: "grid", name: "Main Grid" },
        { id: "t1", type: "transformer", name: "Transformer 1" },
        { id: "t2", type: "transformer", name: "Transformer 2" },
        { id: "h1", type: "house", name: "House 1" },
        { id: "h2", type: "house", name: "House 2" },
        { id: "h3", type: "house", name: "House 3" },
    ],
    links: [
        { source: "grid1", target: "t1" },
        { source: "grid1", target: "t2" },
        { source: "t1", target: "h1" },
        { source: "t1", target: "h2" },
        { source: "t2", target: "h3" },
    ],
};
