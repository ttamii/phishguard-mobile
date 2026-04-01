import React from 'react';
import {
    View,
    TextInput,
    Text,
    StyleSheet,
    ViewStyle,
    TouchableOpacity,
    Clipboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Typography, BorderRadius, Spacing } from '../../constants/Typography';

interface InputProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    label?: string;
    error?: string;
    multiline?: boolean;
    numberOfLines?: number;
    showPasteButton?: boolean;
    showClearButton?: boolean;
    icon?: keyof typeof Ionicons.glyphMap;
    style?: ViewStyle;
    disabled?: boolean;
}

export function Input({
    value,
    onChangeText,
    placeholder,
    label,
    error,
    multiline = false,
    numberOfLines = 1,
    showPasteButton = false,
    showClearButton = false,
    icon,
    style,
    disabled = false,
}: InputProps) {

    const handlePaste = async () => {
        try {
            const text = await Clipboard.getString();
            if (text) {
                onChangeText(text);
            }
        } catch (e) {
            console.log('Ошибка при вставке:', e);
        }
    };

    const handleClear = () => {
        onChangeText('');
    };

    return (
        <View style={[styles.container, style]}>
            {label && <Text style={styles.label}>{label}</Text>}

            <View style={[
                styles.inputWrapper,
                error && styles.inputError,
                disabled && styles.inputDisabled,
            ]}>
                {icon && (
                    <Ionicons
                        name={icon}
                        size={20}
                        color={Colors.text.muted}
                        style={styles.icon}
                    />
                )}

                <TextInput
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={Colors.text.muted}
                    style={[
                        styles.input,
                        multiline && styles.multilineInput,
                        icon && { paddingLeft: 0 },
                    ]}
                    multiline={multiline}
                    numberOfLines={numberOfLines}
                    textAlignVertical={multiline ? 'top' : 'center'}
                    editable={!disabled}
                    autoCapitalize="none"
                    autoCorrect={false}
                />

                <View style={styles.actions}>
                    {showClearButton && value.length > 0 && (
                        <TouchableOpacity onPress={handleClear} style={styles.actionButton}>
                            <Ionicons name="close-circle" size={20} color={Colors.text.muted} />
                        </TouchableOpacity>
                    )}

                    {showPasteButton && (
                        <TouchableOpacity onPress={handlePaste} style={styles.actionButton}>
                            <Ionicons name="clipboard-outline" size={20} color={Colors.primary[400]} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    label: {
        ...Typography.small,
        color: Colors.text.secondary,
        marginBottom: Spacing.xs,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.background.tertiary,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.border.default,
        paddingHorizontal: Spacing.md,
    },
    inputError: {
        borderColor: Colors.status.dangerous,
    },
    inputDisabled: {
        opacity: 0.5,
    },
    icon: {
        marginRight: Spacing.sm,
    },
    input: {
        flex: 1,
        ...Typography.body,
        color: Colors.text.primary,
        paddingVertical: Spacing.md,
    },
    multilineInput: {
        minHeight: 100,
        paddingTop: Spacing.md,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionButton: {
        padding: Spacing.xs,
        marginLeft: Spacing.xs,
    },
    errorText: {
        ...Typography.caption,
        color: Colors.status.dangerous,
        marginTop: Spacing.xs,
    },
});

export default Input;
