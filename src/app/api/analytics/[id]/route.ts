// File: /pages/api/analytics/[id].ts
import { NextApiRequest, NextApiResponse } from "next";
import { getVisitStats, getVisitDetails } from "@/lib/visit";
import { getProductById } from "@/lib/models";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Check if user is authenticated (for admin/protected stats)
  const sessionCookie = req.cookies.session;
  const isAdmin = sessionCookie === "admin-token";

  // Get product ID from query params
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Invalid product ID" });
  }

  try {
    // First verify the product exists
    const product = await getProductById(id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Get basic stats (available to all with the link)
    const stats = await getVisitStats(id);

    // If admin, include more detailed information
    if (isAdmin && req.query.detailed === "true") {
      const details = await getVisitDetails(id);
      return res.status(200).json({
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
    return res.status(200).json(stats);
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return res.status(500).json({ error: "Failed to fetch analytics data" });
  }
}
