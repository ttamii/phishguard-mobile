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

export default function RegisterScreen() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [biometricType, setBiometricType] = useState('');
    const [enableBiometric, setEnableBiometric] = useState(true);

    useEffect(() => {
        checkBiometric();
    }, []);

    const checkBiometric = async () => {
        const { isSupported, biometricType } = await authService.checkBiometricSupport();
        if (isSupported) {
            setBiometricType(biometricType);
        }
    };

    const handleRegister = async () => {
        if (!name || !email || !password) {
            Alert.alert('Ошибка', 'Заполните все поля');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Ошибка', 'Пароли не совпадают');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Ошибка', 'Пароль должен быть минимум 6 символов');
            return;
        }

        setLoading(true);
        try {
            await authService.register(email, password, name);

            if (enableBiometric && biometricType) {
                await authService.setBiometricEnabled(true);
            }

            Alert.alert(
                'Успешно!',
                'Аккаунт создан. Добро пожаловать в PhishGuard!',
                [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
            );
        } catch (error) {
            Alert.alert('Ошибка', 'Не удалось создать аккаунт');
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
                    <Text style={styles.title}>Регистрация</Text>
                    <Text style={styles.subtitle}>Создайте аккаунт PhishGuard</Text>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.form}>
                    <View style={styles.inputContainer}>
                        <Ionicons name="person-outline" size={20} color={Colors.text.secondary} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Ваше имя"
                            placeholderTextColor={Colors.text.muted}
                            value={name}
                            onChangeText={setName}
                            autoCapitalize="words"
                        />
                    </View>

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

                    <View style={styles.inputContainer}>
                        <Ionicons name="lock-closed-outline" size={20} color={Colors.text.secondary} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Повторите пароль"
                            placeholderTextColor={Colors.text.muted}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry={!showPassword}
                        />
                    </View>

                    {biometricType && (
                        <TouchableOpacity
                            style={styles.biometricOption}
                            onPress={() => setEnableBiometric(!enableBiometric)}
                        >
                            <Ionicons
                                name={enableBiometric ? "checkbox" : "square-outline"}
                                size={24}
                                color={enableBiometric ? Colors.primary[400] : Colors.text.secondary}
                            />
                            <Text style={styles.biometricText}>
                                Включить {biometricType} для входа
                            </Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={styles.registerButton}
                        onPress={handleRegister}
                        disabled={loading}
                    >
                        <LinearGradient
                            colors={[Colors.primary[400], Colors.primary[600]]}
                            style={styles.buttonGradient}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Создать аккаунт</Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(400).duration(500)} style={styles.footer}>
                    <Text style={styles.footerText}>Уже есть аккаунт?</Text>
                    <TouchableOpacity onPress={() => router.push('/auth/login')}>
                        <Text style={styles.loginLink}>Войти</Text>
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
        marginBottom: 40,
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
        fontSize: 28,
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
    biometricOption: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 8,
    },
    biometricText: {
        fontSize: 15,
        color: Colors.text.secondary,
    },
    registerButton: {
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
    loginLink: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.primary[400],
    },
});
