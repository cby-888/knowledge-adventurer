import { prisma } from "@/lib/prisma";
import { ok, handle } from "@/lib/api";

export async function GET(req: Request) {
  return handle(async () => {
    const npcs = await prisma.nPC.findMany({
      orderBy: { createdAt: "asc" },
      include: { career: { select: { slug: true, name: true, emoji: true } } },
    });
    return ok(
      npcs.map((n) => ({
        id: n.id,
        slug: n.slug,
        name: n.name,
        emoji: n.emoji,
        title: n.title,
        greeting: n.greeting,
        career: n.career,
      })),
    );
  }, req);
}
