import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors } from '../../constants/Colors';
import { authService } from '../../services/auth';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [biometricAvailable, setBiometricAvailable] = useState(false);
    const [biometricType, setBiometricType] = useState('');

    useEffect(() => {
        checkBiometricAndAutoLogin();
    }, []);

    const checkBiometricAndAutoLogin = async () => {
        const { isSupported, biometricType } = await authService.checkBiometricSupport();
        const biometricEnabled = await authService.isBiometricEnabled();
        const user = await authService.getCurrentUser();

        if (isSupported && biometricEnabled && user) {
            setBiometricAvailable(true);
            setBiometricType(biometricType);
        }
    };

    const handleBiometricLogin = async () => {
        const success = await authService.authenticateWithBiometric();
        if (success) {
            router.replace('/(tabs)');
        } else {
            Alert.alert('Ошибка', 'Биометрическая аутентификация не удалась');
        }
    };

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Ошибка', 'Заполните все поля');
            return;
        }

        setLoading(true);
        try {
            const user = await authService.login(email, password);

            if (user) {
                router.replace('/(tabs)');
            } else {
                Alert.alert('Ошибка', 'Неверный email или пароль');
            }
        } catch (error) {
            Alert.alert('Ошибка', 'Не удалось войти');
        } finally {
            setLoading(false);
        }
    };

    return (
        <LinearGradient
            colors={[Colors.background.primary, Colors.background.secondary]}
            style={styles.container}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <Animated.View entering={FadeInUp.duration(600)} style={styles.header}>
                    <View style={styles.logoContainer}>
                        <Ionicons name="shield-checkmark" size={60} color={Colors.primary[400]} />
                    </View>
                    <Text style={styles.title}>PhishGuard</Text>
                    <Text style={styles.subtitle}>Защита от фишинга</Text>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.form}>
                    <View style={styles.inputContainer}>
                        <Ionicons name="mail-outline" size={20} color={Colors.text.secondary} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            placeholderTextColor={Colors.text.muted}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Ionicons name="lock-closed-outline" size={20} color={Colors.text.secondary} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Пароль"
                            placeholderTextColor={Colors.text.muted}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                            <Ionicons
                                name={showPassword ? "eye-off-outline" : "eye-outline"}
                                size={20}
                                color={Colors.text.secondary}
                            />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        <LinearGradient
                            colors={[Colors.primary[400], Colors.primary[600]]}
                            style={styles.buttonGradient}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Войти</Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>

                    {biometricAvailable && (
                        <TouchableOpacity
                            style={styles.biometricButton}
                            onPress={handleBiometricLogin}
                        >
                            <Ionicons
                                name={biometricType === 'Face ID' ? 'scan' : 'finger-print'}
                                size={28}
                                color={Colors.primary[400]}
                            />
                            <Text style={styles.biometricButtonText}>
                                Войти через {biometricType}
                            </Text>
                        </TouchableOpacity>
                    )}
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(400).duration(500)} style={styles.footer}>
                    <Text style={styles.footerText}>Нет аккаунта?</Text>
                    <TouchableOpacity onPress={() => router.push('/auth/register')}>
                        <Text style={styles.registerLink}>Зарегистрироваться</Text>
                    </TouchableOpacity>
                </Animated.View>

                {/* Быстрый вход без регистрации */}
                <Animated.View entering={FadeInDown.delay(500).duration(500)}>
                    <TouchableOpacity
                        style={styles.skipButton}
                        onPress={async () => {
                            await authService.skipLogin();
                            router.replace('/(tabs)');
                        }}
                    >
                        <Text style={styles.skipButtonText}>Продолжить без входа</Text>
                    </TouchableOpacity>
                </Animated.View>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 48,
    },
    logoContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Colors.primary[400] + '20',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: Colors.text.primary,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.text.secondary,
    },
    form: {
        gap: 16,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.background.tertiary,
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 56,
        borderWidth: 1,
        borderColor: Colors.border.subtle,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: Colors.text.primary,
    },
    loginButton: {
        marginTop: 8,
        borderRadius: 12,
        overflow: 'hidden',
    },
    buttonGradient: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 17,
        fontWeight: '600',
        color: '#fff',
    },
    biometricButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        paddingVertical: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.primary[400],
        backgroundColor: Colors.primary[400] + '10',
    },
    biometricButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.primary[400],
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 32,
        gap: 8,
    },
    footerText: {
        fontSize: 15,
        color: Colors.text.secondary,
    },
    registerLink: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.primary[400],
    },
    skipButton: {
        marginTop: 24,
        alignItems: 'center',
    },
    skipButtonText: {
        fontSize: 14,
        color: Colors.text.muted,
        textDecorationLine: 'underline',
    },
});
