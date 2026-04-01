import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Linking,
    TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Colors } from '../../constants/Colors';
import { Typography, Spacing, BorderRadius } from '../../constants/Typography';
import { Card } from '../../components/ui/Card';

export default function AboutScreen() {
    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        >
            {/* Заголовок */}
            <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
                <View style={styles.logoContainer}>
                    <Ionicons name="shield-checkmark" size={60} color={Colors.primary[400]} />
                </View>
                <Text style={styles.appName}>PhishGuard</Text>
                <Text style={styles.version}>Версия 1.0.0</Text>
            </Animated.View>

            {/* О дипломной работе */}
            <Animated.View entering={FadeInDown.delay(100).duration(500)}>
                <Card variant="gradient" style={styles.thesisCard}>
                    <View style={styles.cardIcon}>
                        <Ionicons name="school" size={28} color={Colors.primary[400]} />
                    </View>
                    <Text style={styles.cardTitle}>Дипломная работа</Text>
                    <Text style={styles.cardSubtitle}>Бакалавр Data Science</Text>
                    <View style={styles.divider} />
                    <Text style={styles.thesisTitle}>
                        «Разработка методов обнаружения фишинговых атак с использованием искусственного интеллекта»
                    </Text>
                </Card>
            </Animated.View>

            {/* Используемые технологии */}
            <Animated.View entering={FadeInDown.delay(200).duration(500)}>
                <Text style={styles.sectionTitle}>Технологии</Text>

                <Card variant="outlined" style={styles.techCard}>
                    <View style={styles.techRow}>
                        <View style={styles.techItem}>
                            <Text style={styles.techLabel}>Frontend</Text>
                            <Text style={styles.techValue}>React Native + Expo</Text>
                        </View>
                        <View style={styles.techItem}>
                            <Text style={styles.techLabel}>Backend</Text>
                            <Text style={styles.techValue}>FastAPI (Python)</Text>
                        </View>
                    </View>
                    <View style={styles.techRow}>
                        <View style={styles.techItem}>
                            <Text style={styles.techLabel}>ML модели</Text>
                            <Text style={styles.techValue}>LR, RF, XGBoost</Text>
                        </View>
                        <View style={styles.techItem}>
                            <Text style={styles.techLabel}>Объяснимость</Text>
                            <Text style={styles.techValue}>SHAP / LIME</Text>
                        </View>
                    </View>
                </Card>
            </Animated.View>

            {/* ML модели */}
            <Animated.View entering={FadeInDown.delay(300).duration(500)}>
                <Text style={styles.sectionTitle}>ML модели</Text>

                <Card variant="outlined" style={styles.modelCard}>
                    <Text style={styles.modelName}>Логистическая регрессия</Text>
                    <Text style={styles.modelDesc}>
                        Линейный классификатор для бинарной классификации. Высокая интерпретируемость,
                        быстрое обучение и предсказание.
                    </Text>
                </Card>

                <Card variant="outlined" style={styles.modelCard}>
                    <Text style={styles.modelName}>Random Forest</Text>
                    <Text style={styles.modelDesc}>
                        Ансамбль деревьев решений. Устойчивость к переобучению,
                        хорошая работа с различными типами признаков.
                    </Text>
                </Card>

                <Card variant="outlined" style={styles.modelCard}>
                    <Text style={styles.modelName}>XGBoost</Text>
                    <Text style={styles.modelDesc}>
                        Gradient Boosting на деревьях решений. Высокая точность,
                        регуляризация, обработка пропущенных значений.
                    </Text>
                </Card>
            </Animated.View>

            {/* Признаки для анализа */}
            <Animated.View entering={FadeInDown.delay(400).duration(500)}>
                <Text style={styles.sectionTitle}>Анализируемые признаки</Text>

                <Card variant="outlined" style={styles.featuresCard}>
                    <View style={styles.featureItem}>
                        <Ionicons name="link" size={18} color={Colors.primary[400]} />
                        <Text style={styles.featureText}>Длина и структура URL</Text>
                    </View>
                    <View style={styles.featureItem}>
                        <Ionicons name="globe" size={18} color={Colors.primary[400]} />
                        <Text style={styles.featureText}>Анализ домена и поддоменов</Text>
                    </View>
                    <View style={styles.featureItem}>
                        <Ionicons name="lock-closed" size={18} color={Colors.primary[400]} />
                        <Text style={styles.featureText}>Наличие HTTPS</Text>
                    </View>
                    <View style={styles.featureItem}>
                        <Ionicons name="at" size={18} color={Colors.primary[400]} />
                        <Text style={styles.featureText}>Специальные символы</Text>
                    </View>
                    <View style={styles.featureItem}>
                        <Ionicons name="warning" size={18} color={Colors.primary[400]} />
                        <Text style={styles.featureText}>Подозрительные ключевые слова</Text>
                    </View>
                    <View style={styles.featureItem}>
                        <Ionicons name="calculator" size={18} color={Colors.primary[400]} />
                        <Text style={styles.featureText}>Энтропия URL</Text>
                    </View>
                </Card>
            </Animated.View>

            {/* Что такое фишинг */}
            <Animated.View entering={FadeInDown.delay(500).duration(500)}>
                <Text style={styles.sectionTitle}>Что такое фишинг?</Text>

                <Card variant="gradient" style={styles.infoCard}>
                    <Text style={styles.infoText}>
                        <Text style={styles.infoBold}>Фишинг</Text> — это вид кибератаки, при которой
                        злоумышленники пытаются получить конфиденциальные данные (логины, пароли,
                        данные банковских карт), маскируясь под легитимные источники.
                    </Text>

                    <View style={styles.warningBox}>
                        <Ionicons name="alert-triangle" size={20} color={Colors.status.suspicious} />
                        <Text style={styles.warningText}>
                            Признаки фишинга: срочность, угрозы, подозрительные ссылки, ошибки в тексте
                        </Text>
                    </View>
                </Card>
            </Animated.View>

            {/* Подвал */}
            <Animated.View entering={FadeInDown.delay(600).duration(500)}>
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        © 2024 PhishGuard
                    </Text>
                    <Text style={styles.footerText}>
                        Дипломный проект
                    </Text>
                </View>
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
    header: {
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    logoContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Colors.primary[500] + '20',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.md,
    },
    appName: {
        ...Typography.h1,
        color: Colors.text.primary,
    },
    version: {
        ...Typography.body,
        color: Colors.text.muted,
        marginTop: Spacing.xs,
    },
    thesisCard: {
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    cardIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: Colors.primary[500] + '20',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.md,
    },
    cardTitle: {
        ...Typography.h3,
        color: Colors.text.primary,
    },
    cardSubtitle: {
        ...Typography.body,
        color: Colors.text.secondary,
        marginTop: Spacing.xs,
    },
    divider: {
        width: 60,
        height: 2,
        backgroundColor: Colors.primary[500],
        marginVertical: Spacing.md,
    },
    thesisTitle: {
        ...Typography.body,
        color: Colors.text.primary,
        textAlign: 'center',
        fontStyle: 'italic',
    },
    sectionTitle: {
        ...Typography.h4,
        color: Colors.text.primary,
        marginBottom: Spacing.md,
    },
    techCard: {
        marginBottom: Spacing.lg,
    },
    techRow: {
        flexDirection: 'row',
        marginBottom: Spacing.sm,
    },
    techItem: {
        flex: 1,
    },
    techLabel: {
        ...Typography.caption,
        color: Colors.text.muted,
        marginBottom: 2,
    },
    techValue: {
        ...Typography.bodyMedium,
        color: Colors.text.primary,
    },
    modelCard: {
        marginBottom: Spacing.sm,
    },
    modelName: {
        ...Typography.bodyMedium,
        color: Colors.primary[400],
        marginBottom: Spacing.xs,
    },
    modelDesc: {
        ...Typography.small,
        color: Colors.text.secondary,
    },
    featuresCard: {
        marginBottom: Spacing.lg,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    featureText: {
        ...Typography.body,
        color: Colors.text.primary,
        marginLeft: Spacing.md,
    },
    infoCard: {
        marginBottom: Spacing.lg,
    },
    infoText: {
        ...Typography.body,
        color: Colors.text.secondary,
        lineHeight: 24,
    },
    infoBold: {
        fontWeight: '600',
        color: Colors.text.primary,
    },
    warningBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: Colors.status.suspicious + '10',
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        marginTop: Spacing.md,
    },
    warningText: {
        ...Typography.small,
        color: Colors.status.suspicious,
        flex: 1,
        marginLeft: Spacing.sm,
    },
    footer: {
        alignItems: 'center',
        marginTop: Spacing.xl,
    },
    footerText: {
        ...Typography.caption,
        color: Colors.text.muted,
        marginBottom: Spacing.xs,
    },
});
