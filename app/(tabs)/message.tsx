import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
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

export default function MessageScreen() {
    const [message, setMessage] = useState('');
    const { isScanning, scanURL, scanError, clearError } = useScanStore();

    // Извлечение URL из текста
    const extractUrls = (text: string): string[] => {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const matches = text.match(urlRegex);
        return matches ? matches : [];
    };

    const foundUrls = extractUrls(message);

    const handleScan = async () => {
        clearError();

        if (!message.trim()) {
            Alert.alert('Ошибка', 'Введите текст сообщения для анализа');
            return;
        }

        const urls = extractUrls(message.trim());

        if (urls.length === 0) {
            Alert.alert('Не найдено', 'В сообщении не обнаружено URL-адресов для проверки');
            return;
        }

        // Сканируем первый найденный URL
        const result = await scanURL(urls[0]);

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
                <Text style={styles.title}>Анализ сообщений</Text>
                <Text style={styles.subtitle}>
                    Вставьте SMS или Email для обнаружения фишинговых ссылок
                </Text>
            </Animated.View>

            {/* Поле ввода сообщения */}
            <Animated.View entering={FadeInDown.delay(100).duration(500)}>
                <Card variant="gradient" style={styles.inputCard}>
                    <Input
                        value={message}
                        onChangeText={setMessage}
                        placeholder="Вставьте подозрительное сообщение здесь..."
                        label="Текст сообщения"
                        multiline
                        numberOfLines={6}
                        showPasteButton
                        showClearButton
                    />

                    {/* Найденные URL */}
                    {foundUrls.length > 0 && (
                        <View style={styles.foundUrlsContainer}>
                            <View style={styles.foundUrlsHeader}>
                                <Ionicons name="link" size={16} color={Colors.primary[400]} />
                                <Text style={styles.foundUrlsTitle}>
                                    Найдено URL: {foundUrls.length}
                                </Text>
                            </View>
                            {foundUrls.map((url, index) => (
                                <View key={index} style={styles.foundUrlItem}>
                                    <Text style={styles.foundUrlText} numberOfLines={1}>
                                        {url}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    )}
                </Card>
            </Animated.View>

            {/* Примеры сообщений */}
            <Animated.View entering={FadeInDown.delay(200).duration(500)}>
                <Text style={styles.sectionTitle}>Примеры для тестирования</Text>

                <Card variant="outlined" style={styles.exampleCard}>
                    <View style={styles.exampleHeader}>
                        <View style={styles.exampleBadgeSafe}>
                            <Text style={styles.exampleBadgeTextSafe}>Легитимное</Text>
                        </View>
                    </View>
                    <Text style={styles.exampleText}>
                        Здравствуйте! Ваш заказ #12345 успешно оформлен. Отслеживайте доставку на https://kaspi.kz/track
                    </Text>
                    <Button
                        title="Использовать"
                        variant="ghost"
                        size="small"
                        onPress={() => setMessage('Здравствуйте! Ваш заказ #12345 успешно оформлен. Отслеживайте доставку на https://kaspi.kz/track')}
                    />
                </Card>

                <Card variant="outlined" style={styles.exampleCardDanger}>
                    <View style={styles.exampleHeader}>
                        <View style={styles.exampleBadgeDanger}>
                            <Text style={styles.exampleBadgeTextDanger}>Фишинг</Text>
                        </View>
                    </View>
                    <Text style={styles.exampleText}>
                        ВНИМАНИЕ! Ваша карта заблокирована. Срочно подтвердите данные: http://kaspi-secure-login.xyz/verify
                    </Text>
                    <Button
                        title="Использовать"
                        variant="ghost"
                        size="small"
                        onPress={() => setMessage('ВНИМАНИЕ! Ваша карта заблокирована. Срочно подтвердите данные: http://kaspi-secure-login.xyz/verify')}
                    />
                </Card>
            </Animated.View>

            {/* Кнопка анализа */}
            <Animated.View entering={FadeInDown.delay(300).duration(500)}>
                <Button
                    title={isScanning ? "Анализ..." : "Проанализировать сообщение"}
                    onPress={handleScan}
                    loading={isScanning}
                    disabled={!message.trim()}
                    fullWidth
                    size="large"
                    icon={
                        !isScanning && (
                            <Ionicons name="search" size={24} color={Colors.text.primary} />
                        )
                    }
                    style={styles.scanButton}
                />
            </Animated.View>

            {/* Информация */}
            <Animated.View entering={FadeInDown.delay(400).duration(500)}>
                <Card variant="outlined" style={styles.infoCard}>
                    <View style={styles.infoRow}>
                        <Ionicons name="information-circle" size={20} color={Colors.primary[400]} />
                        <Text style={styles.infoText}>
                            Система автоматически извлечёт и проверит URL из текста сообщения
                        </Text>
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
    foundUrlsContainer: {
        marginTop: Spacing.md,
        padding: Spacing.md,
        backgroundColor: Colors.background.tertiary,
        borderRadius: BorderRadius.md,
    },
    foundUrlsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    foundUrlsTitle: {
        ...Typography.small,
        color: Colors.primary[400],
        marginLeft: Spacing.xs,
        fontWeight: '500',
    },
    foundUrlItem: {
        backgroundColor: Colors.background.secondary,
        padding: Spacing.sm,
        borderRadius: BorderRadius.sm,
        marginTop: Spacing.xs,
    },
    foundUrlText: {
        ...Typography.mono,
        color: Colors.text.secondary,
    },
    sectionTitle: {
        ...Typography.h4,
        color: Colors.text.primary,
        marginBottom: Spacing.md,
    },
    exampleCard: {
        marginBottom: Spacing.md,
        borderColor: Colors.status.safe + '50',
    },
    exampleCardDanger: {
        marginBottom: Spacing.md,
        borderColor: Colors.status.dangerous + '50',
    },
    exampleHeader: {
        flexDirection: 'row',
        marginBottom: Spacing.sm,
    },
    exampleBadgeSafe: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.sm,
        backgroundColor: Colors.status.safe + '20',
    },
    exampleBadgeTextSafe: {
        ...Typography.caption,
        fontWeight: '500',
        color: Colors.status.safe,
    },
    exampleBadgeDanger: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.sm,
        backgroundColor: Colors.status.dangerous + '20',
    },
    exampleBadgeTextDanger: {
        ...Typography.caption,
        fontWeight: '500',
        color: Colors.status.dangerous,
    },
    exampleText: {
        ...Typography.small,
        color: Colors.text.secondary,
        marginBottom: Spacing.sm,
    },
    scanButton: {
        marginVertical: Spacing.lg,
    },
    infoCard: {
        marginTop: Spacing.sm,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    infoText: {
        ...Typography.small,
        color: Colors.text.secondary,
        flex: 1,
        marginLeft: Spacing.sm,
    },
});
