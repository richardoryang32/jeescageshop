// app/api/store/create/route.js
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getImageKit } from "@/configs/imagekit";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const { userId } = getAuth(request);

    const formData = await request.formData();
    const name = formData.get("name");
    const username = formData.get("username");
    const description = formData.get("description");
    const email = formData.get("email");
    const contacts = formData.get("contacts");
    const address = formData.get("address");
    const image = formData.get("image");

    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (!name || !username || !description || !email || !contacts || !image) {
      return NextResponse.json({ error: "missing a store info" }, { status: 400 });
    }

    const existingStore = await prisma.store.findFirst({ where: { userId } });
    if (existingStore) return NextResponse.json({ store: existingStore.status });

    const isUsernameTaken = await prisma.store.findFirst({
      where: { username: username.toLowerCase() },
    });

    if (isUsernameTaken) {
      return NextResponse.json({ error: "username is already taken" }, { status: 400 });
    }

    const imagekit = getImageKit(); // server-only

    // file upload
    const fileBuffer = Buffer.from(await image.arrayBuffer());
    const response = await imagekit.upload({
      file: fileBuffer,
      fileName: image.name || `${username}-logo`,
      folder: "logos",
    });

    const optimizeImage = imagekit.url({
      path: response.filePath,
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
        username: username.toLowerCase(),
        email,
        contact: contacts,
        address,
        logo: optimizeImage,
      },
    });

    // link store to user
    await prisma.user.update({
      where: { id: userId },
      data: { store: { connect: { id: newStore.id } } },
    });

    return NextResponse.json({ message: "applied, waiting for approval" });
  } catch (error) {
    console.error("store:create error:", error);
    return NextResponse.json({ error: error?.code || error?.message || String(error) }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    if (!userId) return NextResponse.json({ status: "unregistered" });

    const store = await prisma.store.findFirst({ where: { userId } });
    if (store) return NextResponse.json({ status: store.status });

    return NextResponse.json({ status: "unregistered" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error?.message || String(error) }, { status: 500 });
  }
}
