"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { ZoomIn, ZoomOut, RotateCcw, Share2 } from "lucide-react";
import { useNovelTeaStore } from "@/stores/noveltea-store";
import { getTranslations } from "@/lib/i18n";

/* ═══════════════════════════════════════════════════════════
 * GraphView — Obsidian-style interactive knowledge graph
 * Force-directed SVG layout of entities, chapters, locations
 * ═══════════════════════════════════════════════════════════ */

interface GraphNode {
  id: string;
  label: string;
  group: "chapter" | "character" | "location" | "organization" | "artifact" | "lore";
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

interface GraphEdge {
  source: string;
  target: string;
  label?: string;
}

const GROUP_COLORS: Record<string, string> = {
  chapter: "#f59e0b",
  character: "#60a5fa",
  location: "#34d399",
  organization: "#f97316",
  artifact: "#c084fc",
  lore: "#fb7185",
};

export default function GraphView() {
  const { entities, chapters, settings } = useNovelTeaStore();
  const t = getTranslations(settings.language || "de");

  const [showChapters, setShowChapters] = useState(true);
  const [showCharacters, setShowCharacters] = useState(true);
  const [showLocations, setShowLocations] = useState(true);
  const [showOrganizations, setShowOrganizations] = useState(true);
  const [showConnections, setShowConnections] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState<string | null>(null);
  const [panning, setPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);
  const nodesRef = useRef<GraphNode[]>([]);
  const [, forceRender] = useState(0);
  const animRef = useRef<number>(0);

  // Build nodes & edges from data
  const { initialNodes, edges } = useMemo(() => {
    const nodes: GraphNode[] = [];
    const edgeList: GraphEdge[] = [];
    const cx = 400, cy = 300;

    // Chapters
    if (showChapters) {
      chapters.forEach((ch, i) => {
        const angle = (i / Math.max(chapters.length, 1)) * Math.PI * 2;
        nodes.push({
          id: `ch_${ch.id}`, label: ch.title || `Kapitel ${ch.order + 1}`, group: "chapter",
          x: cx + Math.cos(angle) * 200 + (Math.random() - 0.5) * 40,
          y: cy + Math.sin(angle) * 200 + (Math.random() - 0.5) * 40,
          vx: 0, vy: 0, radius: 18,
        });
        // Link chapters to entities referenced in scenes
        ch.scenes.forEach((scene) => {
          (scene.entityIds || []).forEach((eid) => {
            edgeList.push({ source: `ch_${ch.id}`, target: `ent_${eid}` });
          });
          if (scene.pov) edgeList.push({ source: `ch_${ch.id}`, target: `ent_${scene.pov}` });
          if (scene.location) edgeList.push({ source: `ch_${ch.id}`, target: `ent_${scene.location}` });
        });
      });
    }

    // Entities
    entities.forEach((ent, i) => {
      if (ent.entityType === "character" && !showCharacters) return;
      if (ent.entityType === "location" && !showLocations) return;
      if (ent.entityType === "organization" && !showOrganizations) return;
      const angle = (i / Math.max(entities.length, 1)) * Math.PI * 2 + 0.3;
      nodes.push({
        id: `ent_${ent.id}`, label: ent.name, group: ent.entityType,
        x: cx + Math.cos(angle) * 150 + (Math.random() - 0.5) * 60,
        y: cy + Math.sin(angle) * 150 + (Math.random() - 0.5) * 60,
        vx: 0, vy: 0, radius: 14,
      });
      // Entity links
      (ent.links || []).forEach((link) => {
        edgeList.push({ source: `ent_${ent.id}`, target: `ent_${link.targetId}`, label: link.label });
      });
    });

    return { initialNodes: nodes, edges: edgeList };
  }, [entities, chapters, showChapters, showCharacters, showLocations, showOrganizations]);

  // Initialize simulation nodes
  useEffect(() => {
    nodesRef.current = initialNodes.map((n) => ({ ...n }));
    forceRender((c) => c + 1);
  }, [initialNodes]);

  // Force-directed simulation loop
  useEffect(() => {
    let running = true;
    let iter = 0;
    const maxIter = 300;

    const tick = () => {
      if (!running || iter > maxIter) return;
      const nodes = nodesRef.current;
      const alpha = Math.max(0.01, 1 - iter / maxIter) * 0.3;

      // Repulsion between all nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x;
          const dy = nodes[j].y - nodes[i].y;
          const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
          const force = (800 / (dist * dist)) * alpha;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          nodes[i].vx -= fx;
          nodes[i].vy -= fy;
          nodes[j].vx += fx;
          nodes[j].vy += fy;
        }
      }

      // Attraction along edges
      const nodeMap = new Map(nodes.map((n) => [n.id, n]));
      edges.forEach((e) => {
        const a = nodeMap.get(e.source);
        const b = nodeMap.get(e.target);
        if (!a || !b) return;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
        const force = (dist - 120) * 0.005 * alpha;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        a.vx += fx;
        a.vy += fy;
        b.vx -= fx;
        b.vy -= fy;
      });

      // Center gravity
      nodes.forEach((n) => {
        n.vx += (400 - n.x) * 0.001 * alpha;
        n.vy += (300 - n.y) * 0.001 * alpha;
      });

      // Apply velocity with damping
      nodes.forEach((n) => {
        n.vx *= 0.85;
        n.vy *= 0.85;
        if (n.id !== dragging) {
          n.x += n.vx;
          n.y += n.vy;
        }
      });

      iter++;
      forceRender((c) => c + 1);
      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
    return () => {
      running = false;
      cancelAnimationFrame(animRef.current);
    };
  }, [initialNodes, edges, dragging]);

