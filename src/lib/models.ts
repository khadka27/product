/* eslint-disable @typescript-eslint/no-explicit-any */
// import db from "./db";
// import { v4 as uuidv4 } from "uuid";

// export async function initializeDatabase() {
//   try {
//     await db.query(`
//       CREATE TABLE IF NOT EXISTS products (
//         id CHAR(36) PRIMARY KEY,
//         old_images TEXT,
//         new_images TEXT,
//         old_name VARCHAR(255),
//         new_name VARCHAR(255),
//         description TEXT,
//         next_redirect_url VARCHAR(255) DEFAULT NULL,
//         theme VARCHAR(50) DEFAULT 'light',
//         generated_link VARCHAR(255) DEFAULT NULL,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//       )
//     `);

//     // Optionally, you can run ALTER statements to add columns if needed.
//     console.log("✅ Products table is ready");
//   } catch (error) {
//     console.error("❌ Error creating table:", error);
//   }
// }

// export async function insertProduct(
//   old_name: string,
//   new_name: string,
//   description: string,
//   old_images: string[],
//   new_images: string[],
//   nextRedirectUrl: string,
//   theme: string,
//   generatedLink: string = ""
// ) {
//   const id = uuidv4(); // Generate a new UUID for the product
//   try {
//     const [result] = await db.query(
//       `INSERT INTO products
//         (id, old_images, new_images, old_name, new_name, description, next_redirect_url, theme, generated_link)
//        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//       [
//         id,
//         JSON.stringify(old_images),
//         JSON.stringify(new_images),
//         old_name,
//         new_name,
//         description,
//         nextRedirectUrl,
//         theme,
//         generatedLink,
//       ]
//     );
//     return { result, id };
//   } catch (error) {
//     console.error("❌ Error inserting product:", error);
//     throw error;
//   }
// }

import { RowDataPacket } from "mysql2/promise";
import db from "./db";
import { v4 as uuidv4 } from "uuid";

export async function initializeDatabase() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS products (
        id CHAR(36) PRIMARY KEY,
        old_images TEXT,
        new_images TEXT,
        old_name VARCHAR(255),
        new_name VARCHAR(255),
        description TEXT,
        description_points TEXT,
        metadata TEXT,
        rename_reason TEXT,
        badge_image_url VARCHAR(255) DEFAULT NULL,
        next_redirect_url VARCHAR(255) DEFAULT NULL,
        redirect_timer INT DEFAULT 0,
        theme VARCHAR(50) DEFAULT 'light',
        generated_link VARCHAR(255) DEFAULT NULL,
        page_title VARCHAR(255) DEFAULT NULL,
        meta_description TEXT,
        seo_title VARCHAR(255) DEFAULT NULL,
        popup_title VARCHAR(255) DEFAULT NULL,
        popup_content TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Run ALTER statements to add new columns to existing table if needed
    try {
      await db.query(`
        ALTER TABLE products 
        ADD COLUMN IF NOT EXISTS description_points TEXT AFTER description,
        ADD COLUMN IF NOT EXISTS metadata TEXT AFTER description_points,
        ADD COLUMN IF NOT EXISTS rename_reason TEXT AFTER metadata,
        ADD COLUMN IF NOT EXISTS badge_image_url VARCHAR(255) AFTER rename_reason,
        ADD COLUMN IF NOT EXISTS redirect_timer INT DEFAULT 0 AFTER next_redirect_url,
        ADD COLUMN IF NOT EXISTS page_title VARCHAR(255) AFTER generated_link,
        ADD COLUMN IF NOT EXISTS meta_description TEXT AFTER page_title,
        ADD COLUMN IF NOT EXISTS seo_title VARCHAR(255) AFTER meta_description,
        ADD COLUMN IF NOT EXISTS popup_title VARCHAR(255) AFTER seo_title,
        ADD COLUMN IF NOT EXISTS popup_content TEXT AFTER popup_title
      `);
    } catch (alterError) {
      console.error(
        "Note: Unable to alter table (might be normal if columns exist):",
        alterError
      );
    }

    console.log("✅ Products table is ready");
  } catch (error) {
    console.error("❌ Error creating/updating table:", error);
  }
}

