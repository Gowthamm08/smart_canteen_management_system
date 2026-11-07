
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/authorization";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    // Only Admin can upload food images
    const auth = await requireRole(["ADMIN"]);

    if (!auth.authorized) {
      return auth.response;
    }

    const formData = await request.formData();
    const file = formData.get("image");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, message: "Please select an image." },
        { status: 400 }
      );
    }

    const allowedTypes: Record<string, string> = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/webp": ".webp",
    };

    if (!allowedTypes[file.type]) {
      return NextResponse.json(
        {
          success: false,
          message: "Only JPG, PNG and WEBP images are allowed.",
        },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: "Image must be smaller than 5 MB." },
        { status: 400 }
      );
    }

    const extension = allowedTypes[file.type];
    const filename = `${randomUUID()}${extension}`;

    const uploadDirectory = path.join(
      process.cwd(),
      "public",
      "uploads"
    );

    await mkdir(uploadDirectory, { recursive: true });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    await writeFile(
      path.join(uploadDirectory, filename),
      buffer
    );

    return NextResponse.json({
      success: true,
      image_url: `/uploads/${filename}`,
      message: "Image uploaded successfully.",
    });
  } catch (error) {
    console.error("Image upload error:", error);

    return NextResponse.json(
      { success: false, message: "Image upload failed." },
      { status: 500 }
    );
  }
}
