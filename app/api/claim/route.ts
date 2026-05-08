import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { betId, marketId, address, amount } = body;

    if (!betId || !marketId || !address || !amount) {
      return NextResponse.json(
        { error: "Missing required fields: betId, marketId, address, amount" },
        { status: 400 }
      );
    }

    // In production: integrate with Circle App Kit SDK here
    // to initiate real USDC transfer to user's wallet address
    // const circleClient = new CircleAppKit({ apiKey: process.env.CIRCLE_API_KEY });
    // const transfer = await circleClient.transfer({ to: address, amount, currency: "USDC" });

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const txHash = `0x${Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("")}`;

    return NextResponse.json({
      success: true,
      txHash,
      amount,
      address,
      betId,
      marketId,
      message: `Successfully claimed ${amount} USDC for bet ${betId}`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Claim error:", error);
    return NextResponse.json(
      { error: "Failed to process claim" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "ArcPredict Claim API v1.0",
    description: "POST to /api/claim with betId, marketId, address, amount to claim USDC rewards",
  });
}
