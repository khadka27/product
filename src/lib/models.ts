// /* eslint-disable @typescript-eslint/no-explicit-any */

// import { RowDataPacket } from "mysql2/promise";
// import db from "./db";
// import { v4 as uuidv4 } from "uuid";

// export async function initializeDatabase() {
//   try {
//     // Create products table
//     await db.query(`
//       CREATE TABLE IF NOT EXISTS products (
//         id CHAR(36) PRIMARY KEY,
//         old_images TEXT,
//         new_images TEXT,
//         old_name VARCHAR(255),
//         new_name VARCHAR(255),
//         description TEXT,
//         description_points TEXT,
//         metadata TEXT,
//         rename_reason TEXT,
//         badge_image_url VARCHAR(255) DEFAULT NULL,
//         extra_badge_1 VARCHAR(255) DEFAULT NULL,
//         extra_badge_2 VARCHAR(255) DEFAULT NULL,
//         next_redirect_url VARCHAR(255) DEFAULT NULL,
//         redirect_timer INT DEFAULT 0,
//         theme VARCHAR(50) DEFAULT 'light',
//         generated_link VARCHAR(255) DEFAULT NULL,
//         page_title VARCHAR(255) DEFAULT NULL,
//         meta_description TEXT,
//         seo_title VARCHAR(255) DEFAULT NULL,
//         popup_title VARCHAR(255) DEFAULT NULL,
//         total_clicks INT DEFAULT 0,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//       )
//     `);

//     // Create table for tracking visits
//     await db.query(`
//       CREATE TABLE IF NOT EXISTS visit_stats (
//         id INT AUTO_INCREMENT PRIMARY KEY,
//         product_id CHAR(36),
//         ip_address VARCHAR(45),
//         country VARCHAR(100),
//         visit_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         FOREIGN KEY (product_id) REFERENCES products(id),
//         UNIQUE KEY unique_visit (product_id, ip_address)
//       )
//     `);

//     // Run ALTER statements to add new columns to existing products table if needed
//     try {
//       await db.query(`
//         ALTER TABLE products
//         ADD COLUMN IF NOT EXISTS description_points TEXT AFTER description,
//         ADD COLUMN IF NOT EXISTS metadata TEXT AFTER description_points,
//         ADD COLUMN IF NOT EXISTS rename_reason TEXT AFTER metadata,
//         ADD COLUMN IF NOT EXISTS badge_image_url VARCHAR(255) AFTER rename_reason,
//         ADD COLUMN IF NOT EXISTS extra_badge_1 VARCHAR(255) AFTER badge_image_url,
//         ADD COLUMN IF NOT EXISTS extra_badge_2 VARCHAR(255) AFTER extra_badge_1,
//         ADD COLUMN IF NOT EXISTS redirect_timer INT DEFAULT 0 AFTER next_redirect_url,
//         ADD COLUMN IF NOT EXISTS page_title VARCHAR(255) AFTER generated_link,
//         ADD COLUMN IF NOT EXISTS meta_description TEXT AFTER page_title,
//         ADD COLUMN IF NOT EXISTS seo_title VARCHAR(255) AFTER meta_description,
//         ADD COLUMN IF NOT EXISTS popup_title VARCHAR(255) AFTER seo_title,
//         ADD COLUMN IF NOT EXISTS total_clicks INT DEFAULT 0 AFTER popup_title,
//         DROP COLUMN IF EXISTS popup_content
//       `);
//     } catch (alterError) {
//       console.error(
//         "Note: Unable to alter table (might be normal if columns exist):",
//         alterError
//       );
//     }

//     console.log("✅ Database tables are ready");
//   } catch (error) {
//     console.error("❌ Error creating/updating tables:", error);
//   }
// }

// export async function insertProduct(
//   old_name: string,
//   new_name: string,
//   description: string,
//   description_points: string[], // Array of description points (max 4)
//   metadata: Record<string, any>, // Flexible metadata object
//   rename_reason: string,
//   old_images: string[],
//   new_images: string[],
//   badge_image_url: string | null,
//   extra_badge_1: string | null,
//   extra_badge_2: string | null,
//   nextRedirectUrl: string,
//   redirectTimer: number = 0,
//   theme: string,
//   generatedLink: string = "",
//   page_title: string = "",
//   meta_description: string = "",
//   seo_title: string = "",
//   popup_title: string = ""
// ) {
//   const id = uuidv4(); // Generate a new UUID for the product

