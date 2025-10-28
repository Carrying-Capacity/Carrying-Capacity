import React, { useState } from "react";

// ✅ Example: assumes your images are stored in /public/images/
const imageList = [
  { name: "Transformer 1", path: `./msts/transformer_mst (1).jpg` },
  { name: "Transformer 2", path: `./msts/transformer_mst (2).jpg` },
  { name: "Transformer 3", path: `./msts/transformer_mst (3).jpg` },
  { name: "Transformer 4", path: `./msts/transformer_mst (4).jpg` },
  { name: "Transformer 5", path: `./msts/transformer_mst (5).jpg` },
  { name: "Transformer 6", path: `./msts/transformer_mst (6).jpg` },
  { name: "Transformer 7", path: `./msts/transformer_mst (7).jpg` },
  { name: "Transformer 8", path: `./msts/transformer_mst (8).jpg` },
  { name: "Transformer 9", path: `./msts/transformer_mst (9).jpg` },
  { name: "Transformer 10", path: `./msts/transformer_mst (10).jpg` },
  { name: "Transformer 11", path: `./msts/transformer_mst (11).jpg` },
  { name: "Transformer 12", path: `./msts/transformer_mst (12).jpg` },
  { name: "Transformer 13", path: `./msts/transformer_mst (13).jpg` },
  { name: "Transformer 14", path: `./msts/transformer_mst (14).jpg` },
  { name: "Transformer 15", path: `./msts/transformer_mst (15).jpg` },
  { name: "Transformer 16", path: `./msts/transformer_mst (16).jpg` },
];

const MSTTopologySelector = () => {
  const [selectedImage, setSelectedImage] = useState(imageList[0].path);

  return (
    <div className="flex flex-col items-center gap-4 p-4 bg-white shadow rounded-lg w-[80%] mx-auto">
      {/* Dropdown Menu */}
      <select
        value={selectedImage}
        onChange={(e) => setSelectedImage(e.target.value)}
        className="border rounded p-2 w-full text-gray-700"
      >
        {imageList.map((img) => (
          <option key={img.path} value={img.path}>
            {img.name}
          </option>
        ))}
      </select>

      {/* Display Image */}
      <div className="w-full flex items-center justify-center border rounded bg-gray-50 overflow-hidden">
        <img
          src={selectedImage}
          alt="Selected MST"
          className="max-h-full max-w-full object-contain"
        />
      </div>
    </div>
  );
};

export default MSTTopologySelector;
