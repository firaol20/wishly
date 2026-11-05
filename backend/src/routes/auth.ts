import { FastifyInstance } from 'fastify';
import { prisma } from '../utils/prisma';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';

export async function authRoutes(app: FastifyInstance) {
  // Redirect to Google OAuth
  app.get('/google', async (request, reply) => {
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID || '',
      redirect_uri: process.env.GOOGLE_CALLBACK_URL || '',
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
    });
    return reply.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
  });

  // Google OAuth callback
  app.get('/google/callback', async (request, reply) => {
    const { code } = request.query as { code: string };
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    if (!code) {
      return reply.redirect(`${frontendUrl}?error=oauth_failed`);
    }

    try {
      // Exchange code for tokens
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: process.env.GOOGLE_CLIENT_ID || '',
          client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
          redirect_uri: process.env.GOOGLE_CALLBACK_URL || '',
          grant_type: 'authorization_code',
        }),
      });

      const tokenData = await tokenResponse.json() as any;

      if (!tokenData.access_token) {
        return reply.redirect(`${frontendUrl}?error=token_exchange_failed`);
      }

      // Get user info from Google
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });

      const googleUser = await userInfoResponse.json() as any;

      // Upsert user in database
      const user = await prisma.user.upsert({
        where: { googleId: googleUser.id },
        update: {
          email: googleUser.email,
          name: googleUser.name,
          avatarUrl: googleUser.picture,
        },
        create: {
          googleId: googleUser.id,
          email: googleUser.email,
          name: googleUser.name,
          avatarUrl: googleUser.picture,
        },
      });

      // Issue JWT tokens
      const accessToken = signAccessToken({ userId: user.id, email: user.email });
      const refreshToken = signRefreshToken({ userId: user.id, email: user.email });

      // Set refresh token as httpOnly cookie (support cross-site in production)
      reply.setCookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/',
      });

      // Redirect to frontend with access token
      return reply.redirect(`${frontendUrl}/auth/callback?token=${accessToken}`);
    } catch (error) {
      console.error('OAuth callback error:', error);
      return reply.redirect(`${frontendUrl}?error=server_error`);
    }
  });

  // Refresh access token
  app.post('/refresh', async (request, reply) => {
    try {
      const refreshToken = (request.cookies as any)?.refreshToken;
      if (!refreshToken) {
        return reply.status(401).send({ error: 'No refresh token' });
      }

      const payload = verifyRefreshToken(refreshToken);
      const user = await prisma.user.findUnique({ where: { id: payload.userId } });

      if (!user) {
        return reply.status(401).send({ error: 'User not found' });
      }

      const accessToken = signAccessToken({ userId: user.id, email: user.email });
      return reply.send({ accessToken });
    } catch {
      return reply.status(401).send({ error: 'Invalid refresh token' });
    }
  });

  // Logout
  app.post('/logout', async (request, reply) => {
    reply.clearCookie('refreshToken', {
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });
    return reply.send({ message: 'Logged out successfully' });
  });
}
