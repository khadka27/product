/* eslint-disable @typescript-eslint/no-explicit-any */
import { type NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

// ✅ Correct GET request with Next.js 15+ App Router
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } } // Ensure correct param handling
) {
  try {
    const id = params?.id;
    if (!id) {
      return NextResponse.json(
        { error: "Missing product ID" },
        { status: 400 }
      );
    }

    // Fetch product from database
    const [rows]: any = await db.query("SELECT * FROM products WHERE id = ?", [
      Number(id),
    ]);

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error: any) {
    console.error("GET Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// ✅ Correct PUT request
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params?.id;
    if (!id) {
      return NextResponse.json(
        { error: "Missing product ID" },
        { status: 400 }
      );
    }

    const formData = await request.json(); // Use `.json()` instead of `formData()`
    const { old_name, new_name, description, next_redirect_url, theme } =
      formData;

    if (
      !old_name ||
      !new_name ||
      !description ||
      !next_redirect_url ||
      !theme
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const slug = old_name.toLowerCase().trim().replace(/\s+/g, "-");
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    const generated_link = `${siteUrl}/product/${slug}-${id}`;

    await db.query(
      `UPDATE products
       SET old_name = ?, new_name = ?, description = ?, next_redirect_url = ?, theme = ?, generated_link = ?
       WHERE id = ?`,
      [
        old_name,
        new_name,
        description,
        next_redirect_url,
        theme,
        generated_link,
        Number(id),
      ]
    );

    return NextResponse.json({ message: "Product updated", generated_link });
  } catch (error: any) {
    console.error("PUT Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// ✅ Correct DELETE request
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params?.id;
    if (!id) {
      return NextResponse.json(
        { error: "Missing product ID" },
        { status: 400 }
      );
    }

    await db.query("DELETE FROM products WHERE id = ?", [Number(id)]);

    return NextResponse.json({ message: "Product deleted" });
  } catch (error: any) {
    console.error("DELETE Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
