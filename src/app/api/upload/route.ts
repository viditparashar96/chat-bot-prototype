import { env_config } from "@/config/env-config";
import cosmosSingleton from "@/lib/cosmos/cosmos";
import { BlobServiceClient } from "@azure/storage-blob";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    await cosmosSingleton.initialize();
    const container = await cosmosSingleton.getContainer("Documents");
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      env_config.azureBlobConnectionString
    );
    const containerClient = blobServiceClient.getContainerClient("documents");

    const blobName = `${Date.now()}-${file.name}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const arrayBuffer = await file.arrayBuffer();
    await blockBlobClient.uploadData(arrayBuffer);

    const document = {
      id: randomUUID(),
      name: blobName,
      url: blockBlobClient.url,
    };
    const { resource } = await container.items.create(document);

    return NextResponse.json(
      { message: "File uploaded successfully", document: resource },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
};
