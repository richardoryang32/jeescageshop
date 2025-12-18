import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import imagekit from "@/configs/imagekit";
import prisma from "@/lib/prisma";
import ensureUser from "@/lib/ensureUser";

export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await ensureUser(userId);

    const formData = await request.formData();
    const name = formData.get("name");
    const username = formData.get("username");
    const description = formData.get("description");
    const email = formData.get("email");
    const contacts = formData.get("contacts");
    const address = formData.get("address");
    const image = formData.get("image");

    if (!name || !username || !description || !email || !contacts || !address || !image) {
      return NextResponse.json({ error: "missing store info" }, { status: 400 });
    }

    const existingStore = await prisma.store.findFirst({ where: { userId } });
    if (existingStore) {
      return NextResponse.json({ status: existingStore.status });
    }

    const isUsernameTaken = await prisma.store.findFirst({
      where: { username: username.toLowerCase().trim() },
    });

    if (isUsernameTaken) {
      return NextResponse.json({ error: "username is already taken" }, { status: 400 });
    }

    const fileBuffer = Buffer.from(await image.arrayBuffer());

    const upload = await imagekit.upload({
      file: fileBuffer,
      fileName: image.name || `${username}-logo`,
      folder: "logos",
    });

    const logoUrl = imagekit.url({
      path: upload.filePath,
      transformation: [
        { quality: "auto" },
        { format: "webp" },
        { width: 200 },
      ],
    });

    const newStore = await prisma.store.create({
      data: {
        userId,
        name,
        description,
        username: username.toLowerCase().trim(),
        email,
        contact: contacts,
        address,
        logo: logoUrl,
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { store: { connect: { id: newStore.id } } },
    });

    return NextResponse.json({ message: "applied, waiting for approval" });
  } catch (error) {
    console.error("store:create error:", error);
    return NextResponse.json(
      { error: error?.message || "Server error" },
      { status: 500 }
    );
  }
}
