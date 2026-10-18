import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/db";
import SyllabusNode from "@/models/SyllabusNode";
import { requireAuth, apiSuccess, handleApiError } from "@/lib/api-utils";
import { seedSyllabus } from "@/lib/syllabus-seed";
import { ISyllabusNode } from "@/models/SyllabusNode";

interface TreeNode {
  id: string;
  name: string;
  slug: string;
  nodeType: string;
  order: number;
  description?: string;
  children: TreeNode[];
}

function buildTree(nodes: ISyllabusNode[], parentId: string | null = null): TreeNode[] {
  return nodes
    .filter((node) => node.parentId === parentId)
    .sort((a, b) => a.order - b.order)
    .map((node) => ({
      id: node._id.toString(),
      name: node.name,
      slug: node.slug,
      nodeType: node.nodeType,
      order: node.order,
      description: node.description,
      children: buildTree(nodes, node._id.toString()),
    }));
}

export async function GET(request: NextRequest) {
  try {
    await requireAuth(request as unknown as Request);
    await connectToDatabase();

    // Seed if empty
    const count = await SyllabusNode.countDocuments();
    if (count === 0) {
      await seedSyllabus();
    }

    const nodes = await SyllabusNode.find({}).sort({ order: 1 });
    const tree = buildTree(nodes, null);

    return apiSuccess(tree);
  } catch (error) {
    return handleApiError(error);
  }
}