  const nodes = nodesRef.current;
  const nodeMap = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  // Deduplicate edges
  const uniqueEdges = useMemo(() => {
    const seen = new Set<string>();
    return edges.filter((e) => {
      const key = [e.source, e.target].sort().join("|");
      if (seen.has(key)) return false;
      seen.add(key);
      return nodeMap.has(e.source) && nodeMap.has(e.target);
    });
  }, [edges, nodeMap]);

  // Drag
  const onMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setDragging(nodeId);
  }, []);

  const onSvgMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === svgRef.current || (e.target as SVGElement).tagName === "svg") {
      setPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [pan]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (dragging) {
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const x = (e.clientX - rect.left - pan.x) / zoom;
      const y = (e.clientY - rect.top - pan.y) / zoom;
      const node = nodesRef.current.find((n) => n.id === dragging);
      if (node) {
        node.x = x;
        node.y = y;
        node.vx = 0;
        node.vy = 0;
        forceRender((c) => c + 1);
      }
    } else if (panning) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    }
  }, [dragging, panning, panStart, zoom, pan]);

  const onMouseUp = useCallback(() => {
    setDragging(null);
    setPanning(false);
  }, []);

  const resetView = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  const nodeCount = nodes.length;
  const edgeCount = uniqueEdges.length;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "20px 24px 0", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <Share2 size={18} style={{ color: "var(--primary)" }} />
          <h1 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>{t.graph.title}</h1>
        </div>
        <p style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 12 }}>{t.graph.subtitle}</p>

        {/* Controls */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
          <FilterPill label={t.graph.showChapters} active={showChapters} color={GROUP_COLORS.chapter} onClick={() => setShowChapters(!showChapters)} />
          <FilterPill label={t.graph.showCharacters} active={showCharacters} color={GROUP_COLORS.character} onClick={() => setShowCharacters(!showCharacters)} />
          <FilterPill label={t.graph.showLocations} active={showLocations} color={GROUP_COLORS.location} onClick={() => setShowLocations(!showLocations)} />
          <FilterPill label={t.graph.showOrganizations} active={showOrganizations} color={GROUP_COLORS.organization} onClick={() => setShowOrganizations(!showOrganizations)} />
          <div style={{ width: 1, height: 20, background: "var(--border)", margin: "0 4px" }} />
          <FilterPill label={t.graph.showConnections} active={showConnections} color="var(--text-secondary)" onClick={() => setShowConnections(!showConnections)} />
          <div style={{ flex: 1 }} />
          <button className="btn-ghost" onClick={() => setZoom((z) => Math.min(z * 1.2, 4))} title={t.graph.zoomIn}><ZoomIn size={14} /></button>
          <button className="btn-ghost" onClick={() => setZoom((z) => Math.max(z / 1.2, 0.3))} title={t.graph.zoomOut}><ZoomOut size={14} /></button>
          <button className="btn-ghost" onClick={resetView} title={t.graph.resetView}><RotateCcw size={14} /></button>
          <span style={{ fontSize: 11, color: "var(--text-dim)" }}>
            {nodeCount} {t.graph.nodes} · {edgeCount} {t.graph.connections}
          </span>
        </div>
      </div>

      {/* SVG Canvas */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden", background: "var(--bg-secondary)", borderTop: "1px solid var(--border)" }}>
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          style={{ cursor: panning ? "grabbing" : dragging ? "crosshair" : "grab" }}
          onMouseDown={onSvgMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        >
          <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
            {/* Edges */}
            {showConnections && uniqueEdges.map((e, i) => {
              const a = nodeMap.get(e.source);
              const b = nodeMap.get(e.target);
              if (!a || !b) return null;
              const isHighlighted = hoveredNode === e.source || hoveredNode === e.target;
              return (
                <line
                  key={i}
                  x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                  stroke={isHighlighted ? "var(--text-secondary)" : "var(--border)"}
                  strokeWidth={isHighlighted ? 2 : 1}
                  strokeOpacity={isHighlighted ? 0.9 : 0.4}
                />
              );
            })}

            {/* Nodes */}
            {nodes.map((node) => {
              const isHovered = hoveredNode === node.id;
              const color = GROUP_COLORS[node.group] || "#888";
              return (
                <g
                  key={node.id}
                  style={{ cursor: "pointer" }}
                  onMouseDown={(e) => onMouseDown(e, node.id)}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                >
                  <circle
                    cx={node.x} cy={node.y} r={isHovered ? node.radius + 3 : node.radius}
                    fill={color}
                    fillOpacity={isHovered ? 0.9 : 0.7}
                    stroke={isHovered ? "#fff" : "none"}
                    strokeWidth={2}
                  />
                  <text
                    x={node.x} y={node.y + node.radius + 14}
                    textAnchor="middle"
                    fill="var(--text-secondary)"
                    fontSize={isHovered ? 12 : 10}
                    fontWeight={isHovered ? 600 : 400}
                    pointerEvents="none"
                  >
                    {node.label.length > 18 ? node.label.slice(0, 16) + "…" : node.label}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Legend */}
        <div style={{
          position: "absolute", bottom: 12, left: 12,
          background: "var(--bg-primary)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)", padding: "8px 12px",
          display: "flex", gap: 12, fontSize: 11, color: "var(--text-dim)",
        }}>
          {Object.entries(GROUP_COLORS).map(([group, color]) => (
            <span key={group} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, display: "inline-block" }} />
              {group.charAt(0).toUpperCase() + group.slice(1)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function FilterPill({ label, active, color, onClick }: { label: string; active: boolean; color: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "4px 10px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 500,
        cursor: "pointer",
        transition: "all 0.15s",
        background: active ? `${color}20` : "transparent",
        border: `1px solid ${active ? color : "var(--border)"}`,
        color: active ? color : "var(--text-dim)",
      }}
    >
      {label}
    </button>
  );
}
