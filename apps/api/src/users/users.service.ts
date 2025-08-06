import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { hash } from 'argon2';
import { AuthRegisterDto } from '@/auth/dto/auth-register.dto';
import { FileUtil } from '@/utils/file.util';
import { promises as fs } from 'fs';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) {
    }

    async create(registerDto: AuthRegisterDto) {
        const { password, ...user } = registerDto;
        const hashedPassword = await hash(password);
        return this.prisma.users.create({
            data: {
                password: hashedPassword,
                ...user
            }
        });
    }

    getInfoById(id: string) {
        return this.prisma.users.findUnique({
            where: { id }
        });
    }

    async updateInfo(id: string, file: Express.Multer.File, name: string) {
        try {
            const data: any = { name };
            if (file) {
                await FileUtil.ensureAvatarDirectory();
                FileUtil.validateImageFile(file);
                // 生成唯一文件名
                const fileName = FileUtil.generateUniqueFileName(file.originalname);
                const filePath = FileUtil.getAvatarImagePath(fileName);
                // 保存文件
                await fs.writeFile(filePath, file.buffer);
                data.avatar = filePath;
            }

            return this.prisma.users.update({ data: data, where: { id } });
        } catch (error) {
            console.error('Error update user info:', error);
            throw error;
        }
    }

    async updatePassword(id: string, password: string) {
        try {
            const hashedPassword = await hash(password);
            return this.prisma.users.update({
                where: { id },
                data: { password: hashedPassword }
            });
        } catch (error) {
            console.error('Failed to update user password in database');
            throw error;
        }
    }

    async findByEmail(email: string) {
        try {
            return await this.prisma.users.findFirst({
                where: { email },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    password: true,
                    role: true,
                    avatar: true,
                    projectMembers: {
                        select: {
                            projectId: true,
                            role: true
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Failed to get users by email in database');
            throw error;
        }
    }

    async getPermissionsById(id: string) {
        try {
            return await this.prisma.users.findUnique({
                where: { id },
                select: {
                    projectMembers: {
                        select: {
                            projectId: true,
                            role: true
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Failed to get users by email in database');
            throw error;
        }
    }

    getUserByEmails(emails: string[]) {
        try {
            return this.prisma.users.findMany({
                where: { email: { in: emails } },
                select: {
                    id: true,
                    email: true
                }
            });
        } catch (error) {
            console.error('Failed to get users by emails in database');
            throw error;
        }
    }
}
