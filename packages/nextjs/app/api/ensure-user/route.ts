import { NextResponse } from "next/server";
import { createUser, findJustUserByAddress } from "~~/services/database/repositories/users";

export async function POST(req: Request) {
  // Check for authorization header
  const authorization = req.headers.get("Authorization");
  if (!authorization) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const token = authorization.replace("Bearer ", "");
  // Check for secret
  if (token !== process.env.SECRET) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { address } = body;

    if (!address) {
      return new Response("Missing required field: address", { status: 400 });
    }

    const user = await findJustUserByAddress(address);

    if (!user) {
      // Create user if they don't exist
      await createUser({ address });
      return NextResponse.json({ message: "User created", user: { address } }, { status: 201 });
    }

    return NextResponse.json(
      { message: "User already exists", user },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error in ensure-user route:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
