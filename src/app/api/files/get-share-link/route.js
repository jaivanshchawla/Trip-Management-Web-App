import { NextRequest, NextResponse } from "next/server";
import { getPresignedUrl } from "@/helpers/fileOperation";
import { verifyToken } from "@/utils/auth";

/**
 * POST /api/files/get-share-link
 * Generate a presigned URL for sharing a document
 * 
 * Request body:
 * {
 *   "fileUrl": "https://bucket.s3.region.amazonaws.com/key" or "s3://bucket/key"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "shareUrl": "https://presigned-url",
 *   "expiresIn": 172800
 * }
 */
export async function POST(req) {
  try {
    // Verify authentication
    const user = await verifyToken(req);
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 }
      );
    }

    // Parse request body
    const body = await req.json();
    const { fileUrl } = body;

    // Validate input
    if (!fileUrl || typeof fileUrl !== 'string') {
      return NextResponse.json({ 
          success: false, 
          message: "Invalid requestUrl is required" 
        }, { status: 400 }
      );
    }

    // Generate presigned URL (48 hours expiry)
    const expiresIn = 172800; // 48 hours in seconds
    const shareUrl = await getPresignedUrl(fileUrl, expiresIn);

    return NextResponse.json({
      success: true,
      shareUrl,
      expiresIn,
      message: "Share link generated successfully"
    });

  } catch (error) {
    console.error("Error generating share link:", error);
    
    // Handle specific error cases
    if (error.message === "File not found") {
      return NextResponse.json({ 
          success: false, 
          message: "File unavailable or deleted" 
        }, { status: 404 }
      );
    }
    
    return NextResponse.json({ 
        success: false, 
        message: error.message || "Failed to generate share link" 
      }, { status: 500 }
    );
  }
}
