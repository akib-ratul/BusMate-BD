import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { config } from '../config';
import { AppError } from '../middleware/errorHandler';
import { Role } from '@prisma/client';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['PASSENGER', 'DRIVER', 'OPERATOR', 'ADMIN']).default('PASSENGER'),
  // Driver-specific
  licenseNumber: z.string().optional(),
  // Operator-specific
  organizationName: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function generateToken(userId: string, email: string, role: Role): string {
  return jwt.sign({ userId, email, role }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  } as jwt.SignOptions);
}

export const register = async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.errors.map(e => e.message).join(', '), 400);
  }

  const { name, email, phone, password, role, licenseNumber, organizationName } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new AppError('Email already registered', 409);

  // Validate role-specific fields
  if (role === 'DRIVER' && !licenseNumber) {
    throw new AppError('License number is required for drivers', 400);
  }
  if (role === 'OPERATOR' && !organizationName) {
    throw new AppError('Organization name is required for operators', 400);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      phone,
      passwordHash,
      role: role as Role,
    },
  });

  // Create role-specific profile
  if (role === 'PASSENGER') {
    await prisma.passenger.create({ data: { userId: user.id } });
  } else if (role === 'DRIVER') {
    await prisma.driver.create({
      data: { userId: user.id, licenseNumber: licenseNumber! },
    });
  } else if (role === 'OPERATOR') {
    await prisma.transportOperator.create({
      data: { userId: user.id, organizationName: organizationName! },
    });
  }

  const token = generateToken(user.id, user.email, user.role);

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    },
  });
};

export const login = async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError('Invalid email or password', 400);
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) {
    throw new AppError('Invalid credentials', 401);
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) throw new AppError('Invalid credentials', 401);

  // Load role profile
  let profile = null;
  if (user.role === 'PASSENGER') {
    profile = await prisma.passenger.findUnique({ where: { userId: user.id } });
  } else if (user.role === 'DRIVER') {
    profile = await prisma.driver.findUnique({
      where: { userId: user.id },
      include: { bus: { include: { route: true } } },
    });
  } else if (user.role === 'OPERATOR') {
    profile = await prisma.transportOperator.findUnique({ where: { userId: user.id } });
  }

  const token = generateToken(user.id, user.email, user.role);

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profile,
      },
    },
  });
};

export const getMe = async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  if (!user) throw new AppError('User not found', 404);

  let profile = null;
  if (user.role === 'PASSENGER') {
    profile = await prisma.passenger.findUnique({ where: { userId: user.id } });
  } else if (user.role === 'DRIVER') {
    profile = await prisma.driver.findUnique({
      where: { userId: user.id },
      include: { bus: { include: { route: true } } },
    });
  } else if (user.role === 'OPERATOR') {
    profile = await prisma.transportOperator.findUnique({ where: { userId: user.id } });
  }

  res.json({ success: true, data: { ...user, profile } });
};

export const updateProfile = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { name, phone } = req.body;

  const user = await prisma.user.update({
    where: { id: userId },
    data: { name, phone },
    select: { id: true, name: true, email: true, phone: true, role: true },
  });

  res.json({ success: true, data: user });
};
