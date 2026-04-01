import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Animated, {
    FadeInRight,
    FadeInDown,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
    withDelay
} from 'react-native-reanimated';
import { Colors } from '../../constants/Colors';
import { Typography, Spacing, BorderRadius } from '../../constants/Typography';
import { FeatureContribution, FeatureTranslations } from '../../services/types';
import { Card } from '../ui/Card';

interface SHAPWaterfallProps {
    features: FeatureContribution[];
    baseValue: number;
    finalValue: number;
    maxFeatures?: number;
}

export function SHAPWaterfall({
    features,
    baseValue,
    finalValue,
    maxFeatures = 10,
}: SHAPWaterfallProps) {
    // Сортируем по абсолютному вкладу
    const sortedFeatures = [...features]
        .sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution))
        .slice(0, maxFeatures);

    const maxContribution = Math.max(
        ...sortedFeatures.map(f => Math.abs(f.contribution)),
        0.01
    );

    return (
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
        >
            {/* Заголовок */}
            <Animated.View entering={FadeInDown.duration(400)}>
                <Text style={styles.title}>Вклад признаков в решение</Text>
                <Text style={styles.subtitle}>
                    Как каждый признак повлиял на предсказание модели
                </Text>
            </Animated.View>

            {/* Базовое значение */}
            <Animated.View entering={FadeInDown.delay(100).duration(400)}>
                <Card variant="outlined" style={styles.valueCard}>
                    <View style={styles.valueRow}>
                        <Text style={styles.valueLabel}>Базовая вероятность</Text>
                        <Text style={styles.valueNumber}>
                            {(baseValue * 100).toFixed(1)}%
                        </Text>
                    </View>
                    <Text style={styles.valueHint}>
                        Средняя вероятность фишинга для всех URL
                    </Text>
                </Card>
            </Animated.View>

            {/* Признаки */}
            <View style={styles.featuresContainer}>
                {sortedFeatures.map((feature, index) => {
                    const isPositive = feature.contribution > 0;
                    const barWidth = (Math.abs(feature.contribution) / maxContribution) * 100;
                    const featureName = FeatureTranslations[feature.feature] || feature.feature;

                    return (
                        <Animated.View
                            key={feature.feature}
                            entering={FadeInRight.delay(200 + index * 80).duration(400)}
                            style={styles.featureRow}
                        >
                            {/* Информация о признаке */}
                            <View style={styles.featureInfo}>
                                <Text style={styles.featureName} numberOfLines={1}>
                                    {featureName}
                                </Text>
                                <Text style={styles.featureValue} numberOfLines={1}>
                                    {feature.displayValue}
                                </Text>
                            </View>

                            {/* Бар визуализации */}
                            <View style={styles.barContainer}>
                                <View style={[
                                    styles.barBackground,
                                    {
                                        justifyContent: isPositive ? 'flex-end' : 'flex-start',
                                    }
                                ]}>
                                    <Animated.View
                                        style={[
                                            styles.bar,
                                            {
                                                width: `${Math.min(barWidth, 100)}%`,
                                                backgroundColor: isPositive
                                                    ? Colors.status.dangerous
                                                    : Colors.status.safe,
                                            },
                                        ]}
                                    />
                                </View>
                            </View>

                            {/* Значение вклада */}
                            <Text style={[
                                styles.contributionValue,
                                { color: isPositive ? Colors.status.dangerous : Colors.status.safe }
                            ]}>
                                {isPositive ? '+' : ''}{(feature.contribution * 100).toFixed(2)}%
                            </Text>
                        </Animated.View>
                    );
                })}
            </View>

            {/* Легенда */}
            <Animated.View
                entering={FadeInDown.delay(400 + sortedFeatures.length * 80).duration(400)}
                style={styles.legend}
            >
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: Colors.status.dangerous }]} />
                    <Text style={styles.legendText}>Увеличивает риск</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: Colors.status.safe }]} />
                    <Text style={styles.legendText}>Уменьшает риск</Text>
                </View>
            </Animated.View>

            {/* Итоговое значение */}
            <Animated.View
                entering={FadeInDown.delay(500 + sortedFeatures.length * 80).duration(400)}
            >
                <Card variant="gradient" style={styles.finalCard}>
                    <View style={styles.valueRow}>
                        <Text style={styles.finalLabel}>Итоговое предсказание</Text>
                        <Text style={[
                            styles.finalNumber,
                            { color: finalValue > 0.5 ? Colors.status.dangerous : Colors.status.safe }
                        ]}>
                            {(finalValue * 100).toFixed(1)}%
                        </Text>
                    </View>
                    <Text style={styles.valueHint}>
                        {finalValue > 0.7
                            ? '⚠️ Высокая вероятность фишинга'
                            : finalValue > 0.3
                                ? '⚡ Требует внимания'
                                : '✅ Вероятно безопасно'}
                    </Text>
                </Card>
            </Animated.View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    title: {
        ...Typography.h3,
        color: Colors.text.primary,
        marginBottom: Spacing.xs,
    },
    subtitle: {
        ...Typography.small,
        color: Colors.text.secondary,
        marginBottom: Spacing.lg,
    },
    valueCard: {
        marginBottom: Spacing.lg,
    },
    valueRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    valueLabel: {
        ...Typography.body,
        color: Colors.text.secondary,
    },
    valueNumber: {
        ...Typography.h3,
        color: Colors.text.primary,
    },
    valueHint: {
        ...Typography.caption,
        color: Colors.text.muted,
        marginTop: Spacing.xs,
    },
    featuresContainer: {
        marginBottom: Spacing.lg,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.md,
        paddingVertical: Spacing.xs,
    },
    featureInfo: {
        width: 100,
        marginRight: Spacing.sm,
    },
    featureName: {
        ...Typography.small,
        color: Colors.text.primary,
        fontWeight: '500',
    },
    featureValue: {
        ...Typography.caption,
        color: Colors.text.muted,
        marginTop: 2,
    },
    barContainer: {
        flex: 1,
        marginHorizontal: Spacing.sm,
    },
    barBackground: {
        height: 24,
        backgroundColor: Colors.background.tertiary,
        borderRadius: BorderRadius.sm,
        overflow: 'hidden',
        flexDirection: 'row',
    },
    bar: {
        height: '100%',
        borderRadius: BorderRadius.sm,
    },
    contributionValue: {
        width: 65,
        textAlign: 'right',
        ...Typography.small,
        fontWeight: '600',
    },
    legend: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: Spacing.lg,
        marginBottom: Spacing.lg,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: Spacing.xs,
    },
    legendText: {
        ...Typography.caption,
        color: Colors.text.secondary,
    },
    finalCard: {
        marginBottom: Spacing.xl,
    },
    finalLabel: {
        ...Typography.bodyMedium,
        color: Colors.text.primary,
    },
    finalNumber: {
        fontSize: 28,
        fontWeight: '700',
    },
});

export default SHAPWaterfall;
