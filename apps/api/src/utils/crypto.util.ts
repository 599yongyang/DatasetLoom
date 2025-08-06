import * as crypto from 'crypto';

export class CryptoUtil {
  private static readonly algorithm = 'aes-256-cbc';
  private static readonly secretKey = process.env.ENCRYPTION_KEY || 'default-secret-key-that-should-be-changed';
  private static readonly ivLength = 16;

  /**
   * 加密数据
   * @param data 需要加密的字符串
   * @returns 加密后的字符串 (格式: iv:encryptedData)
   */
  static encrypt(data: string): string {
    try {
      const iv = crypto.randomBytes(this.ivLength);
      const key = crypto.createHash('sha256').update(this.secretKey).digest('base64').slice(0, 32);

      const cipher = crypto.createCipheriv(this.algorithm, Buffer.from(key), iv);
      let encrypted = cipher.update(data);
      encrypted = Buffer.concat([encrypted, cipher.final()]);

      return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
    } catch (error) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  /**
   * 解密数据
   * @param encryptedData 加密的字符串 (格式: iv:encryptedData)
   * @returns 解密后的原始字符串
   */
  static decrypt(encryptedData: string): string {
    try {
      const [ivHex, encryptedHex] = encryptedData.split(':');

      if (!ivHex || !encryptedHex) {
        throw new Error('Invalid encrypted data format');
      }

      const iv = Buffer.from(ivHex, 'hex');
      const encrypted = Buffer.from(encryptedHex, 'hex');
      const key = crypto.createHash('sha256').update(this.secretKey).digest('base64').slice(0, 32);

      const decipher = crypto.createDecipheriv(this.algorithm, Buffer.from(key), iv);
      let decrypted = decipher.update(encrypted);
      decrypted = Buffer.concat([decrypted, decipher.final()]);

      return decrypted.toString();
    } catch (error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  /**
   * 哈希数据
   * @param data 需要哈希的数据
   * @param algorithm 哈希算法 (默认: sha256)
   * @returns 哈希值
   */
  static hash(data: string, algorithm: string = 'sha256'): string {
    try {
      return crypto.createHash(algorithm).update(data).digest('hex');
    } catch (error) {
      throw new Error(`Hashing failed: ${error.message}`);
    }
  }

  /**
   * 生成随机字符串
   * @param length 字符串长度
   * @returns 随机字符串
   */
  static generateRandomString(length: number = 32): string {
    return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
  }

  /**
   * 生成 HMAC
   * @param data 数据
   * @param secret 密钥
   * @param algorithm 算法 (默认: sha256)
   * @returns HMAC 值
   */
  static generateHmac(data: string, secret: string, algorithm: string = 'sha256'): string {
    try {
      return crypto.createHmac(algorithm, secret).update(data).digest('hex');
    } catch (error) {
      throw new Error(`HMAC generation failed: ${error.message}`);
    }
  }
}
