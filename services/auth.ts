import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

const USER_KEY = 'phishguard_user';
const SESSION_KEY = 'phishguard_session';
const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';

export interface User {
    id: string;
    email: string;
    name: string;
    createdAt: string;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    biometricEnabled: boolean;
}

class AuthService {
    private onAuthChangeCallback: ((isAuthenticated: boolean) => void) | null = null;

    // Установить callback для оповещения layout об изменении авторизации
    setOnAuthChangeCallback(cb: (isAuthenticated: boolean) => void) {
        this.onAuthChangeCallback = cb;
    }

    // Проверка доступности биометрии
    async checkBiometricSupport(): Promise<{
        isSupported: boolean;
        biometricType: string;
    }> {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

        let biometricType = 'Биометрия';
        if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
            biometricType = 'Face ID';
        } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
            biometricType = 'Touch ID';
        }

        return {
            isSupported: hasHardware && isEnrolled,
            biometricType,
        };
    }

    // Аутентификация через биометрию
    async authenticateWithBiometric(): Promise<boolean> {
        try {
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Войти в PhishGuard',
                cancelLabel: 'Отмена',
                disableDeviceFallback: false,
                fallbackLabel: 'Использовать пароль',
            });

            return result.success;
        } catch (error) {
            console.error('Biometric auth error:', error);
            return false;
        }
    }

    // Регистрация пользователя
    async register(email: string, password: string, name: string): Promise<User> {
        const user: User = {
            id: `user_${Date.now()}`,
            email,
            name,
            createdAt: new Date().toISOString(),
        };

        // Сохраняем данные пользователя (остаются навсегда)
        await SecureStore.setItemAsync(USER_KEY, JSON.stringify({
            ...user,
            password,
        }));

        // Устанавливаем сессию
        await SecureStore.setItemAsync(SESSION_KEY, 'active');
        this.onAuthChangeCallback?.(true);

        return user;
    }

    // Вход по email/паролю
    async login(email: string, password: string): Promise<User | null> {
        try {
            const stored = await SecureStore.getItemAsync(USER_KEY);
            if (!stored) return null;

            const userData = JSON.parse(stored);
            if (userData.email === email && userData.password === password) {
                const { password: _, ...user } = userData;
                // Устанавливаем сессию
                await SecureStore.setItemAsync(SESSION_KEY, 'active');
                this.onAuthChangeCallback?.(true);
                return user as User;
            }
            return null;
        } catch {
            return null;
        }
    }

    // Получить текущего пользователя
    async getCurrentUser(): Promise<User | null> {
        try {
            const stored = await SecureStore.getItemAsync(USER_KEY);
            if (!stored) return null;

            const { password: _, ...user } = JSON.parse(stored);
            return user as User;
        } catch {
            return null;
        }
    }

    // Проверить, есть ли активная сессия
    async hasActiveSession(): Promise<boolean> {
        const session = await SecureStore.getItemAsync(SESSION_KEY);
        return session === 'active' || session === 'guest';
    }

    // Войти как гость (без регистрации)
    async skipLogin(): Promise<void> {
        await SecureStore.setItemAsync(SESSION_KEY, 'guest');
        this.onAuthChangeCallback?.(true);
    }

    // Включить/выключить биометрию
    async setBiometricEnabled(enabled: boolean): Promise<void> {
        await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, enabled ? 'true' : 'false');
    }

    // Проверить, включена ли биометрия
    async isBiometricEnabled(): Promise<boolean> {
        const value = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
        return value === 'true';
    }

    // Выход — очищаем ТОЛЬКО сессию, данные пользователя остаются
    async logout(): Promise<void> {
        await SecureStore.deleteItemAsync(SESSION_KEY);
        this.onAuthChangeCallback?.(false);
    }
}

export const authService = new AuthService();
export default authService;