//   // Ensure description points are limited to maximum 4
//   const limitedPoints = description_points.slice(0, 4);

//   try {
//     const [result] = await db.query(
//       `INSERT INTO products
//         (id, old_images, new_images, old_name, new_name, description, description_points,
//          metadata, rename_reason, badge_image_url, extra_badge_1, extra_badge_2,
//          next_redirect_url, redirect_timer, theme, generated_link,
//          page_title, meta_description, seo_title, popup_title)
//        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//       [
//         id,
//         JSON.stringify(old_images),
//         JSON.stringify(new_images),
//         old_name,
//         new_name,
//         description,
//         JSON.stringify(limitedPoints),
//         JSON.stringify(metadata),
//         rename_reason,
//         badge_image_url,
//         extra_badge_1,
//         extra_badge_2,
//         nextRedirectUrl,
//         redirectTimer,
//         theme,
//         generatedLink,
//         page_title,
//         meta_description,
//         seo_title,
//         popup_title,
//       ]
//     );
//     return { result, id };
//   } catch (error) {
//     console.error("❌ Error inserting product:", error);
//     throw error;
//   }
// }

// export async function getProductById(id: string) {
//   try {
//     const [rows] = (await db.query("SELECT * FROM products WHERE id = ?", [
//       id,
//     ])) as [RowDataPacket[], any];
//     if (Array.isArray(rows) && rows.length > 0) {
//       const product = rows[0];

//       // Parse JSON strings back to arrays/objects
//       product.old_images = JSON.parse(product.old_images as string);
//       product.new_images = JSON.parse(product.new_images as string);
//       product.description_points = JSON.parse(
//         product.description_points || "[]"
//       );
//       product.metadata = JSON.parse(product.metadata || "{}");

//       return product;
//     }
//     return null;
//   } catch (error) {
//     console.error("❌ Error fetching product:", error);
//     throw error;
//   }
// }

// export async function getProductBySlug(slug: string) {
//   try {
//     // Extract the ID from the slug (assuming format is slug-ID)
//     const idMatch = slug.match(
//       /-([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i
//     );
//     if (!idMatch) {
//       return null;
//     }

//     const id = idMatch[1];
//     return await getProductById(id);
//   } catch (error) {
//     console.error("❌ Error fetching product by slug:", error);
//     throw error;
//   }
// }

// // Helper function to update a product
// export async function updateProduct(
//   id: string,
//   updates: {
//     old_name?: string;
//     new_name?: string;
//     description?: string;
//     description_points?: string[];
//     metadata?: Record<string, any>;
//     rename_reason?: string;
//     old_images?: string[];
//     new_images?: string[];
//     badge_image_url?: string;
//     extra_badge_1?: string;
//     extra_badge_2?: string;
//     next_redirect_url?: string;
//     redirect_timer?: number;
//     theme?: string;
//     generated_link?: string;
//     page_title?: string;
//     meta_description?: string;
//     seo_title?: string;
//     popup_title?: string;
//     total_clicks?: number;
//   }
// ) {
//   try {
//     // Prepare columns and values for SQL update
//     const updateColumns = [];
//     const values = [];

//     // Build dynamic SQL update statement
//     for (const [key, value] of Object.entries(updates)) {
//       if (value !== undefined) {
//         // Convert arrays and objects to JSON strings for storage
//         if (
//           Array.isArray(value) ||
//           (typeof value === "object" && value !== null)
//         ) {
//           updateColumns.push(`${key} = ?`);
//           values.push(JSON.stringify(value));
//         } else {
//           updateColumns.push(`${key} = ?`);
//           values.push(value);
//         }
//       }
//     }

//     // Add ID as the last parameter
//     values.push(id);

//     // Execute the update query
//     const [result] = await db.query(
//       `UPDATE products SET ${updateColumns.join(", ")} WHERE id = ?`,
//       values
//     );

//     return result;
//   } catch (error) {
//     console.error("❌ Error updating product:", error);
//     throw error;
//   }
// }

// export async function getAllProducts(limit = 100, offset = 0) {
//   try {
//     const [rows] = (await db.query(
//       "SELECT id, old_name, new_name, created_at, generated_link, total_clicks FROM products ORDER BY created_at DESC LIMIT ? OFFSET ?",
//       [limit, offset]
//     )) as [RowDataPacket[], any];

