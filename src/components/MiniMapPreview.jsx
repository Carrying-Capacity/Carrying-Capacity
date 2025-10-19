import React, { memo, useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Maximize2, Zap, Activity } from "lucide-react";
import { useTransformerData } from "../hooks/useTransformerData";

const MiniMapPreview = memo(() => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const data = useTransformerData();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data?.nodes?.length) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "rgba(15, 23, 42, 0.8)");
    gradient.addColorStop(1, "rgba(30, 41, 59, 0.8)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Find bounds
    const xCoords = data.nodes.map(n => n.x || 0);
    const yCoords = data.nodes.map(n => n.y || 0);
    const minX = Math.min(...xCoords);
    const maxX = Math.max(...xCoords);
    const minY = Math.min(...yCoords);
    const maxY = Math.max(...yCoords);

    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;
    const padding = 20;

    // Scale to fit canvas
    const scaleX = (width - padding * 2) / rangeX;
    const scaleY = (height - padding * 2) / rangeY;
    const scale = Math.min(scaleX, scaleY);

    // Draw links first (background)
    ctx.strokeStyle = "rgba(148, 163, 184, 0.2)";
    ctx.lineWidth = 1;
    data.links?.forEach(link => {
      const source = data.nodes.find(n => n.id === link.source || n.id === link.source?.id);
      const target = data.nodes.find(n => n.id === link.target || n.id === link.target?.id);
      
      if (source && target) {
        const x1 = padding + (source.x - minX) * scale;
        const y1 = padding + (source.y - minY) * scale;
        const x2 = padding + (target.x - minX) * scale;
        const y2 = padding + (target.y - minY) * scale;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    });

    // Draw nodes
    data.nodes.forEach(node => {
      const x = padding + (node.x - minX) * scale;
      const y = padding + (node.y - minY) * scale;

      ctx.beginPath();
      
      if (node.type === "feeder") {
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fillStyle = "#3b82f6";
        ctx.fill();
        ctx.strokeStyle = "#60a5fa";
        ctx.lineWidth = 2;
        ctx.stroke();
      } else if (node.type === "transformer") {
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fillStyle = "#8b5cf6";
        ctx.fill();
      } else if (node.type === "house") {
        ctx.arc(x, y, 1.5, 0, 2 * Math.PI);
        const phaseColors = {
          A: "#ef4444",
          B: "#10b981",
          C: "#3b82f6",
          default: "#94a3b8"
        };
        ctx.fillStyle = phaseColors[node.predicted_phase] || phaseColors.default;
        ctx.fill();
      }
    });

    // Add glow effect on hover
    if (isHovered) {
      ctx.strokeStyle = "rgba(59, 130, 246, 0.5)";
      ctx.lineWidth = 3;
      ctx.strokeRect(0, 0, width, height);
    }
  }, [data, isHovered]);

  const handleClick = () => {
    navigate("/transformer");
  };

  return (
    <div 
      className="mini-map-container"
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="mini-map-header">
        <div className="mini-map-title">
          <Activity size={20} />
          <span>Network Visualization</span>
        </div>
        <div className="mini-map-badge">
          <Zap size={14} />
          <span>Live</span>
        </div>
      </div>
      
      <div className="mini-map-canvas-wrapper">
        <canvas
          ref={canvasRef}
          width={400}
          height={300}
          className="mini-map-canvas"
        />
        <div className="mini-map-overlay">
          <div className="mini-map-overlay-content">
            <Maximize2 size={32} />
            <span>Click to explore full map</span>
          </div>
        </div>
      </div>

      <div className="mini-map-stats">
        <div className="mini-map-stat">
          <span className="mini-map-stat-value">{data?.nodes?.filter(n => n.type === "house").length || 0}</span>
          <span className="mini-map-stat-label">Houses</span>
        </div>
        <div className="mini-map-stat">
          <span className="mini-map-stat-value">{data?.nodes?.filter(n => n.type === "transformer").length || 0}</span>
          <span className="mini-map-stat-label">Transformers</span>
        </div>
        <div className="mini-map-stat">
          <span className="mini-map-stat-value">{data?.links?.length || 0}</span>
          <span className="mini-map-stat-label">Connections</span>
        </div>
      </div>
    </div>
  );
});

MiniMapPreview.displayName = "MiniMapPreview";

export default MiniMapPreview;
