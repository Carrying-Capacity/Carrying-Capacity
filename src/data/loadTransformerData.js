export async function loadTransformerData(transformerFile) {
    const response = await fetch(`/data/${transformerFile}`);
    const jsonData = await response.json();

    // Convert to nodes
    const nodes = jsonData.map((node) => ({
        id: node.id,
        x: node.x_meters,
        y: node.y_meters,
        type: node.type.toLowerCase(),
        ...node // keep all other fields for modal
    }));

    // Convert next_nodes / prev_nodes to links
    const links = [];
    jsonData.forEach((node) => {
        node.next_nodes.forEach((nextId) => {
            links.push({
                source: node.id,
                target: nextId
            });
        });
    });

    // Add grid node as root
    nodes.unshift({ id: "grid1", type: "grid", name: "Main Grid", x: 0, y: 0 });
    links.unshift({ source: "grid1", target: nodes[1].id }); // link grid to first transformer

    return { nodes, links };
}
