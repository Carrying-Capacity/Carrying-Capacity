export async function loadTransformerData(filePath) {
    const response = await fetch(filePath);
    const rawData = await response.json();

    // Convert nodes
    const nodes = rawData.map((item) => ({
        id: item.id,
        type: item.type.toLowerCase(), // "Transformer" -> "transformer"
        name:
            item.type === "Transformer"
                ? `Transformer ${item.id.slice(0, 4)}`
                : `House ${item.HouseID ?? item.id.slice(0, 4)}`,
        solar: item.solar ?? null,
        predicted_phase: item.predicted_phase ?? null,
        x: item.x_meters,
        y: item.y_meters,
    }));

    // Convert links
    const links = [];
    rawData.forEach((item) => {
        if (item.next_nodes && item.next_nodes.length > 0) {
            item.next_nodes.forEach((target) => {
                links.push({
                    source: item.id,
                    target: target,
                });
            });
        }
    });

    return { nodes, links };
}
