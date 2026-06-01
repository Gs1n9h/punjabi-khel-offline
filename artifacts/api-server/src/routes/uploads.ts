import { Router } from "express";
import { requireAuth } from "@clerk/express";
import path from "path";

const router = Router();

// Simple presign endpoint — returns a direct upload URL to the API server itself
// In production, this would integrate with object storage (S3, GCS, etc.)
// For now we store files as base64 data URLs or return a mock upload URL
router.post("/presign", requireAuth(), async (req, res) => {
  const { filename, contentType, folder = "uploads" } = req.body;
  const ext = path.extname(filename) || ".bin";
  const key = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;
  // Return a mock presigned URL pointing to our own upload endpoint
  const baseUrl = process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(",")[0]}` : `http://localhost:${process.env.PORT ?? 5000}`;
  res.json({
    uploadUrl: `${baseUrl}/api/uploads/${encodeURIComponent(key)}`,
    publicUrl: `${baseUrl}/api/uploads/${encodeURIComponent(key)}`,
    key,
  });
});

export default router;
