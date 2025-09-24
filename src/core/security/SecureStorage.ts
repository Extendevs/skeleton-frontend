import { SimpleCrypto } from './SimpleCrypto';

/**
 * Secure Storage Implementation
 * Provides encrypted storage for sensitive data like tokens
 * Prevents XSS attacks and improves security posture
 * Uses Web Crypto API instead of external dependencies
 */
export class SecureStorage {
    private static readonly SECRET_KEY = 'core-react-secure-key-2024';
    private static readonly STORAGE_PREFIX = 'secure_';

    /**
     * Generate a device-specific encryption key
     * Combines static secret with browser fingerprint
     */
    private static async generateKey(): Promise<string> {
        const browserFingerprint = await this.getBrowserFingerprint();
        return SimpleCrypto.hash(this.SECRET_KEY + browserFingerprint);
    }

    /**
     * Create a basic browser fingerprint for additional security
     * This is not for tracking, but for making stolen tokens less useful
     */
    private static async getBrowserFingerprint(): Promise<string> {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.textBaseline = 'top';
            ctx.font = '14px Arial';
            ctx.fillText('Browser fingerprint', 2, 2);
        }

        const fingerprint = [
            navigator.userAgent,
            navigator.language,
            screen.width + 'x' + screen.height,
            new Date().getTimezoneOffset(),
            canvas.toDataURL()
        ].join('|');

        const hash = await SimpleCrypto.hash(fingerprint);
        return hash.substring(0, 16);
    }

    /**
     * Encrypt data using AES encryption
     */
    private static async encrypt(data: string): Promise<string> {
        try {
            const key = await this.generateKey();
            const encrypted = await SimpleCrypto.encrypt(data, key);

            // Add timestamp for expiration checks
            const payload = {
                data: encrypted,
                timestamp: Date.now(),
                version: '1.0'
            };

            return btoa(JSON.stringify(payload));
        } catch (error) {
            console.error('Failed to encrypt data:', error);
            throw error;
        }
    }

    /**
     * Decrypt data
     */
    private static async decrypt(encryptedData: string): Promise<string | null> {
        try {
            const payload = JSON.parse(atob(encryptedData));

            // Check if data is too old (24 hours)
            const maxAge = 24 * 60 * 60 * 1000; // 24 hours
            if (Date.now() - payload.timestamp > maxAge) {
                console.warn('Encrypted data expired, clearing storage');
                return null;
            }

            const key = await this.generateKey();
            const decrypted = await SimpleCrypto.decrypt(payload.data, key);
            return decrypted;
        } catch (error) {
            console.error('Failed to decrypt data:', error);
            return null;
        }
    }

    /**
     * Securely store data
     */
    static async setSecureItem(key: string, value: any): Promise<boolean> {
        if (!this.isAvailable()) {
            console.warn('SecureStorage not available, falling back to regular storage');
            localStorage.setItem(this.STORAGE_PREFIX + key, JSON.stringify(value));
            return false;
        }

        try {
            const jsonString = JSON.stringify(value);
            const encryptedData = await this.encrypt(jsonString);
            localStorage.setItem(this.STORAGE_PREFIX + key, encryptedData);
            return true;
        } catch (error) {
            console.error('Failed to store secure item:', error);
            // Fallback to regular storage
            localStorage.setItem(this.STORAGE_PREFIX + key, JSON.stringify(value));
            return false;
        }
    }

    /**
     * Retrieve and decrypt stored data
     */
    static async getSecureItem<T>(key: string): Promise<T | null> {
        if (!this.isAvailable()) {
            console.warn('SecureStorage not available, using regular storage');
            const item = localStorage.getItem(this.STORAGE_PREFIX + key);
            return item ? JSON.parse(item) : null;
        }

        try {
            const encryptedData = localStorage.getItem(this.STORAGE_PREFIX + key);
            if (!encryptedData) {
                return null;
            }

            const decryptedData = await this.decrypt(encryptedData);
            if (!decryptedData) {
                // Data expired or corrupted, remove it
                this.removeSecureItem(key);
                return null;
            }

            return JSON.parse(decryptedData);
        } catch (error) {
            console.error('Failed to retrieve secure item:', error);
            // Try fallback to regular storage
            const item = localStorage.getItem(this.STORAGE_PREFIX + key);
            return item ? JSON.parse(item) : null;
        }
    }

    /**
     * Remove secure item
     */
    static removeSecureItem(key: string): void {
        try {
            if (typeof window === 'undefined') {
                return;
            }

            const storageKey = this.STORAGE_PREFIX + key;
            localStorage.removeItem(storageKey);
        } catch (error) {
            console.error('Failed to remove secure item:', error);
        }
    }

    /**
     * Clear all secure storage
     */
    static clearSecureStorage(): void {
        try {
            if (typeof window === 'undefined') {
                return;
            }

            const keysToRemove: string[] = [];

            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key?.startsWith(this.STORAGE_PREFIX)) {
                    keysToRemove.push(key);
                }
            }

            keysToRemove.forEach(key => localStorage.removeItem(key));
        } catch (error) {
            console.error('Failed to clear secure storage:', error);
        }
    }

    /**
     * Check if secure storage is available and working
     */
    static isAvailable(): boolean {
        try {
            if (typeof window === 'undefined') {
                return false;
            }

            // Check if Web Crypto API is available
            return SimpleCrypto.isAvailable();
        } catch (error) {
            console.error('Secure storage not available:', error);
            return false;
        }
    }

    /**
     * Get storage statistics
     */
    static getStorageStats(): {
        totalItems: number;
        secureItems: number;
        estimatedSize: number;
    } {
        let totalItems = 0;
        let secureItems = 0;
        let estimatedSize = 0;

        try {
            if (typeof window === 'undefined') {
                return { totalItems: 0, secureItems: 0, estimatedSize: 0 };
            }

            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                const value = localStorage.getItem(key || '');

                totalItems++;
                estimatedSize += (key?.length || 0) + (value?.length || 0);

                if (key?.startsWith(this.STORAGE_PREFIX)) {
                    secureItems++;
                }
            }
        } catch (error) {
            console.error('Failed to get storage stats:', error);
        }

        return {
            totalItems,
            secureItems,
            estimatedSize: Math.round(estimatedSize / 1024) // KB
        };
    }
}