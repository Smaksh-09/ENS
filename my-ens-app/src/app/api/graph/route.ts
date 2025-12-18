import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Fetch all nodes and edges formatted for react-force-graph
export async function GET() {
  try {
    const [nodes, edges] = await Promise.all([
      prisma.node.findMany(),
      prisma.edge.findMany(),
    ]);

    // Format for react-force-graph
    // nodes need: id, and any other properties you want to display
    // links need: source, target (referencing node ids)
    // @ts-ignore
    const formattedNodes = nodes.map((node) => ({
      id: node.id,
      ensName: node.ensName,
      metadata: JSON.parse(node.metadataJson),
    }));

    // @ts-ignore
    const formattedLinks = edges.map((edge) => ({
      id: edge.id,
      source: edge.sourceNodeId,
      target: edge.targetNodeId,
    }));

    return NextResponse.json({
      nodes: formattedNodes,
      links: formattedLinks,
    });
  } catch (error) {
    console.error("Error fetching graph data:", error);
    return NextResponse.json(
      { error: "Failed to fetch graph data" },
      { status: 500 }
    );
  }
}

// POST: Create nodes and edge for ENS name pair
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sourceEns, targetEns } = body;

    if (!sourceEns || !targetEns) {
      return NextResponse.json(
        { error: "sourceEns and targetEns are required" },
        { status: 400 }
      );
    }

    if (sourceEns === targetEns) {
      return NextResponse.json(
        { error: "Cannot create edge to self" },
        { status: 400 }
      );
    }

    // Find or create source node
    const sourceNode = await prisma.node.upsert({
      where: { ensName: sourceEns },
      update: {},
      create: { ensName: sourceEns },
    });

    // Find or create target node
    const targetNode = await prisma.node.upsert({
      where: { ensName: targetEns },
      update: {},
      create: { ensName: targetEns },
    });

    // Create edge if it doesn't exist
    const edge = await prisma.edge.upsert({
      where: {
        sourceNodeId_targetNodeId: {
          sourceNodeId: sourceNode.id,
          targetNodeId: targetNode.id,
        },
      },
      update: {},
      create: {
        sourceNodeId: sourceNode.id,
        targetNodeId: targetNode.id,
      },
    });

    return NextResponse.json({
      success: true,
      sourceNode: {
        id: sourceNode.id,
        ensName: sourceNode.ensName,
      },
      targetNode: {
        id: targetNode.id,
        ensName: targetNode.ensName,
      },
      edge: {
        id: edge.id,
        source: edge.sourceNodeId,
        target: edge.targetNodeId,
      },
    });
  } catch (error) {
    console.error("Error creating graph connection:", error);
    return NextResponse.json(
      { error: "Failed to create connection" },
      { status: 500 }
    );
  }
}

