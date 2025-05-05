// File: /pages/api/analytics/index.ts
import { NextApiRequest, NextApiResponse } from "next";
import { getGlobalVisitStats } from "@/lib/visit";
import { getAllProducts } from "@/lib/models";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow admin access to global stats
  const sessionCookie = req.cookies.session;

  if (sessionCookie !== "admin-token") {
    return res.status(403).json({ error: "Unauthorized access" });
  }

  try {
    // Get global stats
    const globalStats = await getGlobalVisitStats();

    // Get list of products with click counts
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    const products = await getAllProducts(limit, offset);

    // Sort products by click count if requested
    if (req.query.sort === "clicks") {
      products.sort((a, b) => (b.total_clicks || 0) - (a.total_clicks || 0));
    }

    return res.status(200).json({
      ...globalStats,
      products,
    });
  } catch (error) {
    console.error("Error fetching global analytics:", error);
    return res
      .status(500)
      .json({ error: "Failed to fetch global analytics data" });
  }
}
