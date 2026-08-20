import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import { Role } from '@prisma/client';

export const getUsers = async (req: Request, res: Response) => {
  const { role, search, page = '1', limit = '20' } = req.query;
  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

  const where: any = {};
  if (role) where.role = role as Role;
  if (search) {
    where.OR = [
      { name: { contains: search as string, mode: 'insensitive' } },
      { email: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      select: {
        id: true, name: true, email: true, phone: true,
        role: true, isActive: true, createdAt: true,
      },
      skip,
      take: parseInt(limit as string),
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);

  res.json({ success: true, data: users, meta: { total, page: parseInt(page as string), limit: parseInt(limit as string) } });
};

export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;
  // Non-admin can only access their own profile
  if (req.user?.role !== 'ADMIN' && req.user?.userId !== id) {
    throw new AppError('Access denied', 403);
  }

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true, name: true, email: true, phone: true,
      role: true, isActive: true, createdAt: true,
    },
  });

  if (!user) throw new AppError('User not found', 404);
  res.json({ success: true, data: user });
};

export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (req.user?.role !== 'ADMIN' && req.user?.userId !== id) {
    throw new AppError('Access denied', 403);
  }

  const { name, phone, isActive } = req.body;
  const updateData: any = {};
  if (name !== undefined) updateData.name = name;
  if (phone !== undefined) updateData.phone = phone;
  if (isActive !== undefined && req.user?.role === 'ADMIN') updateData.isActive = isActive;

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
    select: { id: true, name: true, email: true, phone: true, role: true, isActive: true },
  });

  res.json({ success: true, data: user });
};

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.user.delete({ where: { id } });
  res.json({ success: true, message: 'User deleted' });
};

export const toggleUserStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new AppError('User not found', 404);

  const updated = await prisma.user.update({
    where: { id },
    data: { isActive: !user.isActive },
    select: { id: true, name: true, email: true, role: true, isActive: true },
  });

  res.json({ success: true, data: updated });
};
