/* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable @typescript-eslint/no-unused-vars */
// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { NextResponse } from "next/server";
// import { initializeDatabase, insertProduct } from "@/lib/models";
// import fs from "fs";
// import path from "path";
// import db from "@/lib/db";

// // Use /tmp in production for a writable directory; fallback to public/uploads in development.
// const uploadDir =
//   process.env.NODE_ENV === "production"
//     ? path.join("/tmp", "uploads")
//     : path.join(process.cwd(), "public", "uploads");

// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

// export async function POST(req: Request) {
//   // Initialize the database/table if needed.
//   await initializeDatabase();

//   const formData = await req.formData();
//   const old_name = formData.get("old_name") as string;
//   const new_name = formData.get("new_name") as string;
//   const description = formData.get("description") as string;
//   const nextRedirectUrl = formData.get("next_redirect_url") as string;
//   const theme = formData.get("theme") as string; // Expected "dark" or "light"

//   const oldImages: string[] = [];
//   const newImages: string[] = [];

//   // Process file entries.
//   for (const entry of formData.entries()) {
//     const [key, value] = entry;
//     if (value instanceof File) {
//       // Generate a unique file name.
//       const fileName = `${Date.now()}_${value.name}`;
//       // Build the local file path.
//       const localFilePath = path.join(uploadDir, fileName);
//       // Read file as a buffer.
//       const buffer = await value.arrayBuffer();
//       fs.writeFileSync(localFilePath, Buffer.from(buffer));

//       // Build the public URL using your environment variable.
//       const fileUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/uploads/${fileName}`;
//       if (key === "old_images") {
//         oldImages.push(fileUrl);
//       } else if (key === "new_images") {
//         newImages.push(fileUrl);
//       }
//     }
//   }

//   try {
//     // Insert product with an empty generated_link field.
//     const { id } = await insertProduct(
//       old_name,
//       new_name,
//       description,
//       oldImages,
//       newImages,
//       nextRedirectUrl,
//       theme,
//       "" // initially empty
//     );
//     // Generate a slug from old_name (e.g., "Old Product" -> "old-product").
//     const slug = old_name.toLowerCase().trim().replace(/\s+/g, "-");
//     const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!.replace(/\/$/, "");
//     const generatedLink = `${siteUrl}/product/${slug}-${id}`;

//     // Update the product record with the generated link.
//     await db.query("UPDATE products SET generated_link = ? WHERE id = ?", [
//       generatedLink,
//       id,
//     ]);

//     return NextResponse.json({
//       message: "Batch upload successful",
//       generatedLink,
//     });
//   } catch (error: any) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }
// import { NextResponse } from "next/server";
// import { initializeDatabase, insertProduct } from "@/lib/models";
// import cloudinary from "@/lib/cloudinary";
// import db from "@/lib/db";

// export async function POST(req: Request) {
//   await initializeDatabase();

//   const formData = await req.formData();
//   const old_name = formData.get("old_name") as string;
//   const new_name = formData.get("new_name") as string;
//   const description = formData.get("description") as string;
//   const nextRedirectUrl = formData.get("next_redirect_url") as string;
//   const theme = formData.get("theme") as string;

//   const oldImages: string[] = [];
//   const newImages: string[] = [];

//   // Upload files to Cloudinary
//   for (const entry of formData.entries()) {
//     const [key, value] = entry;
//     if (value instanceof File) {
//       const buffer = await value.arrayBuffer();
//       const uploadPromise = new Promise<string>((resolve, reject) => {
//         const uploadStream = cloudinary.uploader.upload_stream(
//           {
//             folder: "uploads", // Folder in Cloudinary
//             public_id: `${Date.now()}_${value.name}`, // Custom file name
//           },
//           (error, result) => {
//             if (error) {
//               console.error("Cloudinary Error:", error);
//               reject("Image upload failed");
//             } else if (result) {
//               resolve(result.secure_url); // Use secure URL for HTTPS
//             }
//           }
//         );
//         uploadStream.end(Buffer.from(buffer));
//       });

//       const uploadedImageUrl = await uploadPromise;

//       if (key === "old_images") {
//         oldImages.push(uploadedImageUrl);
//       } else if (key === "new_images") {
//         newImages.push(uploadedImageUrl);
//       }
//     }
//   }

//   try {
//     const { id } = await insertProduct(
//       old_name,
//       new_name,
//       description,
//       oldImages,
//       newImages,
//       nextRedirectUrl,
//       theme,
//       ""
//     );

//     const slug = old_name.toLowerCase().trim().replace(/\s+/g, "-");
//     const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!.replace(/\/$/, "");
//     const generatedLink = `${siteUrl}/product/${slug}-${id}`;

