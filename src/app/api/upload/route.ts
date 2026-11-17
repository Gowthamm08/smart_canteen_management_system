
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

    const buffer = Buffer.from(await file.arrayBuffer());
    const isPng = buffer.subarray(0, 8).equals(
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    );
    const isJpeg = buffer.length >= 3 &&
      buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    const isWebp = buffer.length >= 12 &&
      buffer.toString("ascii", 0, 4) === "RIFF" &&
      buffer.toString("ascii", 8, 12) === "WEBP";
    const contentMatchesType =
      (file.type === "image/png" && isPng) ||
      (file.type === "image/jpeg" && isJpeg) ||
      (file.type === "image/webp" && isWebp);

    if (!contentMatchesType) {
      return NextResponse.json(
        { success: false, message: "The uploaded file does not match its image type." },
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
