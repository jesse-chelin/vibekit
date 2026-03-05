---
name: file-uploads
description: Adds S3-compatible file upload with drag-drop uploader component, signed URLs, and file management. Use when the user needs file uploads, image uploads, document storage, mentions S3/MinIO, or wants users to attach files. Uses MinIO locally and any S3-compatible provider in production.
---

# File Uploads — S3-Compatible Storage

Full file upload system with drag-and-drop UI, server-side validation, signed URLs for secure access, and S3-compatible storage (MinIO for local dev, any S3 provider for production).

## When NOT to Use

- User only needs to store text data (use the database directly)
- Files are small config/JSON blobs (store in the database as text)
- User wants public static assets (put them in `public/` directory instead)
- User doesn't want to run MinIO or connect to S3 in production

## What It Adds

| File | Purpose |
|------|---------|
| `src/lib/storage.ts` | S3 client: upload, download, delete, signed URL generation |
| `src/trpc/routers/uploads.ts` | tRPC router: presigned URL generation, file metadata CRUD |
| `src/components/patterns/file-uploader.tsx` | Drag-drop upload component with progress and preview |
| `src/app/(app)/files/page.tsx` | File management page |
| `src/app/(app)/files/loading.tsx` | Skeleton loading state |

Prisma schema additions: `File` model with metadata (name, size, type, url, userId).

## Pre-Install Checklist

IMPORTANT: Before installing this skill, verify:

1. For local dev: Docker is available (MinIO runs as a container), OR user will use a cloud S3 provider
2. User understands uploaded files are NOT stored in the database — they go to object storage
3. If deploy-docker skill is installed, MinIO will be added to docker-compose

## Setup

### Local Development (MinIO)

Add MinIO to your docker-compose.yml:

```yaml
services:
  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    volumes:
      - minio_data:/data

volumes:
  minio_data:
```

### Environment Variables

```env
S3_ENDPOINT=http://localhost:9000
S3_BUCKET=vibekit-uploads
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_REGION=us-east-1
```

CRITICAL: Change credentials for production. Never use default MinIO credentials in a deployed environment.

### Production (AWS S3 / Cloudflare R2 / Backblaze B2)

```env
# AWS S3
S3_ENDPOINT=https://s3.us-east-1.amazonaws.com
S3_BUCKET=your-bucket-name
S3_ACCESS_KEY=AKIA...
S3_SECRET_KEY=...
S3_REGION=us-east-1

# Cloudflare R2
S3_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
S3_BUCKET=your-bucket
S3_ACCESS_KEY=...
S3_SECRET_KEY=...
S3_REGION=auto
```

### Create the Bucket

```bash
# MinIO (via mc CLI)
mc alias set local http://localhost:9000 minioadmin minioadmin
mc mb local/vibekit-uploads

# Or via MinIO Console at http://localhost:9001
```

## Architecture

```
Client → FileUploader Component → tRPC uploads.getPresignedUrl → S3 Presigned URL
   ↓                                                                    ↓
   └──────────── Direct upload to S3 (bypasses server) ────────────────┘
   ↓
tRPC uploads.confirmUpload → Save metadata to database
```

- **Presigned URLs**: Files upload directly from the browser to S3 — no server memory/bandwidth bottleneck
- **Server-side validation**: File type and size validated before generating presigned URL
- **Signed download URLs**: Files are private by default — access via time-limited signed URLs

### File Size Limits

Default limits (configurable in `storage.ts`):
- Images: 10MB max
- Documents: 50MB max
- Other: 25MB max

Allowed types: images (jpg, png, gif, webp, svg), documents (pdf, doc, docx, xls, xlsx), text (txt, csv, json)

## Usage in Other Components

```tsx
import { FileUploader } from "@/components/patterns/file-uploader";

<FileUploader
  accept="image/*"
  maxSize={10 * 1024 * 1024} // 10MB
  onUpload={(file) => console.log("Uploaded:", file.url)}
/>
```

## Post-Install Verification

1. Start MinIO: `docker compose up minio -d`
2. Create the bucket via MinIO Console (http://localhost:9001)
3. Start the app: `pnpm dev`
4. Navigate to `/files`
5. Drag a file onto the upload area — it should upload and appear in the file list

## Troubleshooting

**"Access Denied" on upload**: The bucket doesn't exist or credentials are wrong. Verify with `mc ls local/vibekit-uploads`.

**Upload hangs**: CORS is not configured on the S3 bucket. MinIO needs CORS rules to accept browser uploads.

**Files not showing**: The `File` model in Prisma may not be pushed. Run `pnpm db:push`.

**Large files failing**: Check the presigned URL expiry (default 1 hour) and any reverse proxy body size limits (nginx default is 1MB).
