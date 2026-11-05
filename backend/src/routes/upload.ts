import { FastifyInstance } from 'fastify';
import { authenticate } from '../middleware/auth';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

function getS3Client() {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    },
  });
}

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function uploadRoutes(app: FastifyInstance) {
  app.post('/', { preHandler: [authenticate] }, async (request, reply) => {
    const user = (request as any).user;

    if (!process.env.R2_ACCOUNT_ID) {
      return reply.status(503).send({ error: 'File upload not configured' });
    }

    try {
      const data = await request.file();
      if (!data) return reply.status(400).send({ error: 'No file provided' });

      if (!ALLOWED_TYPES.includes(data.mimetype)) {
        return reply.status(400).send({ error: 'Invalid file type. Only images allowed.' });
      }

      const chunks: Buffer[] = [];
      for await (const chunk of data.file) {
        chunks.push(chunk as Buffer);
      }
      const buffer = Buffer.concat(chunks);

      if (buffer.length > MAX_SIZE) {
        return reply.status(400).send({ error: 'File too large. Max 5MB.' });
      }

      const ext = data.mimetype.split('/')[1];
      const key = `${user.id}/${uuidv4()}.${ext}`;

      const s3 = getS3Client();
      await s3.send(
        new PutObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME || 'wishly-uploads',
          Key: key,
          Body: buffer,
          ContentType: data.mimetype,
        })
      );

      const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`;
      return reply.send({ url: publicUrl });
    } catch (error) {
      console.error('Upload error:', error);
      return reply.status(500).send({ error: 'Upload failed' });
    }
  });
}
