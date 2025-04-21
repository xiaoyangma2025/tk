import { NextResponse } from "next/server";

export async function POST(request) {
  const payload = await request.json();
  console.log("Webhook received:", payload);
  
  // 这里可以添加代码来处理webhook回调，例如更新数据库或发送通知
  
  return new NextResponse(null, { status: 204 });
} 