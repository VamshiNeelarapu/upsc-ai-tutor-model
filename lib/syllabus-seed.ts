import connectToDatabase from "./db";
import SyllabusNode from "@/models/SyllabusNode";

interface SyllabusItem {
  name: string;
  slug: string;
  nodeType: "subject" | "section" | "topic";
  children?: SyllabusItem[];
  description?: string;
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[&]/g, "and")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

const SYLLABUS_HIERARCHY: SyllabusItem[] = [
  {
    name: "History",
    slug: "history",
    nodeType: "subject",
    children: [
      { name: "Ancient History", slug: "ancient-history", nodeType: "section" },
      { name: "Medieval History", slug: "medieval-history", nodeType: "section" },
      { name: "Modern History", slug: "modern-history", nodeType: "section" },
      { name: "Art & Culture", slug: "art-and-culture", nodeType: "section" },
    ],
  },
  {
    name: "Geography",
    slug: "geography",
    nodeType: "subject",
    children: [
      { name: "Physical Geography", slug: "physical-geography", nodeType: "section" },
      { name: "Indian Geography", slug: "indian-geography", nodeType: "section" },
      { name: "World Geography", slug: "world-geography", nodeType: "section" },
    ],
  },
  {
    name: "Indian Polity",
    slug: "indian-polity",
    nodeType: "subject",
    children: [
      { name: "Constitution", slug: "constitution", nodeType: "section" },
      { name: "Parliament", slug: "parliament", nodeType: "section" },
      { name: "Executive", slug: "executive", nodeType: "section" },
      { name: "Judiciary", slug: "judiciary", nodeType: "section" },
      { name: "Federalism", slug: "federalism", nodeType: "section" },
      {
        name: "Constitutional and Statutory Bodies",
        slug: "constitutional-and-statutory-bodies",
        nodeType: "section",
      },
    ],
  },
  {
    name: "Economy",
    slug: "economy",
    nodeType: "subject",
    children: [
      { name: "Basic Concepts", slug: "basic-concepts", nodeType: "section" },
      { name: "Banking", slug: "banking", nodeType: "section" },
      { name: "Inflation", slug: "inflation", nodeType: "section" },
      { name: "Fiscal Policy", slug: "fiscal-policy", nodeType: "section" },
      { name: "External Sector", slug: "external-sector", nodeType: "section" },
    ],
  },
  {
    name: "Environment & Ecology",
    slug: "environment-and-ecology",
    nodeType: "subject",
    children: [
      { name: "Ecology", slug: "ecology", nodeType: "section" },
      { name: "Biodiversity", slug: "biodiversity", nodeType: "section" },
      { name: "Climate Change", slug: "climate-change", nodeType: "section" },
      {
        name: "Environmental Laws and Conventions",
        slug: "environmental-laws-and-conventions",
        nodeType: "section",
      },
    ],
  },
  {
    name: "Science & Technology",
    slug: "science-and-technology",
    nodeType: "subject",
    children: [
      { name: "Space", slug: "space", nodeType: "section" },
      { name: "Biotechnology", slug: "biotechnology", nodeType: "section" },
      { name: "Health and Diseases", slug: "health-and-diseases", nodeType: "section" },
      { name: "Emerging Technologies", slug: "emerging-technologies", nodeType: "section" },
    ],
  },
  {
    name: "Current Affairs",
    slug: "current-affairs",
    nodeType: "subject",
    children: [
      { name: "National", slug: "national", nodeType: "section" },
      { name: "International", slug: "international", nodeType: "section" },
      { name: "Economy", slug: "current-affairs-economy", nodeType: "section" },
      { name: "Environment", slug: "current-affairs-environment", nodeType: "section" },
      { name: "Science & Technology", slug: "current-affairs-science-technology", nodeType: "section" },
    ],
  },
  {
    name: "Ethics (GS IV)",
    slug: "ethics-gs-iv",
    nodeType: "subject",
    children: [
      { name: "Ethics and Human Values", slug: "ethics-and-human-values", nodeType: "section" },
      { name: "Attitude", slug: "attitude", nodeType: "section" },
      { name: "Aptitude", slug: "aptitude", nodeType: "section" },
      { name: "Emotional Intelligence", slug: "emotional-intelligence", nodeType: "section" },
      { name: "Thinkers and Philosophers", slug: "thinkers-and-philosophers", nodeType: "section" },
      { name: "Case Studies", slug: "case-studies", nodeType: "section" },
    ],
  },
  {
    name: "Essay",
    slug: "essay",
    nodeType: "subject",
    children: [],
  },
  {
    name: "CSAT",
    slug: "csat",
    nodeType: "subject",
    children: [
      { name: "Comprehension", slug: "comprehension", nodeType: "section" },
      { name: "Logical Reasoning", slug: "logical-reasoning", nodeType: "section" },
      { name: "Quantitative Aptitude", slug: "quantitative-aptitude", nodeType: "section" },
    ],
  },
  {
    name: "Mains Practice",
    slug: "mains-practice",
    nodeType: "subject",
    children: [
      { name: "GS I", slug: "gs-i", nodeType: "section" },
      { name: "GS II", slug: "gs-ii", nodeType: "section" },
      { name: "GS III", slug: "gs-iii", nodeType: "section" },
      { name: "GS IV", slug: "gs-iv", nodeType: "section" },
      { name: "Essay", slug: "mains-essay", nodeType: "section" },
    ],
  },
];

async function seedNode(
  item: SyllabusItem,
  parentId: string | null,
  order: number
): Promise<string> {
  const existing = await SyllabusNode.findOne({ slug: item.slug });
  let nodeId: string;

  if (existing) {
    nodeId = existing._id.toString();
  } else {
    const node = await SyllabusNode.create({
      name: item.name,
      slug: item.slug,
      parentId: parentId,
      nodeType: item.nodeType,
      order,
      description: item.description,
    });
    nodeId = node._id.toString();
  }

  if (item.children) {
    for (let i = 0; i < item.children.length; i++) {
      await seedNode(item.children[i], nodeId, i);
    }
  }

  return nodeId;
}

export async function seedSyllabus(): Promise<void> {
  await connectToDatabase();

  const count = await SyllabusNode.countDocuments();
  if (count > 0) {
    return; // Already seeded
  }

  console.log("Seeding syllabus hierarchy...");

  for (let i = 0; i < SYLLABUS_HIERARCHY.length; i++) {
    await seedNode(SYLLABUS_HIERARCHY[i], null, i);
  }

  console.log("Syllabus seeding complete.");
}

export { toSlug };
export default seedSyllabus;
