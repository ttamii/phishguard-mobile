import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Share
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors } from '../../constants/Colors';
import { Typography, Spacing, BorderRadius } from '../../constants/Typography';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ThreatGauge } from '../../components/results/ThreatGauge';
import { SHAPWaterfall } from '../../components/explainability/SHAPWaterfall';
import {
    ScanResult,
    ThreatClassification,
    ClassificationTranslations,
    ModelTranslations,
    FeatureTranslations
} from '../../services/types';
import { useScanStore } from '../../store/scanStore';

// Заглушка для демо (пока нет реального API)
const MOCK_RESULT: ScanResult = {
    scanId: 'demo-001',
    url: 'http://secure-bank-verify.xyz/login',
    isPhishing: true,
    probability: 0.87,
    confidence: 0.92,
    classification: 'dangerous',
    modelUsed: 'xgboost',
    features: {
        urlLength: 42,
        domainLength: 22,
        pathLength: 6,
        hasHttps: false,
        hasIPAddress: false,
        subdomainCount: 0,
        specialCharCount: 3,
        hasAtSymbol: false,
        hasSuspiciousPort: false,
        suspiciousKeywords: ['secure', 'bank', 'verify', 'login'],
        isShortened: false,
        numericDomain: false,
        pathDepth: 1,
        queryParamCount: 0,
        entropyScore: 4.2,
    },
    explanation: {
        shapValues: [
            { feature: 'hasHttps', featureRu: 'Наличие HTTPS', value: false, displayValue: 'Нет', contribution: 0.15, direction: 'increases_risk' },
            { feature: 'suspiciousKeywords', featureRu: 'Подозрительные слова', value: 4, displayValue: '4 слова', contribution: 0.22, direction: 'increases_risk' },
            { feature: 'domainLength', featureRu: 'Длина домена', value: 22, displayValue: '22 символа', contribution: 0.08, direction: 'increases_risk' },
            { feature: 'urlLength', featureRu: 'Длина URL', value: 42, displayValue: '42 символа', contribution: 0.05, direction: 'increases_risk' },
            { feature: 'entropyScore', featureRu: 'Энтропия URL', value: 4.2, displayValue: '4.2', contribution: 0.03, direction: 'increases_risk' },
            { feature: 'pathDepth', featureRu: 'Глубина пути', value: 1, displayValue: '1', contribution: -0.02, direction: 'decreases_risk' },
            { feature: 'hasIPAddress', featureRu: 'IP вместо домена', value: false, displayValue: 'Нет', contribution: -0.05, direction: 'decreases_risk' },
            { feature: 'subdomainCount', featureRu: 'Поддомены', value: 0, displayValue: '0', contribution: -0.03, direction: 'decreases_risk' },
        ],
        topPositiveFeatures: [],
        topNegativeFeatures: [],
        baseValue: 0.35,
        interpretationText: 'High phishing probability due to suspicious keywords and lack of HTTPS',
        interpretationTextRu: 'Высокая вероятность фишинга из-за подозрительных ключевых слов и отсутствия HTTPS',
    },
    timestamp: new Date().toISOString(),
    scanDuration: 245,
};

