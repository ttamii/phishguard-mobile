import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ViewStyle,
    TextStyle,
    ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/Colors';
import { Typography, BorderRadius, Spacing } from '../../constants/Typography';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
    loading?: boolean;
    fullWidth?: boolean;
    icon?: React.ReactNode;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

export function Button({
    title,
    onPress,
    variant = 'primary',
    size = 'medium',
    disabled = false,
    loading = false,
    fullWidth = false,
    icon,
    style,
    textStyle,
}: ButtonProps) {
    const isDisabled = disabled || loading;

    const getSizeStyles = (): ViewStyle => {
        switch (size) {
            case 'small':
                return { paddingVertical: 8, paddingHorizontal: 16 };
            case 'large':
                return { paddingVertical: 18, paddingHorizontal: 32 };
            default:
                return { paddingVertical: 14, paddingHorizontal: 24 };
        }
    };

    const getTextSize = (): TextStyle => {
        switch (size) {
            case 'small':
                return Typography.buttonSmall;
            default:
                return Typography.button;
        }
    };

    const getGradientColors = (): [string, string] => {
        if (isDisabled) return [Colors.background.tertiary, Colors.background.tertiary];

        switch (variant) {
            case 'primary':
                return [Colors.primary[500], Colors.primary[600]];
            case 'secondary':
                return [Colors.background.tertiary, Colors.background.tertiary];
            case 'danger':
                return [Colors.status.dangerous, '#DC2626'];
            default:
                return ['transparent', 'transparent'];
        }
    };

    const getTextColor = (): string => {
        if (isDisabled) return Colors.text.muted;

        switch (variant) {
            case 'secondary':
                return Colors.text.primary;
            case 'ghost':
                return Colors.primary[400];
            default:
                return Colors.text.primary;
        }
    };

    const containerStyle: ViewStyle = {
        ...getSizeStyles(),
        ...(fullWidth && { width: '100%' }),
        opacity: isDisabled ? 0.6 : 1,
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={isDisabled}
            activeOpacity={0.8}
            style={[fullWidth && { width: '100%' }, style]}
        >
            <LinearGradient
                colors={getGradientColors()}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                    styles.button,
                    containerStyle,
                    variant === 'ghost' && styles.ghostButton,
                    variant === 'secondary' && styles.secondaryButton,
                ]}
            >
                {loading ? (
                    <ActivityIndicator
                        color={getTextColor()}
                        size={size === 'small' ? 'small' : 'small'}
                    />
                ) : (
                    <>
                        {icon && <>{icon}</>}
                        <Text
                            style={[
                                styles.text,
                                getTextSize(),
                                { color: getTextColor() },
                                icon && { marginLeft: 8 },
                                textStyle,
                            ]}
                        >
                            {title}
                        </Text>
                    </>
                )}
            </LinearGradient>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        borderRadius: BorderRadius.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryButton: {
        borderWidth: 1,
        borderColor: Colors.border.default,
    },
    ghostButton: {
        backgroundColor: 'transparent',
    },
    text: {
        textAlign: 'center',
    },
});

export default Button;
