import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(data: {
    name: string;
    username: string;
    email: string;
    whatsapp?: string;
    password: string;
  }) {
    // Check if email or username already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: data.email }, { username: data.username }],
      },
    });

    if (existingUser) {
      const field = existingUser.email === data.email ? 'Email' : 'Username';
      throw new ConflictException(`${field} sudah terdaftar`);
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        username: data.username,
        email: data.email,
        whatsapp: data.whatsapp || null,
        passwordHash,
      },
    });

    this.logger.log(`New user registered: ${user.email}`);

    return {
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    };
  }

  async login(email: string, password: string) {
    const normalizedEmail = email.toLowerCase().trim();

    // Check user table
    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      this.logger.warn(`Login attempt with unknown email: ${normalizedEmail}`);
      throw new UnauthorizedException('Email atau password salah');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      this.logger.warn(`Invalid password attempt for user: ${normalizedEmail}`);
      throw new UnauthorizedException('Email atau password salah');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);

    this.logger.log(`User logged in: ${normalizedEmail} as ${user.role}`);

    return {
      token,
      role: user.role,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
      },
    };
  }

  async getProfile(userId: string) {

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        whatsapp: true,
        createdAt: true,
        role: true,
      },
    });

    if (!user) throw new UnauthorizedException('User not found');

    return { role: user.role, user };
  }

  async updateProfile(userId: string, data: any) {

    // Check if new email or username is taken by someone else
    if (data.email || data.username) {
      const existingUser = await this.prisma.user.findFirst({
        where: {
          OR: [
            ...(data.email ? [{ email: data.email }] : []),
            ...(data.username ? [{ username: data.username }] : []),
          ],
          NOT: { id: userId },
        },
      });

      if (existingUser) {
        const field = existingUser.email === data.email ? 'Email' : 'Username';
        throw new ConflictException(
          `${field} sudah digunakan oleh pengguna lain`,
        );
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.username && { username: data.username }),
        ...(data.email && { email: data.email }),
        ...(data.whatsapp && { whatsapp: data.whatsapp }),
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        whatsapp: true,
      },
    });

    return updatedUser;
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.passwordHash,
    );
    if (!isPasswordValid)
      throw new UnauthorizedException('Kata sandi saat ini salah');

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
    return { message: 'Berhasil mengubah kata sandi' };
  }
}
