import { FastifyRequest, FastifyReply } from 'fastify';
import { verifyAccessToken } from '../utils/jwt';
import { prisma } from '../utils/prisma';

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({ error: 'Unauthorized', message: 'Missing or invalid authorization header' });
    }

    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
      return reply.status(401).send({ error: 'Unauthorized', message: 'User not found' });
    }

    (request as any).user = user;
  } catch {
    return reply.status(401).send({ error: 'Unauthorized', message: 'Invalid or expired token' });
  }
}
