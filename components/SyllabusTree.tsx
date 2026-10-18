"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import {
  ChevronRight,
  ChevronDown,
  BookOpen,
  Folder,
  FolderOpen,
  FileText,
} from "lucide-react";

export interface SyllabusTreeNode {
  id: string;
  name: string;
  slug: string;
  nodeType: "subject" | "section" | "topic";
  order: number;
  description?: string;
  children: SyllabusTreeNode[];
}

interface SyllabusTreeNodeProps {
  node: SyllabusTreeNode;
  depth?: number;
  onNodeSelect?: (node: SyllabusTreeNode) => void;
}

function TreeNode({ node, depth = 0, onNodeSelect }: SyllabusTreeNodeProps) {
  const [expanded, setExpanded] = useState(depth === 0);
  const pathname = usePathname();
  const hasChildren = node.children.length > 0;

  const Icon =
    node.nodeType === "subject"
      ? expanded
        ? FolderOpen
        : Folder
      : node.nodeType === "section"
      ? BookOpen
      : FileText;

  const handleToggle = () => {
    if (hasChildren) {
      setExpanded(!expanded);
    }
    onNodeSelect?.(node);
  };

  return (
    <li>
      <button
        onClick={handleToggle}
        className={clsx(
          "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-left transition-colors",
          "hover:bg-slate-800 text-slate-300 hover:text-white",
          pathname === `/notes?subjectId=${node.id}` && "bg-slate-800 text-white"
        )}
        style={{ paddingLeft: `${8 + depth * 16}px` }}
        aria-expanded={hasChildren ? expanded : undefined}
      >
        {hasChildren ? (
          expanded ? (
            <ChevronDown size={12} className="flex-shrink-0 text-slate-500" aria-hidden="true" />
          ) : (
            <ChevronRight size={12} className="flex-shrink-0 text-slate-500" aria-hidden="true" />
          )
        ) : (
          <span className="w-3 flex-shrink-0" aria-hidden="true" />
        )}
        <Icon
          size={14}
          className={clsx(
            "flex-shrink-0",
            node.nodeType === "subject" ? "text-blue-400" : "text-slate-400"
          )}
          aria-hidden="true"
        />
        <span className="truncate">{node.name}</span>
      </button>

      {hasChildren && expanded && (
        <ul className="mt-0.5" role="group">
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              onNodeSelect={onNodeSelect}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

interface SyllabusTreeProps {
  nodes: SyllabusTreeNode[];
  onNodeSelect?: (node: SyllabusTreeNode) => void;
  className?: string;
}

export function SyllabusTree({ nodes, onNodeSelect, className }: SyllabusTreeProps) {
  if (nodes.length === 0) {
    return (
      <p className="text-xs text-slate-500 px-2 py-4">
        Syllabus not loaded. Connect to MongoDB and refresh.
      </p>
    );
  }

  return (
    <nav aria-label="Syllabus navigation" className={className}>
      <ul className="space-y-0.5" role="tree">
        {nodes.map((node) => (
          <TreeNode key={node.id} node={node} onNodeSelect={onNodeSelect} />
        ))}
      </ul>
    </nav>
  );
}

export default SyllabusTree;
