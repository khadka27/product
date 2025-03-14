/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { initializeDatabase, insertProduct } from "@/lib/models";
import multer from "multer";
import fs from "fs";
import db from "@/lib/db";

// Ensure the uploads directory exists
const uploadDir = "./public/uploads/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer for file uploads (we handle saving manually below)
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(null, Date.now() + "_" + file.originalname);
  },
});
const upload = multer({ storage });

export async function POST(req: Request) {
  // Initialize the database/table if needed.
  await initializeDatabase();

  const formData = await req.formData();
  const old_name = formData.get("old_name") as string;
  const new_name = formData.get("new_name") as string;
  const description = formData.get("description") as string;
  const nextRedirectUrl = formData.get("next_redirect_url") as string;
  const theme = formData.get("theme") as string; // Expected "dark" or "light"

  const oldImages: string[] = [];
  const newImages: string[] = [];

  // Process file entries.
  for (const entry of formData.entries()) {
    const [key, value] = entry;
    if (value instanceof File) {
      const filePath = `${
        process.env.NEXT_PUBLIC_SITE_URL
      }/uploads/${Date.now()}_${value.name}`;
      const buffer = await value.arrayBuffer();
      fs.writeFileSync(
        "./public${filePath}",
        Buffer.from(buffer)
      );
      if (key === "old_images") {
        oldImages.push(filePath);
      } else if (key === "new_images") {
        newImages.push(filePath);
      }
    }
  }

  try {
    // Insert product with an empty generated_link field.
    const { id } = await insertProduct(
      old_name,
      new_name,
      description,
      oldImages,
      newImages,
      nextRedirectUrl,
      theme,
      "" // initially empty
    );
    // Generate a slug from old_name (e.g., "Old Product" -> "old-product").
    const slug = old_name.toLowerCase().trim().replace(/\s+/g, "-");
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    const generatedLink = `${siteUrl}/product/${slug}-${id}`;

    // Update the product record with the generated link.
    await db.query("UPDATE products SET generated_link = ? WHERE id = ?", [
      generatedLink,
      id,
    ]);

    return NextResponse.json({
      message: "Batch upload successful",
      generatedLink,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
