// Типографика
export const Typography = {
    // Заголовки
    h1: {
        fontSize: 32,
        fontWeight: '700' as const,
        lineHeight: 40,
        letterSpacing: -0.5,
    },
    h2: {
        fontSize: 24,
        fontWeight: '600' as const,
        lineHeight: 32,
        letterSpacing: -0.3,
    },
    h3: {
        fontSize: 20,
        fontWeight: '600' as const,
        lineHeight: 28,
    },
    h4: {
        fontSize: 18,
        fontWeight: '500' as const,
        lineHeight: 24,
    },

    // Текст
    body: {
        fontSize: 16,
        fontWeight: '400' as const,
        lineHeight: 24,
    },
    bodyMedium: {
        fontSize: 16,
        fontWeight: '500' as const,
        lineHeight: 24,
    },
    small: {
        fontSize: 14,
        fontWeight: '400' as const,
        lineHeight: 20,
    },
    caption: {
        fontSize: 12,
        fontWeight: '400' as const,
        lineHeight: 16,
    },

    // Моноширинный (для URL, кода)
    mono: {
        fontFamily: 'SpaceMono',
        fontSize: 14,
        lineHeight: 20,
    },

    // Кнопки
    button: {
        fontSize: 16,
        fontWeight: '600' as const,
        lineHeight: 24,
    },
    buttonSmall: {
        fontSize: 14,
        fontWeight: '500' as const,
        lineHeight: 20,
    },
};

// Отступы
export const Spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

// Радиусы скругления
export const BorderRadius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
};

export default { Typography, Spacing, BorderRadius };
