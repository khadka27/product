// File: src/app/api/analytics/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getGlobalVisitStats } from "@/lib/visit";
import { getAllProducts } from "@/lib/models";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  // Only allow admin access to global stats
  const sessionCookie = (await cookies()).get("session")?.value;

  if (sessionCookie !== "admin-token") {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
  }

  try {
    // Get global stats
    const globalStats = await getGlobalVisitStats();

    // Get list of products with click counts
    const url = new URL(request.url);
    const limitParam = url.searchParams.get("limit");
    const offsetParam = url.searchParams.get("offset");
    const sortParam = url.searchParams.get("sort");

    const limit = limitParam ? parseInt(limitParam) : 10;
    const offset = offsetParam ? parseInt(offsetParam) : 0;
    const products = await getAllProducts(limit, offset);

    // Sort products by click count if requested
    if (sortParam === "clicks") {
      products.sort((a, b) => (b.total_clicks ?? 0) - (a.total_clicks ?? 0));
    }

    return NextResponse.json({
      ...globalStats,
      products,
    });
  } catch (error) {
    console.error("Error fetching global analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch global analytics data" },
      { status: 500 }
    );
  }
}
