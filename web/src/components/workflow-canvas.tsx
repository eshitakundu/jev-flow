"use client";
import {
  Background,
  ReactFlow,
  Handle,
  Position,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { Evaluation, RoutingDecision } from "@/lib/types";

function FlowNode({ data }: NodeProps) {
  return (
    <div
      className={`flow-node ${data.active ? "is-active" : ""} ${data.kind ?? ""}`}
    >
      <Handle type="target" position={Position.Top} />
      <div className="node-kicker">{String(data.kicker)}</div>
      <div className="node-title">{String(data.label)}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
const nodeTypes = { decision: FlowNode };
export function WorkflowCanvas({
  evaluation,
  route,
  replay,
}: {
  evaluation: Evaluation | null;
  route: RoutingDecision | null;
  replay: number;
}) {
  const active = Boolean(evaluation && route);
  const labels = ["Human review", "Priority queue", "Standard queue"];
  const nodes = [
    {
      id: "in",
      type: "decision",
      position: { x: 185, y: 15 },
      data: { kicker: "INPUT", label: "Incoming message", active },
    },
    {
      id: "category",
      type: "decision",
      position: { x: 185, y: 125 },
      data: {
        kicker: "JEV · CATEGORY",
        label: evaluation?.category ?? "Choose a team",
        active,
      },
    },
    {
      id: "urgency",
      type: "decision",
      position: { x: 185, y: 235 },
      data: {
        kicker: "JEV · URGENCY",
        label: evaluation?.urgency ?? "Assess urgency",
        active,
      },
    },
    {
      id: "gate",
      type: "decision",
      position: { x: 185, y: 345 },
      data: {
        kicker: "YOUR POLICY",
        label: "Confidence gate",
        active,
        kind: "gate",
      },
    },
    ...labels.map((label, i) => ({
      id: label,
      type: "decision",
      position: { x: i * 185, y: 485 },
      data: {
        kicker: "SIMULATED ACTION",
        label,
        active: active && route?.destination === label,
        kind: label === "Human review" ? "human" : "",
      },
    })),
  ];
  const pairs = [
    ["in", "category"],
    ["category", "urgency"],
    ["urgency", "gate"],
    ...labels.map((label) => ["gate", label]),
  ];
  const edges = pairs.map(([source, target]) => {
    const selected =
      active && (source !== "gate" || route?.destination === target);
    return {
      id: `${source}-${target}`,
      source,
      target,
      animated: selected,
      style: {
        stroke: selected ? "#bb155d" : "#c5b397",
        strokeWidth: selected ? 2 : 1.4,
      },
    };
  });
  return (
    <ReactFlow
      key={replay}
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      fitView
      fitViewOptions={{ padding: 0.12 }}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
      panOnDrag
      zoomOnScroll={false}
      minZoom={0.3}
      maxZoom={1.3}
      proOptions={{ hideAttribution: true }}
      aria-label="Support triage workflow"
    >
      <Background color="#b8a68b" gap={7} size={0.6} />
    </ReactFlow>
  );
}
