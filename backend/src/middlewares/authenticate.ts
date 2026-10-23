import { FastifyReply, FastifyRequest } from 'fastify';

/**
 * Pre-handler authentication hook.
 * Verifies the Bearer JWT token from the Authorization header.
 * Populates request.user with { id, phone } upon success.
 * Automatically replies with 401 Unauthorized if missing or invalid.
 */
export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    return reply.status(401).send({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Authentication token is missing, invalid, or expired',
    });
  }
}
