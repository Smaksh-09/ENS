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
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
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
      <div className="flex h-full w-full items-center justify-center bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative h-full w-full bg-zinc-950">
      {/* Graph Canvas */}
      <ForceGraph2D
        graphData={graphData}
        width={dimensions.width}
        height={dimensions.height}
        nodeRelSize={8}
        nodeColor={() => "#8b5cf6"}
        nodeLabel={(node) => (node as GraphNode).ensName}
        nodeCanvasObjectMode={() => "after"}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const label = (node as GraphNode).ensName;
          const fontSize = 14 / globalScale;
          const x = node.x as number;
          const y = node.y as number;
          
          if (x === undefined || y === undefined || !label) return;
          
          ctx.font = `${fontSize}px Sans-Serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = "#ffffff";
          ctx.fillText(label, x, y + 14);
        }}
        onNodeClick={(node) => {
          console.log("Clicked node:", node);
          const graphNode = node as GraphNode;
          if (onNodeClick && graphNode.ensName) {
            console.log("Calling onNodeClick with:", graphNode.ensName);
            onNodeClick(graphNode.ensName);
          }
        }}
        linkColor={() => "rgba(139, 92, 246, 0.5)"}
        linkWidth={2}
        linkDirectionalParticles={2}
        linkDirectionalParticleWidth={2}
        linkDirectionalParticleColor={() => "#c4b5fd"}
        backgroundColor="transparent"
        cooldownTicks={100}
      />

      {/* Empty state */}
      {graphData.nodes.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400">
          <p className="text-lg">No connections yet</p>
          <p className="text-sm">Add ENS names to build your network</p>
        </div>
      )}

      {/* Add Connection Button */}
      <button
        onClick={() => setIsFormOpen(true)}
        className="absolute right-4 top-4 flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white shadow-lg transition-all hover:bg-violet-700 hover:shadow-violet-500/25"
      >
        <Plus className="h-4 w-4" />
        Add Connection
      </button>

      {/* Add Connection Form Overlay */}
      {isFormOpen && (
        <div className="absolute right-4 top-16 w-80 rounded-xl border border-zinc-800 bg-zinc-900 p-4 shadow-2xl">
          <h3 className="mb-4 text-lg font-semibold text-white">Add Connection</h3>
          <form onSubmit={handleAddConnection} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-zinc-400">Source ENS</label>
              <input
                type="text"
                value={sourceEns}
                onChange={(e) => setSourceEns(e.target.value)}
                placeholder="vitalik.eth"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-zinc-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-zinc-400">Target ENS</label>
              <input
                type="text"
                value={targetEns}
                onChange={(e) => setTargetEns(e.target.value)}
                placeholder="balajis.eth"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-zinc-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                disabled={isSubmitting}
              />
            </div>

            {error && (
              <p className="text-sm text-red-400">{error}</p>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsFormOpen(false);
                  setError(null);
                }}
                className="flex-1 rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-800"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !sourceEns.trim() || !targetEns.trim()}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
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