export async function insertProduct(
  old_name: string,
  new_name: string,
  description: string,
  description_points: string[], // Array of description points (max 4)
  metadata: Record<string, any>, // Flexible metadata object
  rename_reason: string,
  old_images: string[],
  new_images: string[],
  badge_image_url: string | null,
  nextRedirectUrl: string,
  redirectTimer: number = 0,
  theme: string,
  generatedLink: string = "",
  page_title: string = "",
  meta_description: string = "",
  seo_title: string = "",
  popup_title: string = "",
  popup_content: string = ""
) {
  const id = uuidv4(); // Generate a new UUID for the product

  // Ensure description points are limited to maximum 4
  const limitedPoints = description_points.slice(0, 4);

  try {
    const [result] = await db.query(
      `INSERT INTO products 
        (id, old_images, new_images, old_name, new_name, description, description_points, 
         metadata, rename_reason, badge_image_url, next_redirect_url, redirect_timer, theme, generated_link,
         page_title, meta_description, seo_title, popup_title, popup_content)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        JSON.stringify(old_images),
        JSON.stringify(new_images),
        old_name,
        new_name,
        description,
        JSON.stringify(limitedPoints),
        JSON.stringify(metadata),
        rename_reason,
        badge_image_url,
        nextRedirectUrl,
        redirectTimer,
        theme,
        generatedLink,
        page_title,
        meta_description,
        seo_title,
        popup_title,
        popup_content,
      ]
    );
    return { result, id };
  } catch (error) {
    console.error("❌ Error inserting product:", error);
    throw error;
  }
}

export async function getProductById(id: string) {
  try {
    const [rows] = (await db.query("SELECT * FROM products WHERE id = ?", [
      id,
    ])) as [RowDataPacket[], any];
    if (Array.isArray(rows) && rows.length > 0) {
      const product = rows[0];

      // Parse JSON strings back to arrays/objects
      product.old_images = JSON.parse(product.old_images as string);
      product.new_images = JSON.parse(product.new_images as string);
      product.description_points = JSON.parse(
        product.description_points || "[]"
      );
      product.metadata = JSON.parse(product.metadata || "{}");

      return product;
    }
    return null;
  } catch (error) {
    console.error("❌ Error fetching product:", error);
    throw error;
  }
}

export async function getProductBySlug(slug: string) {
  try {
    // Extract the ID from the slug (assuming format is slug-ID)
    const idMatch = slug.match(
      /-([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i
    );
    if (!idMatch) {
      return null;
    }

    const id = idMatch[1];
    return await getProductById(id);
  } catch (error) {
    console.error("❌ Error fetching product by slug:", error);
    throw error;
  }
}

// Helper function to update a product
export async function updateProduct(
  id: string,
  updates: {
    old_name?: string;
    new_name?: string;
    description?: string;
    description_points?: string[];
    metadata?: Record<string, any>;
    rename_reason?: string;
    old_images?: string[];
    new_images?: string[];
    badge_image_url?: string;
    next_redirect_url?: string;
    redirect_timer?: number;
    theme?: string;
    generated_link?: string;
    page_title?: string;
    meta_description?: string;
    seo_title?: string;
    popup_title?: string;
    popup_content?: string;
  }
) {
  try {
    // Prepare columns and values for SQL update
    const updateColumns = [];
    const values = [];

    // Build dynamic SQL update statement
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        // Convert arrays and objects to JSON strings for storage
        if (
          Array.isArray(value) ||
          (typeof value === "object" && value !== null)
        ) {
          updateColumns.push(`${key} = ?`);
          values.push(JSON.stringify(value));
        } else {
          updateColumns.push(`${key} = ?`);
          values.push(value);
        }
      }
    }

    // Add ID as the last parameter
    values.push(id);

    // Execute the update query
    const [result] = await db.query(
      `UPDATE products SET ${updateColumns.join(", ")} WHERE id = ?`,
      values
    );

    return result;
  } catch (error) {
    console.error("❌ Error updating product:", error);
    throw error;
  }
}

export async function getAllProducts(limit = 100, offset = 0) {
  try {
    const [rows] = (await db.query(
      "SELECT id, old_name, new_name, created_at, generated_link FROM products ORDER BY created_at DESC LIMIT ? OFFSET ?",
      [limit, offset]
    )) as [RowDataPacket[], any];

    return rows;
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    throw error;
  }
}

export async function getProductCount() {
  try {
    const [rows] = (await db.query(
      "SELECT COUNT(*) as count FROM products"
    )) as [RowDataPacket[], any];

    return rows[0].count;
  } catch (error) {
    console.error("❌ Error counting products:", error);
    throw error;
  }
}
