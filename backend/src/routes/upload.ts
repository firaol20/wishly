import { FastifyInstance } from 'fastify';
import { authenticate } from '../middleware/auth';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'xqyzgifj',
  api_key: process.env.CLOUDINARY_API_KEY || '893313511673197',
  api_secret: process.env.CLOUDINARY_API_SECRET || '15l7DU3YVxSGJ-FlnIB5pBKgqHA',
  secure: true,
});

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function uploadRoutes(app: FastifyInstance) {
  app.post('/', { preHandler: [authenticate] }, async (request, reply) => {
    const user = (request as any).user;

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'xqyzgifj';
    if (!cloudName) {
      return reply.status(503).send({ error: 'Cloudinary storage not configured' });
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
        return reply.status(400).send({ error: 'File too large. Max 10MB.' });
      }

      // Upload buffer directly to Cloudinary
      const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `wishly/${user.id}`,
            resource_type: 'image',
          },
          (error, result) => {
            if (error || !result) {
              reject(error || new Error('Upload failed without result'));
            } else {
              resolve(result);
            }
          }
        );
        uploadStream.end(buffer);
      });

      return reply.send({ url: uploadResult.secure_url });
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      return reply.status(500).send({ error: 'Upload failed' });
    }
  });
}
