import { NextResponse } from "next/server";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function GET(request, context) {
  const { params } = context;
  const { id } = params;
  
  console.log("获取预测结果ID:", id);
  
  try {
    const prediction = await replicate.predictions.get(id);
    console.log("Replicate API响应:", prediction);
    
    if (prediction?.error) {
      return NextResponse.json({ detail: prediction.error }, { status: 500 });
    }
    
    return NextResponse.json(prediction);
  } catch (error) {
    console.error("获取预测结果错误:", error);
    return NextResponse.json({ detail: error.message }, { status: 500 });
  }
}