import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/Colors';
import { BorderRadius, Spacing } from '../../constants/Typography';

interface CardProps {
    children: React.ReactNode;
    variant?: 'default' | 'elevated' | 'gradient' | 'outlined';
    padding?: 'none' | 'small' | 'medium' | 'large';
    style?: ViewStyle;
}

export function Card({
    children,
    variant = 'default',
    padding = 'medium',
    style,
}: CardProps) {
    const getPadding = (): number => {
        switch (padding) {
            case 'none': return 0;
            case 'small': return Spacing.sm;
            case 'large': return Spacing.lg;
            default: return Spacing.md;
        }
    };

    const baseStyle: ViewStyle = {
        padding: getPadding(),
        borderRadius: BorderRadius.lg,
    };

    if (variant === 'gradient') {
        return (
            <LinearGradient
                colors={[Colors.background.secondary, Colors.background.tertiary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[baseStyle, styles.gradient, style]}
            >
                {children}
            </LinearGradient>
        );
    }

    return (
        <View
            style={[
                baseStyle,
                styles.card,
                variant === 'elevated' && styles.elevated,
                variant === 'outlined' && styles.outlined,
                style,
            ]}
        >
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.background.card,
    },
    elevated: {
        backgroundColor: Colors.background.elevated,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    outlined: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: Colors.border.default,
    },
    gradient: {
        borderWidth: 1,
        borderColor: Colors.border.subtle,
    },
});

export default Card;