export default function ResultScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [showExplanation, setShowExplanation] = useState(false);
    const { currentScan, history, loadHistoryFromStorage } = useScanStore();

    // Загружаем историю при открытии страницы
    useEffect(() => {
        loadHistoryFromStorage();
    }, []);

    // Используем текущий результат или находим в истории, или показываем демо
    const result: ScanResult = currentScan ||
        (history.find(h => h.id === id)?.result as ScanResult) ||
        MOCK_RESULT;

    const handleShare = async () => {
        try {
            await Share.share({
                message: `PhishGuard - Результат проверки:\n\nURL: ${result.url}\nСтатус: ${ClassificationTranslations[result.classification]}\nРиск: ${Math.round(result.probability * 100)}%`,
            });
        } catch (error) {
            console.error('Ошибка при шаринге:', error);
        }
    };

    return (
        <View style={styles.container}>
            {/* Хедер */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Результат анализа</Text>
                <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
                    <Ionicons name="share-outline" size={24} color={Colors.text.primary} />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Шкала угрозы */}
                <Animated.View
                    entering={FadeInDown.duration(600)}
                    style={styles.gaugeContainer}
                >
                    <ThreatGauge
                        probability={result.probability}
                        classification={result.classification}
                        size={220}
                    />
                </Animated.View>

                {/* URL */}
                <Animated.View entering={FadeInDown.delay(100).duration(500)}>
                    <Card variant="outlined" style={styles.urlCard}>
                        <Text style={styles.urlLabel}>Проверенный URL</Text>
                        <Text style={styles.urlText} numberOfLines={2}>
                            {result.url}
                        </Text>
                    </Card>
                </Animated.View>

                {/* Детали */}
                <Animated.View entering={FadeInDown.delay(200).duration(500)}>
                    <View style={styles.detailsGrid}>
                        <Card variant="gradient" style={styles.detailCard}>
                            <Ionicons name="analytics" size={24} color={Colors.primary[400]} />
                            <Text style={styles.detailValue}>
                                {ModelTranslations[result.modelUsed]}
                            </Text>
                            <Text style={styles.detailLabel}>ML модель</Text>
                        </Card>

                        <Card variant="gradient" style={styles.detailCard}>
                            <Ionicons name="speedometer" size={24} color={Colors.accent.cyan} />
                            <Text style={styles.detailValue}>
                                {Math.round(result.confidence * 100)}%
                            </Text>
                            <Text style={styles.detailLabel}>Уверенность</Text>
                        </Card>

                        <Card variant="gradient" style={styles.detailCard}>
                            <Ionicons name="timer" size={24} color={Colors.accent.purple} />
                            <Text style={styles.detailValue}>
                                {result.scanDuration}мс
                            </Text>
                            <Text style={styles.detailLabel}>Время анализа</Text>
                        </Card>
                    </View>
                </Animated.View>

                {/* Ключевые признаки */}
                <Animated.View entering={FadeInDown.delay(300).duration(500)}>
                    <Text style={styles.sectionTitle}>Ключевые факторы риска</Text>

                    <Card variant="outlined" style={styles.factorsCard}>
                        {(result.explanation?.shapValues || [])
                            .filter(f => f.direction === 'increases_risk')
                            .slice(0, 4)
                            .map((factor, index) => (
                                <View key={factor.feature} style={styles.factorRow}>
                                    <View style={[styles.factorIcon, { backgroundColor: Colors.status.dangerous + '20' }]}>
                                        <Ionicons name="alert-circle" size={16} color={Colors.status.dangerous} />
                                    </View>
                                    <View style={styles.factorInfo}>
                                        <Text style={styles.factorName}>
                                            {FeatureTranslations[factor.feature] || factor.feature}
                                        </Text>
                                        <Text style={styles.factorValue}>{factor.displayValue}</Text>
                                    </View>
                                    <Text style={[styles.factorContribution, { color: Colors.status.dangerous }]}>
                                        +{(factor.contribution * 100).toFixed(1)}%
                                    </Text>
                                </View>
                            ))}
                    </Card>
                </Animated.View>

                {/* Интерпретация */}
                {result.explanation && (
                    <Animated.View entering={FadeInDown.delay(400).duration(500)}>
                        <Card variant="gradient" style={styles.interpretationCard}>
                            <View style={styles.interpretationHeader}>
                                <Ionicons name="bulb" size={24} color={Colors.status.suspicious} />
                                <Text style={styles.interpretationTitle}>Ваш вывод</Text>
                            </View>
                            <Text style={styles.interpretationText}>
                                {result.explanation.interpretationTextRu}
                            </Text>
                        </Card>
                    </Animated.View>
                )}

                {/* Кнопка показать объяснение */}
                <Animated.View entering={FadeInDown.delay(500).duration(500)}>
                    <Button
                        title={showExplanation ? "Скрыть SHAP анализ" : "Показать SHAP анализ"}
                        variant="secondary"
                        onPress={() => setShowExplanation(!showExplanation)}
                        fullWidth
                        icon={
                            <Ionicons
                                name={showExplanation ? "chevron-up" : "analytics"}
                                size={20}
                                color={Colors.text.primary}
                            />
                        }
                        style={styles.explanationButton}
                    />
                </Animated.View>

                {/* SHAP Waterfall */}
                {showExplanation && result.explanation && (
                    <Animated.View entering={FadeInUp.duration(500)}>
                        <Card style={styles.shapCard}>
                            <SHAPWaterfall
                                features={result.explanation.shapValues}
                                baseValue={result.explanation.baseValue}
                                finalValue={result.probability}
                            />
                        </Card>
                    </Animated.View>
                )}

                {/* Рекомендации */}
                <Animated.View entering={FadeInDown.delay(600).duration(500)}>
                    <Text style={styles.sectionTitle}>Рекомендации</Text>

                    <Card
                        variant="outlined"
                        style={[
                            styles.recommendationCard,
                            { borderColor: getRecommendationColor(result.classification) + '50' }
                        ]}
                    >
                        {getRecommendations(result.classification).map((rec, index) => (
                            <View key={index} style={styles.recommendationRow}>
                                <Ionicons
                                    name={rec.icon as any}
                                    size={20}
                                    color={getRecommendationColor(result.classification)}
                                />
                                <Text style={styles.recommendationText}>{rec.text}</Text>
                            </View>
                        ))}
                    </Card>
                </Animated.View>

                {/* Кнопка новой проверки */}
                <Animated.View entering={FadeInDown.delay(700).duration(500)}>
                    <Button
                        title="Проверить другой URL"
                        onPress={() => router.push('/scanner')}
                        fullWidth
                        size="large"
                        style={styles.newScanButton}
                    />
                </Animated.View>
            </ScrollView>
        </View>
    );
}