//     return rows;
//   } catch (error) {
//     console.error("❌ Error fetching products:", error);
//     throw error;
//   }
// }

// export async function getProductCount() {
//   try {
//     const [rows] = (await db.query(
//       "SELECT COUNT(*) as count FROM products"
//     )) as [RowDataPacket[], any];

//     return rows[0].count;
//   } catch (error) {
//     console.error("❌ Error counting products:", error);
//     throw error;
//   }
// }

// // New functions for visit tracking

// export async function recordVisit(
//   productId: string,
//   ipAddress: string,
//   country: string
// ) {
//   try {
//     // First, increment the total_clicks counter
//     await db.query(
//       "UPDATE products SET total_clicks = total_clicks + 1 WHERE id = ?",
//       [productId]
//     );

//     // Then try to insert a new record for this IP
//     // If the IP already exists for this product, this will fail due to UNIQUE constraint
//     // That's okay - we only want to count unique IPs
//     try {
//       await db.query(
//         "INSERT INTO visit_stats (product_id, ip_address, country) VALUES (?, ?, ?)",
//         [productId, ipAddress, country]
//       );
//     // eslint-disable-next-line @typescript-eslint/no-unused-vars
//     } catch (uniqueError) {
//       // Silently ignore unique constraint violations
//       // This means this IP has already been counted
//     }

//     return true;
//   } catch (error) {
//     console.error("❌ Error recording visit:", error);
//     throw error;
//   }
// }

// export async function getVisitStats(productId: string) {
//   try {
//     // Get total clicks
//     const [clickRows] = (await db.query(
//       "SELECT total_clicks FROM products WHERE id = ?",
//       [productId]
//     )) as [RowDataPacket[], any];

//     // Get unique visitors count
//     const [uniqueRows] = (await db.query(
//       "SELECT COUNT(*) as unique_visitors FROM visit_stats WHERE product_id = ?",
//       [productId]
//     )) as [RowDataPacket[], any];

//     // Get country breakdown
//     const [countryRows] = (await db.query(
//       "SELECT country, COUNT(*) as count FROM visit_stats WHERE product_id = ? GROUP BY country ORDER BY count DESC",
//       [productId]
//     )) as [RowDataPacket[], any];

//     return {
//       totalClicks: clickRows[0]?.total_clicks || 0,
//       uniqueVisitors: uniqueRows[0]?.unique_visitors || 0,
//       countries: countryRows,
//     };
//   } catch (error) {
//     console.error("❌ Error getting visit stats:", error);
//     throw error;
//   }
// }

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { RowDataPacket } from "mysql2/promise";
import db from "./db";
import { v4 as uuidv4 } from "uuid";

