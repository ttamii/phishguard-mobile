import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Colors } from '../../constants/Colors';
import { Typography, Spacing, BorderRadius } from '../../constants/Typography';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useScanStore } from '../../store/scanStore';


export default function ScannerScreen() {
    const [url, setUrl] = useState('');
    const [urlError, setUrlError] = useState('');

    const {
        includeExplanation,
        setIncludeExplanation,
        scanURL,
        isScanning,
        scanError,
        clearError
    } = useScanStore();

    const validateUrl = (text: string): boolean => {
        if (!text.trim()) {
            setUrlError('Введите URL для проверки');
            return false;
        }

        // Простая валидация URL
        const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;
        if (!urlPattern.test(text)) {
            setUrlError('Введите корректный URL (например, https://example.com)');
            return false;
        }

        setUrlError('');
        return true;
    };

    const handleScan = async () => {
        clearError();

        if (!validateUrl(url)) return;

        let normalizedUrl = url.trim();
        if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
            normalizedUrl = 'https://' + normalizedUrl;
        }

        const result = await scanURL(normalizedUrl);

        if (result) {
            router.push(`/result/${result.scanId}`);
        } else if (scanError) {
            Alert.alert('Ошибка', scanError);
        }
    };

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        >
            {/* Заголовок */}
            <Animated.View entering={FadeInDown.duration(500)}>
                <Text style={styles.title}>Сканер URL</Text>
                <Text style={styles.subtitle}>
                    Проверьте подозрительную ссылку на наличие фишинга
                </Text>
            </Animated.View>

            {/* Поле ввода URL */}
            <Animated.View entering={FadeInDown.delay(100).duration(500)}>
                <Card variant="gradient" style={styles.inputCard}>
                    <Input
                        value={url}
                        onChangeText={(text) => {
                            setUrl(text);
                            if (urlError) validateUrl(text);
                        }}
                        placeholder="Вставьте URL для проверки..."
                        label="URL адрес"
                        icon="link-outline"
                        showPasteButton
                        showClearButton
                        error={urlError}
                    />

                    {/* Примеры для тестирования */}
                    <View style={styles.examplesContainer}>
                        <Text style={styles.examplesLabel}>Примеры для теста:</Text>
                        <View style={styles.exampleButtons}>
                            <TouchableOpacity
                                style={styles.exampleButton}
                                onPress={() => setUrl('https://google.com')}
                            >
                                <Text style={styles.exampleButtonText}>google.com</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.exampleButton, styles.exampleDanger]}
                                onPress={() => setUrl('http://secure-bank-login.xyz/verify')}
                            >
                                <Text style={styles.exampleButtonText}>фишинг-пример</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Card>
            </Animated.View>

            {/* Модель XGBoost (информационный блок) */}
            <Animated.View entering={FadeInDown.delay(200).duration(500)}>
                <Card variant="outlined" style={styles.modelInfoCard}>
                    <View style={styles.modelInfoRow}>
                        <View style={styles.modelIcon}>
                            <Ionicons name="hardware-chip" size={24} color={Colors.primary[400]} />
                        </View>
                        <View style={styles.modelDetails}>
                            <Text style={styles.modelTitle}>XGBoost</Text>
                            <Text style={styles.modelSubtitle}>Точность 94.5% • Градиентный бустинг</Text>
                        </View>
                    </View>
                </Card>
            </Animated.View>

            {/* Настройки */}
            <Animated.View entering={FadeInDown.delay(300).duration(500)}>
                <Card variant="outlined" style={styles.settingsCard}>
                    <TouchableOpacity
                        style={styles.settingRow}
                        onPress={() => setIncludeExplanation(!includeExplanation)}
                    >
                        <View style={styles.settingInfo}>
                            <Ionicons
                                name="analytics-outline"
                                size={24}
                                color={Colors.primary[400]}
                            />
                            <View style={styles.settingText}>
                                <Text style={styles.settingTitle}>Объяснение решения (SHAP)</Text>
                                <Text style={styles.settingDesc}>
                                    Показать вклад каждого признака
                                </Text>
                            </View>
                        </View>
                        <View style={[
                            styles.toggle,
                            includeExplanation && styles.toggleActive,
                        ]}>
                            <View style={[
                                styles.toggleKnob,
                                includeExplanation && styles.toggleKnobActive,
                            ]} />
                        </View>
                    </TouchableOpacity>
                </Card>
            </Animated.View>

            {/* Кнопка сканирования */}
            <Animated.View entering={FadeInDown.delay(400).duration(500)}>
                <Button
                    title={isScanning ? "Анализ..." : "Проверить URL"}
                    onPress={handleScan}
                    loading={isScanning}
                    disabled={!url.trim()}
                    fullWidth
                    size="large"
                    icon={
                        !isScanning && (
                            <Ionicons name="shield-checkmark" size={24} color={Colors.text.primary} />
                        )
                    }
                    style={styles.scanButton}
                />
            </Animated.View>

            {/* Информация о процессе */}
            <Animated.View entering={FadeInDown.delay(500).duration(500)}>
                <Card variant="outlined" style={styles.infoCard}>
                    <Text style={styles.infoTitle}>Как работает проверка?</Text>
                    <View style={styles.infoSteps}>
                        <View style={styles.infoStep}>
                            <View style={styles.stepNumber}>
                                <Text style={styles.stepNumberText}>1</Text>
                            </View>
                            <Text style={styles.stepText}>Извлечение признаков из URL</Text>
                        </View>
                        <View style={styles.infoStep}>
                            <View style={styles.stepNumber}>
                                <Text style={styles.stepNumberText}>2</Text>
                            </View>
                            <Text style={styles.stepText}>Анализ ML моделью</Text>
                        </View>
                        <View style={styles.infoStep}>
                            <View style={styles.stepNumber}>
                                <Text style={styles.stepNumberText}>3</Text>
                            </View>
                            <Text style={styles.stepText}>Расчёт вероятности фишинга</Text>
                        </View>
                        <View style={styles.infoStep}>
                            <View style={styles.stepNumber}>
                                <Text style={styles.stepNumberText}>4</Text>
                            </View>
                            <Text style={styles.stepText}>Объяснение решения (SHAP)</Text>
                        </View>
                    </View>
                </Card>
            </Animated.View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background.primary,
    },
    content: {
        padding: Spacing.md,
        paddingTop: Spacing.xl,
        paddingBottom: Spacing.xxl,
    },
    title: {
        ...Typography.h1,
        color: Colors.text.primary,
    },
    subtitle: {
        ...Typography.body,
        color: Colors.text.secondary,
        marginTop: Spacing.xs,
        marginBottom: Spacing.lg,
    },
    inputCard: {
        marginBottom: Spacing.lg,
    },
    examplesContainer: {
        marginTop: Spacing.md,
    },
    examplesLabel: {
        ...Typography.caption,
        color: Colors.text.muted,
        marginBottom: Spacing.xs,
    },
    exampleButtons: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    exampleButton: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        backgroundColor: Colors.status.safe + '20',
        borderRadius: BorderRadius.sm,
    },
    exampleDanger: {
        backgroundColor: Colors.status.dangerous + '20',
    },
    exampleButtonText: {
        ...Typography.caption,
        color: Colors.text.secondary,
    },
    sectionTitle: {
        ...Typography.h4,
        color: Colors.text.primary,
        marginBottom: Spacing.md,
    },
    modelsContainer: {
        gap: Spacing.sm,
        marginBottom: Spacing.lg,
    },
    modelCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        backgroundColor: Colors.background.secondary,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.border.default,
    },
    modelCardActive: {
        borderColor: Colors.primary[500],
        backgroundColor: Colors.primary[500] + '10',
    },
    modelRadio: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: Colors.text.muted,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    modelRadioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: Colors.primary[500],
    },
    modelInfo: {
        flex: 1,
    },
    modelName: {
        ...Typography.bodyMedium,
        color: Colors.text.primary,
    },
    modelNameActive: {
        color: Colors.primary[400],
    },
    modelDesc: {
        ...Typography.caption,
        color: Colors.text.muted,
        marginTop: 2,
    },
    recommendedBadge: {
        backgroundColor: Colors.primary[500] + '30',
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.sm,
    },
    recommendedText: {
        ...Typography.caption,
        color: Colors.primary[400],
        fontWeight: '500',
    },
    settingsCard: {
        marginBottom: Spacing.lg,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    settingInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    settingText: {
        marginLeft: Spacing.md,
        flex: 1,
    },
    settingTitle: {
        ...Typography.bodyMedium,
        color: Colors.text.primary,
    },
    settingDesc: {
        ...Typography.caption,
        color: Colors.text.muted,
        marginTop: 2,
    },
    toggle: {
        width: 50,
        height: 28,
        borderRadius: 14,
        backgroundColor: Colors.background.tertiary,
        padding: 2,
    },
    toggleActive: {
        backgroundColor: Colors.primary[500],
    },
    toggleKnob: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: Colors.text.secondary,
    },
    toggleKnobActive: {
        backgroundColor: Colors.text.primary,
        transform: [{ translateX: 22 }],
    },
    scanButton: {
        marginBottom: Spacing.lg,
    },
    infoCard: {
        marginTop: Spacing.sm,
    },
    infoTitle: {
        ...Typography.bodyMedium,
        color: Colors.text.primary,
        marginBottom: Spacing.md,
    },
    infoSteps: {
        gap: Spacing.sm,
    },
    infoStep: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stepNumber: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: Colors.primary[500] + '30',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.sm,
    },
    stepNumberText: {
        ...Typography.caption,
        color: Colors.primary[400],
        fontWeight: '600',
    },
    stepText: {
        ...Typography.small,
        color: Colors.text.secondary,
    },
    modelInfoCard: {
        marginBottom: Spacing.lg,
    },
    modelInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    modelIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.primary[500] + '20',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    modelDetails: {
        flex: 1,
    },
    modelTitle: {
        ...Typography.bodyMedium,
        color: Colors.text.primary,
    },
    modelSubtitle: {
        ...Typography.caption,
        color: Colors.text.muted,
        marginTop: 2,
    },
});
