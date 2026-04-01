import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
    useAnimatedProps,
    useSharedValue,
    withTiming,
    withDelay,
    Easing
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Colors } from '../../constants/Colors';
import { ThreatClassification, ClassificationTranslations } from '../../services/types';

interface ThreatGaugeProps {
    probability: number; // 0-1
    classification: ThreatClassification;
    size?: number;
    style?: ViewStyle;
    showLabel?: boolean;
    animated?: boolean;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function ThreatGauge({
    probability,
    classification,
    size = 200,
    style,
    showLabel = true,
    animated = true
}: ThreatGaugeProps) {
    const percentage = Math.round(probability * 100);
    const radius = (size - 24) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeWidth = 12;

    const progress = useSharedValue(0);

    React.useEffect(() => {
        if (animated) {
            progress.value = withDelay(
                300,
                withTiming(probability, {
                    duration: 1500,
                    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
                })
            );
        } else {
            progress.value = probability;
        }
    }, [probability, animated]);

    const getColor = (): string => {
        switch (classification) {
            case 'safe': return Colors.status.safe;
            case 'suspicious': return Colors.status.suspicious;
            case 'dangerous': return Colors.status.dangerous;
        }
    };

    const getGradientColors = (): [string, string] => {
        switch (classification) {
            case 'safe': return ['#34D399', '#10B981'];
            case 'suspicious': return ['#FBBF24', '#F59E0B'];
            case 'dangerous': return ['#F87171', '#EF4444'];
        }
    };

    const animatedProps = useAnimatedProps(() => ({
        strokeDashoffset: circumference - (progress.value * circumference),
    }));

    const gradientColors = getGradientColors();
    const color = getColor();
    const centerX = size / 2;
    const centerY = size / 2;

    return (
        <View style={[styles.container, { width: size, height: size }, style]}>
            <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <Defs>
                    <LinearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <Stop offset="0%" stopColor={gradientColors[0]} />
                        <Stop offset="100%" stopColor={gradientColors[1]} />
                    </LinearGradient>
                </Defs>

                {/* Фоновый круг */}
                <Circle
                    cx={centerX}
                    cy={centerY}
                    r={radius}
                    stroke={Colors.background.tertiary}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                />

                {/* Анимированный прогресс */}
                <AnimatedCircle
                    cx={centerX}
                    cy={centerY}
                    r={radius}
                    stroke="url(#gaugeGradient)"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    animatedProps={animatedProps}
                    transform={`rotate(-90 ${centerX} ${centerY})`}
                />
            </Svg>

            <View style={styles.centerContent}>
                <Text style={[styles.percentage, { color, fontSize: size * 0.2 }]}>
                    {percentage}%
                </Text>
                {showLabel && (
                    <>
                        <Text style={[styles.label, { fontSize: size * 0.07 }]}>
                            Риск фишинга
                        </Text>
                        <View style={[styles.badge, { backgroundColor: color + '20' }]}>
                            <Text style={[styles.badgeText, { color, fontSize: size * 0.06 }]}>
                                {ClassificationTranslations[classification]}
                            </Text>
                        </View>
                    </>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    centerContent: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    percentage: {
        fontWeight: '700',
    },
    label: {
        color: Colors.text.secondary,
        marginTop: 4,
    },
    badge: {
        marginTop: 8,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        fontWeight: '600',
    },
});

export default ThreatGauge;