export async function initializeDatabase() {
  try {
    // Create products table without popup_title, page_title, rename_reason, metadata
    await db.query(`
      CREATE TABLE IF NOT EXISTS products (
        id CHAR(36) PRIMARY KEY,
        old_images TEXT,
        new_images TEXT,
        old_name VARCHAR(255),
        new_name VARCHAR(255),
        description TEXT,
        description_points TEXT,
        badge_image_url VARCHAR(255) DEFAULT NULL,
        extra_badge_1 VARCHAR(255) DEFAULT NULL,
        extra_badge_2 VARCHAR(255) DEFAULT NULL,
        next_redirect_url VARCHAR(255) DEFAULT NULL,
        redirect_timer INT DEFAULT 0,
        theme VARCHAR(50) DEFAULT 'light',
        generated_link VARCHAR(255) DEFAULT NULL,
        meta_description TEXT,
        seo_title VARCHAR(255) DEFAULT NULL,
        total_clicks INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create table for tracking visits
    await db.query(`
      CREATE TABLE IF NOT EXISTS visit_stats (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id CHAR(36),
        ip_address VARCHAR(45),
        country VARCHAR(100),
        visit_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id),
        UNIQUE KEY unique_visit (product_id, ip_address)
      )
    `);

    console.log("✅ Database tables are ready");
  } catch (error) {
    console.error("❌ Error creating/updating tables:", error);
  }
}

export async function insertProduct(
  old_name: string,
  new_name: string,
  description: string,
  description_points: string[], // max 4 entries
  old_images: string[],
  new_images: string[],
  badge_image_url: string | null,
  extra_badge_1: string | null,
  extra_badge_2: string | null,
  nextRedirectUrl: string,
  redirectTimer: number,
  theme: string,
  generatedLink: string,
  meta_description: string,
  seo_title: string
) {
  const id = uuidv4();
  const limitedPoints = description_points.slice(0, 4);

  // SQL column list must exactly match the order of the values array below
  const sql = `
    INSERT INTO products (
      id,
      old_images,
      new_images,
      old_name,
      new_name,
      description,
      description_points,
      badge_image_url,
      extra_badge_1,
      extra_badge_2,
      next_redirect_url,
      redirect_timer,
      theme,
      generated_link,
      meta_description,
      seo_title
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    id,
    JSON.stringify(old_images), // existing two image arrays
    JSON.stringify(new_images),
    old_name,
    new_name,
    description,
    JSON.stringify(limitedPoints), // description_points
    badge_image_url,
    extra_badge_1,
    extra_badge_2,
    nextRedirectUrl, // next_redirect_url
    redirectTimer, // redirect_timer must be a number
    theme,
    generatedLink,
    meta_description,
    seo_title,
  ];

  try {
    const [result] = await db.query(sql, params);
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
    if (!Array.isArray(rows) || rows.length === 0) return null;
    const product = rows[0];
    // Parse JSON columns back to native types
    product.old_images = JSON.parse(product.old_images as string);
    product.new_images = JSON.parse(product.new_images as string);
    product.description_points = JSON.parse(product.description_points || "[]");
    return product;
  } catch (error) {
    console.error("❌ Error fetching product:", error);
    throw error;
  }
}

export async function getProductBySlug(slug: string) {
  const match = slug.match(
    /-([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i
  );
  if (!match) return null;
  return getProductById(match[1]);
}

export async function updateProduct(
  id: string,
  updates: {
    old_name?: string;
    new_name?: string;
    description?: string;
    description_points?: string[];
    old_images?: string[];
    new_images?: string[];
    badge_image_url?: string;
    extra_badge_1?: string;
    extra_badge_2?: string;
    next_redirect_url?: string;
    redirect_timer?: number;
    theme?: string;
    generated_link?: string;
    meta_description?: string;
    seo_title?: string;
    total_clicks?: number;
  }
) {
  try {
    const cols: string[] = [];
    const vals: any[] = [];
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        cols.push(`${key} = ?`);
        vals.push(
          Array.isArray(value) || typeof value === "object"
            ? JSON.stringify(value)
            : value
        );
      }
    }
    vals.push(id);
    const sql = `UPDATE products SET ${cols.join(", ")} WHERE id = ?`;
    const [result] = await db.query(sql, vals);
    return result;
  } catch (error) {
    console.error("❌ Error updating product:", error);
    throw error;
  }
}

export async function getAllProducts(limit = 100, offset = 0) {
  try {
    const [rows] = (await db.query(
      `SELECT id, old_name, new_name, created_at, generated_link, total_clicks
       FROM products
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
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

export async function recordVisit(
  productId: string,
  ipAddress: string,
  country: string
) {
  try {
    await db.query(
      "UPDATE products SET total_clicks = total_clicks + 1 WHERE id = ?",
      [productId]
    );
    try {
      await db.query(
        "INSERT INTO visit_stats (product_id, ip_address, country) VALUES (?, ?, ?)",
        [productId, ipAddress, country]
      );
    } catch {
      // ignore unique constraint violation
    }
    return true;
  } catch (error) {
    console.error("❌ Error recording visit:", error);
    throw error;
  }
}

export async function getVisitStats(productId: string) {
  try {
    const [clickRows] = (await db.query(
      "SELECT total_clicks FROM products WHERE id = ?",
      [productId]
    )) as [RowDataPacket[], any];
    const [uniqueRows] = (await db.query(
      "SELECT COUNT(*) as unique_visitors FROM visit_stats WHERE product_id = ?",
      [productId]
    )) as [RowDataPacket[], any];
    const [countryRows] = (await db.query(
      "SELECT country, COUNT(*) as count FROM visit_stats WHERE product_id = ? GROUP BY country ORDER BY count DESC",
      [productId]
    )) as [RowDataPacket[], any];

    return {
      totalClicks: clickRows[0]?.total_clicks || 0,
      uniqueVisitors: uniqueRows[0]?.unique_visitors || 0,
      countries: countryRows,
    };
  } catch (error) {
    console.error("❌ Error getting visit stats:", error);
    throw error;
  }
}
