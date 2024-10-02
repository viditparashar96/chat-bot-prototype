import cosmosSingleton from "@/lib/cosmos/cosmos";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const { formdata, insuranceIDurl, govtIDurl } = await req.json();

    console.log(formdata);

    if (!formdata) {
      return NextResponse.json({ error: "Invalid Form Data" }, { status: 400 });
    }
    await cosmosSingleton.initialize();
    const container = await cosmosSingleton.getContainer("EHR");

    const createdItem = await container.items.create({
      id: randomUUID(),
      formdata,
      insuranceIDurl,
      govtIDurl,
      type: "appointment",
    });

    console.log("Item created in Cosmos:", createdItem);

    if (!createdItem) {
      return NextResponse.json(
        { error: "Error saving data to Cosmos" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Form Data Received" },
      { status: 201 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
