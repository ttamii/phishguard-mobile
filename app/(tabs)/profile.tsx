import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
    Alert,
    Image,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors } from '../../constants/Colors';
import { authService, User } from '../../services/auth';

export default function ProfileScreen() {
    const [user, setUser] = useState<User | null>(null);
    const [biometricEnabled, setBiometricEnabled] = useState(false);
    const [biometricType, setBiometricType] = useState('');
    const [biometricSupported, setBiometricSupported] = useState(false);

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);

        const { isSupported, biometricType } = await authService.checkBiometricSupport();
        setBiometricSupported(isSupported);
        setBiometricType(biometricType);

        const enabled = await authService.isBiometricEnabled();
        setBiometricEnabled(enabled);
    };

    const handleBiometricToggle = async (value: boolean) => {
        if (value) {
            // Проверяем биометрию перед включением
            const success = await authService.authenticateWithBiometric();
            if (success) {
                await authService.setBiometricEnabled(true);
                setBiometricEnabled(true);
            } else {
                Alert.alert('Ошибка', 'Не удалось подтвердить биометрию');
            }
        } else {
            await authService.setBiometricEnabled(false);
            setBiometricEnabled(false);
        }
    };

    const handleLogout = () => {
        Alert.alert(
            'Выход',
            'Вы уверены, что хотите выйти?',
            [
                { text: 'Отмена', style: 'cancel' },
                {
                    text: 'Выйти',
                    style: 'destructive',
                    onPress: async () => {
                        await authService.logout();
                        router.replace('/auth/login');
                    }
                },
            ]
        );
    };

    const handleLogin = async () => {
        await authService.logout(); // Сбросит сессию гостя → редирект на auth
    };

    const handleRegister = async () => {
        await authService.logout(); // Сбросит сессию гостя → редирект на auth
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Профиль пользователя */}
            <Animated.View entering={FadeInDown.duration(500)} style={styles.profileSection}>
                <LinearGradient
                    colors={[Colors.primary[500] + '30', Colors.primary[600] + '20']}
                    style={styles.profileCard}
                >
                    <View style={styles.avatarContainer}>
                        <LinearGradient
                            colors={[Colors.primary[400], Colors.primary[600]]}
                            style={styles.avatar}
                        >
                            <Ionicons
                                name={user ? "person" : "person-outline"}
                                size={40}
                                color="#fff"
                            />
                        </LinearGradient>
                    </View>

                    {user ? (
                        <>
                            <Text style={styles.userName}>{user.name}</Text>
                            <Text style={styles.userEmail}>{user.email}</Text>
                            <View style={styles.memberBadge}>
                                <Ionicons name="shield-checkmark" size={14} color={Colors.primary[400]} />
                                <Text style={styles.memberText}>Защищённый пользователь</Text>
                            </View>
                        </>
                    ) : (
                        <>
                            <Text style={styles.userName}>Гость</Text>
                            <Text style={styles.userEmail}>Войдите для сохранения данных</Text>
                        </>
                    )}
                </LinearGradient>
            </Animated.View>

            {/* Кнопки входа/регистрации для гостя */}
            {!user && (
                <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.authButtons}>
                    <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                        <LinearGradient
                            colors={[Colors.primary[400], Colors.primary[600]]}
                            style={styles.buttonGradient}
                        >
                            <Ionicons name="log-in-outline" size={20} color="#fff" />
                            <Text style={styles.buttonText}>Войти</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
                        <Ionicons name="person-add-outline" size={20} color={Colors.primary[400]} />
                        <Text style={styles.registerButtonText}>Зарегистрироваться</Text>
                    </TouchableOpacity>
                </Animated.View>
            )}

            {/* Настройки безопасности */}
            <Animated.View entering={FadeInDown.delay(200).duration(500)}>
                <Text style={styles.sectionTitle}>Безопасность</Text>

                <View style={styles.settingsCard}>
                    {biometricSupported && (
                        <View style={styles.settingRow}>
                            <View style={styles.settingInfo}>
                                <Ionicons
                                    name={biometricType === 'Face ID' ? 'scan' : 'finger-print'}
                                    size={24}
                                    color={Colors.primary[400]}
                                />
                                <View style={styles.settingText}>
                                    <Text style={styles.settingTitle}>{biometricType}</Text>
                                    <Text style={styles.settingSubtitle}>Быстрый вход в приложение</Text>
                                </View>
                            </View>
                            <Switch
                                value={biometricEnabled}
                                onValueChange={handleBiometricToggle}
                                trackColor={{ false: Colors.background.tertiary, true: Colors.primary[400] }}
                                thumbColor="#fff"
                            />
                        </View>
                    )}

                    <TouchableOpacity style={styles.settingRow}>
                        <View style={styles.settingInfo}>
                            <Ionicons name="key-outline" size={24} color={Colors.accent.purple} />
                            <View style={styles.settingText}>
                                <Text style={styles.settingTitle}>Изменить пароль</Text>
                                <Text style={styles.settingSubtitle}>Обновить пароль аккаунта</Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={Colors.text.muted} />
                    </TouchableOpacity>
                </View>
            </Animated.View>

            {/* О приложении */}
            <Animated.View entering={FadeInDown.delay(300).duration(500)}>
                <Text style={styles.sectionTitle}>О приложении</Text>

                <View style={styles.settingsCard}>
                    <View style={styles.settingRow}>
                        <View style={styles.settingInfo}>
                            <Ionicons name="information-circle-outline" size={24} color={Colors.accent.cyan} />
                            <View style={styles.settingText}>
                                <Text style={styles.settingTitle}>Версия</Text>
                                <Text style={styles.settingSubtitle}>1.0.0</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.settingRow}>
                        <View style={styles.settingInfo}>
                            <Ionicons name="school-outline" size={24} color={Colors.status.suspicious} />
                            <View style={styles.settingText}>
                                <Text style={styles.settingTitle}>Дипломный проект</Text>
                                <Text style={styles.settingSubtitle}>AIU, Tamiris, 2025</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </Animated.View>

            {/* Кнопка выхода */}
            {user && (
                <Animated.View entering={FadeInDown.delay(400).duration(500)}>
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Ionicons name="log-out-outline" size={22} color={Colors.status.dangerous} />
                        <Text style={styles.logoutText}>Выйти из аккаунта</Text>
                    </TouchableOpacity>
                </Animated.View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background.primary,
    },
    content: {
        padding: 20,
        paddingTop: 60,
        paddingBottom: 100,
    },
    profileSection: {
        marginBottom: 24,
    },
    profileCard: {
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
    },
    avatarContainer: {
        marginBottom: 16,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    userName: {
        fontSize: 24,
        fontWeight: '700',
        color: Colors.text.primary,
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 15,
        color: Colors.text.secondary,
        marginBottom: 12,
    },
    memberBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: Colors.primary[400] + '20',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    memberText: {
        fontSize: 13,
        color: Colors.primary[400],
        fontWeight: '500',
    },
    authButtons: {
        gap: 12,
        marginBottom: 32,
    },
    loginButton: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    buttonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 16,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    registerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.primary[400],
    },
    registerButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.primary[400],
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.text.primary,
        marginBottom: 12,
    },
    settingsCard: {
        backgroundColor: Colors.background.secondary,
        borderRadius: 16,
        marginBottom: 24,
        overflow: 'hidden',
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border.subtle,
    },
    settingInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    settingText: {
        flex: 1,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: Colors.text.primary,
    },
    settingSubtitle: {
        fontSize: 13,
        color: Colors.text.muted,
        marginTop: 2,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 16,
        backgroundColor: Colors.status.dangerous + '15',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.status.dangerous + '30',
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.status.dangerous,
    },
});