//     await db.query("UPDATE products SET generated_link = ? WHERE id = ?", [
//       generatedLink,
//       id,
//     ]);

//     return NextResponse.json({
//       message: "Batch upload successful",
//       generatedLink,
//     });
//   } catch (error: any) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }

import { NextResponse } from "next/server";
import { initializeDatabase, insertProduct } from "@/lib/models";
import cloudinary from "@/lib/cloudinary";
import db from "@/lib/db";

export async function POST(req: Request) {
  await initializeDatabase();

  const formData = await req.formData();

  // Basic fields
  const old_name = formData.get("old_name") as string;
  const new_name = formData.get("new_name") as string;
  const description = formData.get("description") as string;
  const nextRedirectUrl = formData.get("next_redirect_url") as string;
  const theme = formData.get("theme") as string;

  // New fields from original request
  const rename_reason = formData.get("rename_reason") as string;
  let metadata = {};
  try {
    const metadataStr = formData.get("metadata") as string;
    if (metadataStr) {
      metadata = JSON.parse(metadataStr);
    }
  } catch (e) {
    console.error("Error parsing metadata JSON:", e);
  }

  // Handle description points (max 4)
  const description_points: string[] = [];
  for (let i = 1; i <= 4; i++) {
    const point = formData.get(`description_point_${i}`) as string;
    if (point && point.trim()) {
      description_points.push(point.trim());
    }
  }

  // Alternative way to get description points if submitted as JSON
  try {
    const pointsJson = formData.get("description_points") as string;
    if (pointsJson) {
      const parsed = JSON.parse(pointsJson);
      if (Array.isArray(parsed)) {
        // Only take up to 4 points
        description_points.splice(
          0,
          description_points.length,
          ...parsed.slice(0, 4)
        );
      }
    }
  } catch (e) {
    // If parsing fails, keep using the individually collected points
    console.error("Error parsing description points JSON:", e);
  }

  // SEO fields from new request
  const page_title = (formData.get("page_title") as string) || "";
  const meta_description = (formData.get("meta_description") as string) || "";
  const seo_title = (formData.get("seo_title") as string) || "";

  // Popup content fields from new request
  const popup_title = (formData.get("popup_title") as string) || "";
  const popup_content = (formData.get("popup_content") as string) || "";

  // Redirect timer
  const redirectTimerStr = formData.get("redirect_timer") as string;
  const redirectTimer = redirectTimerStr ? parseInt(redirectTimerStr, 10) : 0;

  // Image collections
  const oldImages: string[] = [];
  const newImages: string[] = [];
  let badgeImageUrl: string | null = null;

  // Upload files to Cloudinary
  for (const entry of formData.entries()) {
    const [key, value] = entry;
    if (value instanceof File) {
      const buffer = await value.arrayBuffer();
      const uploadPromise = new Promise<string>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "uploads", // Folder in Cloudinary
            public_id: `${Date.now()}_${value.name}`, // Custom file name
          },
          (error, result) => {
            if (error) {
              console.error("Cloudinary Error:", error);
              reject("Image upload failed");
            } else if (result) {
              resolve(result.secure_url); // Use secure URL for HTTPS
            }
          }
        );
        uploadStream.end(Buffer.from(buffer));
      });

      const uploadedImageUrl = await uploadPromise;

      if (key === "old_images") {
        oldImages.push(uploadedImageUrl);
      } else if (key === "new_images") {
        newImages.push(uploadedImageUrl);
      } else if (key === "badge_image") {
        badgeImageUrl = uploadedImageUrl;
      }
    }
  }

  try {
    const { id } = await insertProduct(
      old_name,
      new_name,
      description,
      description_points,
      metadata,
      rename_reason,
      oldImages,
      newImages,
      badgeImageUrl,
      nextRedirectUrl,
      redirectTimer,
      theme,
      "", // generatedLink (will be updated after)
      page_title,
      meta_description,
      seo_title,
      popup_title,
      popup_content
    );

    // Generate a slug-based URL
    const slug = old_name.toLowerCase().trim().replace(/\s+/g, "-");
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const cleanSiteUrl = siteUrl.replace(/\/$/, "");
    const generatedLink = `${cleanSiteUrl}/product/${slug}-${id}`;

    // Update the product with the generated link
    await db.query("UPDATE products SET generated_link = ? WHERE id = ?", [
      generatedLink,
      id,
    ]);

    return NextResponse.json({
      message: "Product created successfully",
      id,
      generatedLink,
      old_name,
      new_name,
      description_points,
      metadata,
      rename_reason,
      oldImagesCount: oldImages.length,
      newImagesCount: newImages.length,
      hasBadge: badgeImageUrl !== null,
    });
  } catch (error: any) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      {
        error: error.message,
        details: "Failed to create product",
      },
      { status: 500 }
    );
  }
}
