// File: src/app/api/analytics/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getVisitStats, getVisitDetails } from "@/lib/visit";
import { getProductById } from "@/lib/models";
import { cookies } from "next/headers";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  // Check if user is authenticated (for admin/protected stats)
  const sessionCookie = (await cookies()).get("session")?.value;
  const isAdmin = sessionCookie === "admin-token";

  // Get product ID from params
  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
  }

  try {
    // First verify the product exists
    const product = await getProductById(id);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Get basic stats (available to all with the link)
    const stats = await getVisitStats(id);

    // If admin, include more detailed information
    const url = new URL(request.url);
    const detailed = url.searchParams.get("detailed") === "true";

    if (isAdmin && detailed) {
      const details = await getVisitDetails(id);
      return NextResponse.json({
        ...stats,
        product: {
          id: product.id,
          old_name: product.old_name,
          new_name: product.new_name,
          generated_link: product.generated_link,
        },
        details,
      });
    }

    // Return basic stats for non-admin or when detailed not requested
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    );
  }
}
