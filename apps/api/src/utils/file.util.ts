import {BadRequestException} from '@nestjs/common';
import {promises as fs} from 'fs';
import {join} from 'path';

export class FileUtil {
    // 文件存储根目录
    private static readonly documentRootPath = './uploads/documents';
    private static readonly imageRootPath = './uploads/images';
    private static readonly avatarRootPath = './uploads/avatars';

    // 支持的文档类型
    private static readonly allowedDocumentTypes = [
        'text/plain',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/markdown',
        'application/json',
    ];

    // 支持的图像类型
    private static readonly allowedImageTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml',
    ];

    // 文件大小限制 (bytes)
    private static readonly maxSize = {
        document: 10 * 1024 * 1024, // 10MB
        image: 5 * 1024 * 1024,     // 5MB
    };

    /**
     * 验证文档文件
     * @param file Express.Multer.File 对象
     */
    static validateDocumentFile(file: Express.Multer.File): void {
        this.validateFile(file, 'document');
    }

    /**
     * 验证图像文件
     * @param file Express.Multer.File 对象
     */
    static validateImageFile(file: Express.Multer.File): void {
        this.validateFile(file, 'image');
    }

    /**
     * 通用文件验证方法
     * @param file Express.Multer.File 对象
     * @param fileType 文件类型 ('document' | 'image')
     */
    private static validateFile(file: Express.Multer.File, fileType: 'document' | 'image'): void {
        // 检查文件大小
        const maxSize = this.maxSize[fileType];
        if (file.size > maxSize) {
            throw new BadRequestException(
                `File ${file.originalname} is too large. Maximum size for ${fileType} is ${this.formatFileSize(maxSize)}.`
            );
        }

        // 检查文件类型
        const allowedTypes = fileType === 'document'
            ? this.allowedDocumentTypes
            : this.allowedImageTypes;

        if (!allowedTypes.includes(file.mimetype)) {
            throw new BadRequestException(
                `File type ${file.mimetype} is not allowed for ${file.originalname}. Allowed types: ${allowedTypes.join(', ')}`
            );
        }
    }

    /**
     * 生成唯一文件名
     * @param originalName 原始文件名
     * @returns 唯一文件名
     */
    static generateUniqueFileName(originalName: string): string {
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const ext = originalName.substring(originalName.lastIndexOf('.'));
        const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.'));
        return `${nameWithoutExt}_${timestamp}_${randomString}${ext}`;
    }

    /**
     * 获取按日期分类的目录路径 (格式: YYYY/MM/DD)
     * @returns 日期目录路径
     */
    static getDatePath(): string {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return join(String(year), `${month}-${day}`);
    }

    /**
     * 确保文档上传目录存在（包括日期子目录）
     */
    static async ensureDocumentDirectory(): Promise<void> {
        const datePath = this.getDatePath();
        const fullPath = join(this.documentRootPath, datePath);
        await this.ensureDirectory(fullPath);
    }

    /**
     * 确保头像上传目录存在
     */
    static async ensureAvatarDirectory(): Promise<void> {
        await this.ensureDirectory(this.avatarRootPath);
    }

    /**
     * 确保图像上传目录存在（包括日期子目录）
     */
    static async ensureImageDirectory(): Promise<void> {
        const datePath = this.getDatePath();
        const fullPath = join(this.imageRootPath, datePath);
        await this.ensureDirectory(fullPath);
    }

    /**
     * 获取文档存储路径（包含日期目录）
     * @param filename 文件名
     * @returns 完整路径
     */
    static getDocumentPath(filename: string): string {
        const datePath = this.getDatePath();
        return join(this.documentRootPath, datePath, filename);
    }

    /**
     * 获取头像储路径
     * @param filename 文件名
     * @returns 完整路径
     */
    static getAvatarImagePath(filename: string): string {
        return join(this.avatarRootPath, filename);
    }

    /**
     * 获取图像存储路径（包含日期目录）
     * @param filename 文件名
     * @returns 完整路径
     */
    static getImagePath(filename: string): string {
        const datePath = this.getDatePath();
        return join(this.imageRootPath, datePath, filename);
    }

    /**
     * 获取文档相对路径（相对于根目录）
     * @param filename 文件名
     * @returns 相对路径
     */
    static getDocumentRelativePath(filename: string): string {
        const datePath = this.getDatePath();
        return join(datePath, filename);
    }

    /**
     * 获取图像相对路径（相对于根目录）
     * @param filename 文件名
     * @returns 相对路径
     */
    static getImageRelativePath(filename: string): string {
        const datePath = this.getDatePath();
        return join(datePath, filename);
    }

    /**
     * 通用目录确保存在方法
     * @param path 目录路径
     */
    private static async ensureDirectory(path: string): Promise<void> {
        try {
            await fs.access(path);
        } catch {
            // 如果目录不存在则创建
            await fs.mkdir(path, {recursive: true});
        }
    }

    /**
     * 删除文件
     * @param filePath 文件路径
     */
    static async deleteFile(filePath: string): Promise<void> {
        try {
            await fs.unlink(filePath);
        } catch (error) {
            if (error.code !== 'ENOENT') {
                // 如果不是文件不存在错误，则抛出异常
                throw new Error(`Failed to delete file ${filePath}: ${error.message}`);
            }
        }
    }

    /**
     * 格式化文件大小显示
     * @param bytes 字节数
     * @returns 格式化后的文件大小字符串
     */
    private static formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * 获取指定日期的目录路径
     * @param date 日期对象，默认为当前日期
     * @returns 日期目录路径
     */
    static getDatePathForDate(date: Date = new Date()): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return join(String(year), month, day);
    }

    /**
     * 获取指定日期的文档完整路径
     * @param filename 文件名
     * @param date 日期对象
     * @returns 完整路径
     */
    static getDocumentPathForDate(filename: string, date: Date = new Date()): string {
        const datePath = this.getDatePathForDate(date);
        return join(this.documentRootPath, datePath, filename);
    }

    /**
     * 获取指定日期的图像完整路径
     * @param filename 文件名
     * @param date 日期对象
     * @returns 完整路径
     */
    static getImagePathForDate(filename: string, date: Date = new Date()): string {
        const datePath = this.getDatePathForDate(date);
        return join(this.imageRootPath, datePath, filename);
    }

    static generateChunkName(fileName: string, chunkIndex: number): string {
        let name = fileName;
        // 处理路径分隔符（兼容 Windows 和 Unix）
        const lastSlashIndex = Math.max(name.lastIndexOf('/'), name.lastIndexOf('\\'));
        if (lastSlashIndex >= 0) {
            name = name.substring(lastSlashIndex + 1);
        }

        // 移除扩展名
        const lastDotIndex = name.lastIndexOf('.');
        if (lastDotIndex > 0) { // > 0 确保不是以 . 开头的隐藏文件
            name = name.substring(0, lastDotIndex);
        }

        // 清理文件名：只保留字母、数字、中文、连字符和下划线
        name = name
            .replace(/[^a-zA-Z0-9\u4e00-\u9fa5\-_]/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_|_$/g, '');

        // 限制长度
        if (name.length > 50) {
            name = name.substring(0, 50);
        }

        // 确保不为空
        if (!name) {
            name = 'chunk';
        }

        return `${name}-${chunkIndex + 1}`;
    }

}
