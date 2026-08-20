import { prisma } from '../config/prisma';
import { NotificationType } from '@prisma/client';

export async function createNotificationsForAdmins(data: {
  title: string;
  message: string;
  type: NotificationType;
}) {
  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN', isActive: true },
    select: { id: true },
  });

  if (admins.length === 0) return;

  await prisma.notification.createMany({
    data: admins.map(a => ({ userId: a.id, ...data })),
  });
}

export async function createNotificationForUser(
  userId: string,
  data: { title: string; message: string; type: NotificationType }
) {
  return prisma.notification.create({ data: { userId, ...data } });
}

export async function createNotificationsForRole(
  role: 'PASSENGER' | 'DRIVER' | 'OPERATOR' | 'ADMIN',
  data: { title: string; message: string; type: NotificationType }
) {
  const users = await prisma.user.findMany({
    where: { role, isActive: true },
    select: { id: true },
  });

  if (users.length === 0) return;

  await prisma.notification.createMany({
    data: users.map(u => ({ userId: u.id, ...data })),
  });
}
