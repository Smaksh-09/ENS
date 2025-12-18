"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { Plus, Loader2 } from "lucide-react";

// Dynamically import ForceGraph2D to avoid SSR issues
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
    </div>
  ),
});

type GraphNode = {
  id: string;
  ensName: string;
  metadata: Record<string, unknown>;
  x?: number;
  y?: number;
};

type GraphLink = {
  id: string;
  source: string;
  target: string;
};

type GraphData = {
  nodes: GraphNode[];
  links: GraphLink[];
};

type NetworkGraphProps = {
  onNodeClick?: (ensName: string) => void;
};

export function NetworkGraph({ onNodeClick }: NetworkGraphProps) {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [sourceEns, setSourceEns] = useState("");
  const [targetEns, setTargetEns] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Fetch graph data on mount
  const fetchGraphData = useCallback(async () => {
    try {
      const res = await fetch("/api/graph");
      if (!res.ok) throw new Error("Failed to fetch graph data");
      const data = await res.json();
      setGraphData(data);
    } catch (err) {
      console.error("Error fetching graph:", err);
      setError("Failed to load graph data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGraphData();
  }, [fetchGraphData]);

  // Handle container resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: rect.width,
          height: rect.height,
        });
      }
    };

    // Initial update with a slight delay to ensure layout is ready
    const timeout = setTimeout(updateDimensions, 100);
    
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    window.addEventListener("orientationchange", updateDimensions);
    
    return () => {
      clearTimeout(timeout);
      window.removeEventListener("resize", updateDimensions);
      window.removeEventListener("orientationchange", updateDimensions);
    };
  }, []);

  // Handle form submission to add new connection
  const handleAddConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceEns.trim() || !targetEns.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/graph", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceEns: sourceEns.trim().toLowerCase(),
          targetEns: targetEns.trim().toLowerCase(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create connection");
      }

      // Refresh graph data
      await fetchGraphData();
      setSourceEns("");
      setTargetEns("");
      setIsFormOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add connection");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="glass-strong rounded-2xl border-primary/30 p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary glow-cyan" />
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative h-full w-full">
      {/* Graph Canvas */}
      <ForceGraph2D
        graphData={graphData}
        width={dimensions.width}
        height={dimensions.height}
        nodeRelSize={6}
        nodeCanvasObjectMode={() => "replace"}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const label = (node as GraphNode).ensName;
          const fontSize = 13 / globalScale;
          const nodeRadius = 6;
          const x = node.x as number;
          const y = node.y as number;
          
          if (x === undefined || y === undefined) return;

          // Outer glow (largest)
          const gradient1 = ctx.createRadialGradient(x, y, 0, x, y, nodeRadius * 3);
          gradient1.addColorStop(0, "rgba(0, 240, 255, 0.2)");
          gradient1.addColorStop(0.5, "rgba(0, 240, 255, 0.05)");
          gradient1.addColorStop(1, "transparent");
          ctx.fillStyle = gradient1;
          ctx.beginPath();
          ctx.arc(x, y, nodeRadius * 3, 0, 2 * Math.PI);
          ctx.fill();

          // Middle glow
          const gradient2 = ctx.createRadialGradient(x, y, 0, x, y, nodeRadius * 1.5);
          gradient2.addColorStop(0, "rgba(0, 240, 255, 0.6)");
          gradient2.addColorStop(1, "rgba(0, 240, 255, 0.1)");
          ctx.fillStyle = gradient2;
          ctx.beginPath();
          ctx.arc(x, y, nodeRadius * 1.5, 0, 2 * Math.PI);
          ctx.fill();

          // Core node
          const coreGradient = ctx.createRadialGradient(x, y, 0, x, y, nodeRadius);
          coreGradient.addColorStop(0, "#ffffff");
          coreGradient.addColorStop(0.5, "#00f0ff");
          coreGradient.addColorStop(1, "#627EEA");
          ctx.fillStyle = coreGradient;
          ctx.beginPath();
          ctx.arc(x, y, nodeRadius, 0, 2 * Math.PI);
          ctx.fill();

          // Inner highlight
          ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
          ctx.beginPath();
          ctx.arc(x - 1, y - 1, nodeRadius * 0.4, 0, 2 * Math.PI);
          ctx.fill();

          // Label
          if (label) {
            ctx.font = `600 ${fontSize}px Inter, sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            
            // Label shadow
            ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
            ctx.fillText(label, x, y + nodeRadius + fontSize + 3);
            
            // Label text
            ctx.fillStyle = "#ffffff";
            ctx.fillText(label, x, y + nodeRadius + fontSize + 2);
          }
        }}
        nodePointerAreaPaint={(node, color, ctx) => {
          const x = node.x as number;
          const y = node.y as number;
          if (x === undefined || y === undefined) return;
          ctx.beginPath();
          ctx.arc(x, y, 12, 0, 2 * Math.PI);
          ctx.fillStyle = color;
          ctx.fill();
        }}
        onNodeClick={(node) => {
          console.log("Clicked node:", node);
          const graphNode = node as GraphNode;
          if (onNodeClick && graphNode.ensName) {
            console.log("Calling onNodeClick with:", graphNode.ensName);
            onNodeClick(graphNode.ensName);
          }
        }}
        linkColor={() => "rgba(255, 255, 255, 0.15)"}
        linkWidth={1.5}
        linkDirectionalParticles={3}
        linkDirectionalParticleWidth={3}
        linkDirectionalParticleColor={() => "#00f0ff"}
        linkDirectionalParticleSpeed={0.006}
        backgroundColor="transparent"
        cooldownTicks={100}
        enablePanInteraction={true}
        enableZoomInteraction={true}
        enableNodeDrag={true}
        d3VelocityDecay={0.3}
      />

      {/* Empty state */}
      {graphData.nodes.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="glass-strong rounded-2xl border-white/15 p-8 text-center">
            <div className="mb-4 text-6xl opacity-30">◯</div>
            <p className="text-lg font-semibold tracking-tight text-white">No connections yet</p>
            <p className="mt-2 text-sm text-muted-foreground">Add ENS names to build your network</p>
          </div>
        </div>
      )}

      {/* Add Connection Button */}
      <button
        onClick={() => setIsFormOpen(true)}
        className="glass-strong glow-cyan fixed right-4 top-20 z-50 flex items-center gap-2 rounded-lg border-primary/30 px-3 py-2 text-sm font-semibold text-white shadow-2xl transition-all hover:bg-primary/20 hover:border-primary/50 md:absolute md:right-6 md:top-6 md:px-4 md:py-2.5"
      >
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">Add Connection</span>
        <span className="sm:hidden">Add</span>
      </button>

      {/* Add Connection Form Overlay */}
      {isFormOpen && (
        <div className="glass-strong fixed inset-x-4 top-32 z-[60] w-auto rounded-xl border-white/15 p-4 shadow-2xl md:absolute md:inset-x-auto md:right-6 md:top-20 md:w-80 md:p-5">
          <h3 className="mb-4 text-lg font-semibold tracking-tight text-white">Add Connection</h3>
          <form onSubmit={handleAddConnection} className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Source ENS</label>
              <input
                type="text"
                value={sourceEns}
                onChange={(e) => setSourceEns(e.target.value)}
                placeholder="vitalik.eth"
                className="glass w-full rounded-lg border-white/15 bg-white/5 px-3 py-2.5 font-mono text-sm text-white placeholder-muted-foreground transition-all focus:border-primary focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-primary/30"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Target ENS</label>
              <input
                type="text"
                value={targetEns}
                onChange={(e) => setTargetEns(e.target.value)}
                placeholder="balajis.eth"
                className="glass w-full rounded-lg border-white/15 bg-white/5 px-3 py-2.5 font-mono text-sm text-white placeholder-muted-foreground transition-all focus:border-primary focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-primary/30"
                disabled={isSubmitting}
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsFormOpen(false);
                  setError(null);
                }}
                className="glass flex-1 rounded-lg border-white/15 px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-white/10 hover:text-white"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !sourceEns.trim() || !targetEns.trim()}
                className="glow-cyan flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary/20 border border-primary/30 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-primary/30 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-primary/20"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add"
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

