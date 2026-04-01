import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
    FadeInDown,
    useAnimatedStyle,
    withTiming,
    withDelay,
    useSharedValue
} from 'react-native-reanimated';
import { Colors } from '../../constants/Colors';

interface ShapFeature {
    feature: string;
    featureRu: string;
    value: any;
    displayValue: string;
    contribution: number;
    direction: 'increases_risk' | 'decreases_risk';
}

interface ShapChartProps {
    features: ShapFeature[];
    style?: ViewStyle;
    title?: string;
    maxItems?: number;
}

export function ShapChart({
    features,
    style,
    title = "Почему такое решение?",
    maxItems = 5
}: ShapChartProps) {
    const displayFeatures = features.slice(0, maxItems);

    // Находим максимальный вклад для нормализации
    const maxContribution = Math.max(...displayFeatures.map(f => Math.abs(f.contribution)), 0.01);

    if (displayFeatures.length === 0) {
        return null;
    }

    return (
        <View style={[styles.container, style]}>
            <Text style={styles.title}>{title}</Text>

            <View style={styles.featuresContainer}>
                {displayFeatures.map((feature, index) => (
                    <Animated.View
                        key={feature.feature}
                        entering={FadeInDown.delay(index * 100).duration(400)}
                        style={styles.featureRow}
                    >
                        <View style={styles.featureInfo}>
                            <Text style={styles.featureName}>{feature.featureRu}</Text>
                            <Text style={styles.featureValue}>{feature.displayValue}</Text>
                        </View>

                        <View style={styles.barContainer}>
                            <View style={styles.barBackground}>
                                {/* Центральная линия */}
                                <View style={styles.centerLine} />

                                {/* Бар влияния */}
                                <FeatureBar
                                    contribution={feature.contribution}
                                    direction={feature.direction}
                                    maxContribution={maxContribution}
                                    index={index}
                                />
                            </View>

                            {/* Иконка направления */}
                            <View style={[
                                styles.directionIcon,
                                {
                                    backgroundColor: feature.direction === 'increases_risk'
                                        ? Colors.status.dangerous + '20'
                                        : Colors.status.safe + '20'
                                }
                            ]}>
                                <Text style={[
                                    styles.directionText,
                                    {
                                        color: feature.direction === 'increases_risk'
                                            ? Colors.status.dangerous
                                            : Colors.status.safe
                                    }
                                ]}>
                                    {feature.direction === 'increases_risk' ? '↑' : '↓'}
                                </Text>
                            </View>
                        </View>
                    </Animated.View>
                ))}
            </View>

            {/* Легенда */}
            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: Colors.status.dangerous }]} />
                    <Text style={styles.legendText}>Увеличивает риск</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: Colors.status.safe }]} />
                    <Text style={styles.legendText}>Снижает риск</Text>
                </View>
            </View>
        </View>
    );
}

// Анимированный бар для каждого признака
function FeatureBar({
    contribution,
    direction,
    maxContribution,
    index
}: {
    contribution: number;
    direction: string;
    maxContribution: number;
    index: number;
}) {
    const width = useSharedValue(0);

    React.useEffect(() => {
        width.value = withDelay(
            300 + index * 100,
            withTiming(Math.abs(contribution) / maxContribution, { duration: 600 })
        );
    }, [contribution, maxContribution]);

    const animatedStyle = useAnimatedStyle(() => ({
        width: `${Math.min(width.value * 50, 50)}%`,
    }));

    const isRisk = direction === 'increases_risk';
    const color = isRisk ? Colors.status.dangerous : Colors.status.safe;

    return (
        <Animated.View style={[
            styles.bar,
            animatedStyle,
            {
                backgroundColor: color,
                alignSelf: isRisk ? 'flex-end' : 'flex-start',
                marginLeft: isRisk ? '50%' : 0,
                marginRight: isRisk ? 0 : '50%',
                borderTopLeftRadius: isRisk ? 0 : 4,
                borderBottomLeftRadius: isRisk ? 0 : 4,
                borderTopRightRadius: isRisk ? 4 : 0,
                borderBottomRightRadius: isRisk ? 4 : 0,
            }
        ]} />
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.background.secondary,
        borderRadius: 16,
        padding: 16,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text.primary,
        marginBottom: 16,
    },
    featuresContainer: {
        gap: 12,
    },
    featureRow: {
        gap: 8,
    },
    featureInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    featureName: {
        fontSize: 14,
        color: Colors.text.primary,
        fontWeight: '500',
    },
    featureValue: {
        fontSize: 13,
        color: Colors.text.secondary,
    },
    barContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    barBackground: {
        flex: 1,
        height: 8,
        backgroundColor: Colors.background.tertiary,
        borderRadius: 4,
        overflow: 'hidden',
        position: 'relative',
    },
    centerLine: {
        position: 'absolute',
        left: '50%',
        width: 1,
        height: '100%',
        backgroundColor: Colors.text.tertiary,
    },
    bar: {
        position: 'absolute',
        height: '100%',
    },
    directionIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    directionText: {
        fontSize: 14,
        fontWeight: '700',
    },
    legend: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
        marginTop: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: Colors.background.tertiary,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    legendDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    legendText: {
        fontSize: 12,
        color: Colors.text.secondary,
    },
});

export default ShapChart;