function getRecommendationColor(classification: ThreatClassification): string {
    switch (classification) {
        case 'safe': return Colors.status.safe;
        case 'suspicious': return Colors.status.suspicious;
        case 'dangerous': return Colors.status.dangerous;
    }
}

function getRecommendations(classification: ThreatClassification): { icon: string; text: string }[] {
    switch (classification) {
        case 'dangerous':
            return [
                { icon: 'close-circle', text: 'Не переходите по этой ссылке' },
                { icon: 'warning', text: 'Не вводите личные данные' },
                { icon: 'trash', text: 'Удалите сообщение с этой ссылкой' },
                { icon: 'shield-checkmark', text: 'Сообщите о фишинге в службу безопасности' },
            ];
        case 'suspicious':
            return [
                { icon: 'alert-circle', text: 'Будьте осторожны с этой ссылкой' },
                { icon: 'search', text: 'Проверьте источник отправителя' },
                { icon: 'key', text: 'Не вводите пароли и данные карт' },
                { icon: 'call', text: 'Свяжитесь с организацией напрямую' },
            ];
        case 'safe':
            return [
                { icon: 'checkmark-circle', text: 'Ссылка выглядит безопасной' },
                { icon: 'eye', text: 'Всё равно проверяйте адресную строку' },
                { icon: 'lock-closed', text: 'Убедитесь в наличии HTTPS' },
            ];
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background.primary,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
        paddingTop: Spacing.xl,
        paddingBottom: Spacing.md,
    },
    backButton: {
        padding: Spacing.sm,
    },
    headerTitle: {
        ...Typography.h4,
        color: Colors.text.primary,
    },
    shareButton: {
        padding: Spacing.sm,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: Spacing.md,
        paddingBottom: Spacing.xxl,
    },
    gaugeContainer: {
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    urlCard: {
        marginBottom: Spacing.lg,
    },
    urlLabel: {
        ...Typography.caption,
        color: Colors.text.muted,
        marginBottom: Spacing.xs,
    },
    urlText: {
        ...Typography.mono,
        color: Colors.text.primary,
    },
    detailsGrid: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginBottom: Spacing.lg,
    },
    detailCard: {
        flex: 1,
        alignItems: 'center',
        padding: Spacing.md,
    },
    detailValue: {
        ...Typography.bodyMedium,
        color: Colors.text.primary,
        marginTop: Spacing.sm,
        textAlign: 'center',
    },
    detailLabel: {
        ...Typography.caption,
        color: Colors.text.muted,
        marginTop: Spacing.xs,
        textAlign: 'center',
    },
    sectionTitle: {
        ...Typography.h4,
        color: Colors.text.primary,
        marginBottom: Spacing.md,
    },
    factorsCard: {
        marginBottom: Spacing.lg,
    },
    factorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border.subtle,
    },
    factorIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    factorInfo: {
        flex: 1,
    },
    factorName: {
        ...Typography.small,
        color: Colors.text.primary,
    },
    factorValue: {
        ...Typography.caption,
        color: Colors.text.muted,
        marginTop: 2,
    },
    factorContribution: {
        ...Typography.bodyMedium,
    },
    interpretationCard: {
        marginBottom: Spacing.lg,
    },
    interpretationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    interpretationTitle: {
        ...Typography.bodyMedium,
        color: Colors.text.primary,
        marginLeft: Spacing.sm,
    },
    interpretationText: {
        ...Typography.body,
        color: Colors.text.secondary,
        lineHeight: 24,
    },
    explanationButton: {
        marginBottom: Spacing.lg,
    },
    shapCard: {
        marginBottom: Spacing.lg,
    },
    recommendationCard: {
        marginBottom: Spacing.lg,
    },
    recommendationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.sm,
    },
    recommendationText: {
        ...Typography.body,
        color: Colors.text.primary,
        marginLeft: Spacing.md,
        flex: 1,
    },
    newScanButton: {
        marginTop: Spacing.md,
    },
});
