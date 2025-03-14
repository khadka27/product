/* eslint-disable @typescript-eslint/no-explicit-any */
import { type NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

// This is the exact type structure Next.js expects
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id)
      return NextResponse.json(
        { error: "Missing product ID" },
        { status: 400 }
      );

    const [rows]: any = await db.query("SELECT * FROM products WHERE id = ?", [
      Number.parseInt(id, 10),
    ]);

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id)
      return NextResponse.json(
        { error: "Missing product ID" },
        { status: 400 }
      );

    const formData = await request.formData();
    const old_name = formData.get("old_name")?.toString();
    const new_name = formData.get("new_name")?.toString();
    const description = formData.get("description")?.toString();
    const next_redirect_url = formData.get("next_redirect_url")?.toString();
    const theme = formData.get("theme")?.toString();

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
        Number.parseInt(id, 10),
      ]
    );

    return NextResponse.json({ message: "Product updated", generated_link });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id)
      return NextResponse.json(
        { error: "Missing product ID" },
        { status: 400 }
      );

    await db.query("DELETE FROM products WHERE id = ?", [
      Number.parseInt(id, 10),
    ]);

    return NextResponse.json({ message: "Product deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
