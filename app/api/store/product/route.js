import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import imagekit from "@/configs/imagekit";
import prisma from "@/lib/prisma";
import authSeller from "@/middlewares/authSeller";

export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const storeId = await authSeller(userId);
    if (!storeId) {
      return NextResponse.json(
        { error: "you are not authorized to perform this action" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const name = formData.get("name");
    const description = formData.get("description");
    const price = Number(formData.get("price"));
    const category = formData.get("category");
    const mrp = Number(formData.get("mrp"));
    const images = formData.getAll("images");

    if (
      !name ||
      !description ||
      isNaN(price) ||
      !category ||
      isNaN(mrp) ||
      images.length < 1
    ) {
      return NextResponse.json(
        { error: "missing product details" },
        { status: 400 }
      );
    }

    const imagesUrl = await Promise.all(
      images.map(async (image) => {
        const buffer = Buffer.from(await image.arrayBuffer());

        const upload = await imagekit.upload({
          file: buffer,
          fileName: image.name,
          folder: "products",
        });

        return imagekit.url({
          path: upload.filePath,
          transformation: [
            { quality: "auto" },
            { format: "webp" },
            { width: 1024 },
          ],
        });
      })
    );

    await prisma.product.create({
      data: {
        name,
        description,
        mrp,
        price,
        category,
        images: imagesUrl,
        storeId,
      },
    });

    return NextResponse.json({ message: "product added successfully" });
  } catch (error) {
    console.error("product:create error:", error);
    return NextResponse.json(
      { error: error?.message || "Server error" },
      { status: 500 }
    );
  }
}
