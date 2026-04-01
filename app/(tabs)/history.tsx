import React, { useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';

import { Colors } from '../../constants/Colors';
import { Typography, Spacing, BorderRadius } from '../../constants/Typography';
import { Card } from '../../components/ui/Card';
import { useScanStore } from '../../store/scanStore';
import { HistoryItem, ClassificationTranslations } from '../../services/types';
import { clearHistory } from '../../services/storage';
import { router } from 'expo-router';

export default function HistoryScreen() {
    const { history, loadHistoryFromStorage, isLoadingHistory } = useScanStore();

    useEffect(() => {
        loadHistoryFromStorage();
    }, []);

    const handleClearHistory = () => {
        Alert.alert(
            'Очистить историю?',
            'Все записи о проверках будут удалены. Это действие нельзя отменить.',
            [
                { text: 'Отмена', style: 'cancel' },
                {
                    text: 'Очистить',
                    style: 'destructive',
                    onPress: async () => {
                        await clearHistory();
                        loadHistoryFromStorage();
                    }
                },
            ]
        );
    };

    const getStatusColor = (item: HistoryItem): string => {
        const classification = 'classification' in item.result
            ? item.result.classification
            : item.result.overallRisk;

        switch (classification) {
            case 'safe': return Colors.status.safe;
            case 'suspicious': return Colors.status.suspicious;
            case 'dangerous': return Colors.status.dangerous;
            default: return Colors.text.muted;
        }
    };

    const getStatusLabel = (item: HistoryItem): string => {
        const classification = 'classification' in item.result
            ? item.result.classification
            : item.result.overallRisk;

        return ClassificationTranslations[classification] || classification;
    };

    const formatDate = (timestamp: string): string => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <View style={styles.container}>
            {/* Заголовок */}
            <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
                <View>
                    <Text style={styles.title}>История проверок</Text>
                    <Text style={styles.subtitle}>
                        {history.length} {history.length === 1 ? 'запись' : 'записей'}
                    </Text>
                </View>
                {history.length > 0 && (
                    <TouchableOpacity
                        onPress={handleClearHistory}
                        style={styles.clearButton}
                    >
                        <Ionicons name="trash-outline" size={20} color={Colors.status.dangerous} />
                    </TouchableOpacity>
                )}
            </Animated.View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {history.length === 0 ? (
                    <Animated.View entering={FadeInDown.delay(100).duration(500)}>
                        <Card variant="outlined" style={styles.emptyCard}>
                            <Ionicons name="document-outline" size={60} color={Colors.text.muted} />
                            <Text style={styles.emptyTitle}>История пуста</Text>
                            <Text style={styles.emptyText}>
                                Проверенные URL и сообщения будут отображаться здесь
                            </Text>
                        </Card>
                    </Animated.View>
                ) : (
                    history.map((item, index) => (
                        <Animated.View
                            key={item.id}
                            entering={FadeInRight.delay(index * 50).duration(400)}
                        >
                            <TouchableOpacity
                                onPress={() => router.push(`/result/${item.id}`)}
                                activeOpacity={0.7}
                            >
                                <Card style={styles.historyCard}>
                                    <View style={styles.cardHeader}>
                                        <View style={[
                                            styles.statusBadge,
                                            { backgroundColor: getStatusColor(item) + '20' }
                                        ]}>
                                            <View style={[
                                                styles.statusDot,
                                                { backgroundColor: getStatusColor(item) }
                                            ]} />
                                            <Text style={[
                                                styles.statusText,
                                                { color: getStatusColor(item) }
                                            ]}>
                                                {getStatusLabel(item)}
                                            </Text>
                                        </View>
                                        <View style={styles.typeBadge}>
                                            <Ionicons
                                                name={item.type === 'url' ? 'link' : 'chatbubble'}
                                                size={14}
                                                color={Colors.text.muted}
                                            />
                                            <Text style={styles.typeText}>
                                                {item.type === 'url' ? 'URL' : 'Сообщение'}
                                            </Text>
                                        </View>
                                    </View>

                                    <Text style={styles.inputText} numberOfLines={2}>
                                        {item.input}
                                    </Text>

                                    <View style={styles.cardFooter}>
                                        <Text style={styles.dateText}>
                                            {formatDate(item.timestamp)}
                                        </Text>
                                        <Ionicons
                                            name="chevron-forward"
                                            size={16}
                                            color={Colors.text.muted}
                                        />
                                    </View>
                                </Card>
                            </TouchableOpacity>
                        </Animated.View>
                    ))
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background.primary,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: Spacing.md,
        paddingTop: Spacing.xl,
    },
    title: {
        ...Typography.h1,
        color: Colors.text.primary,
    },
    subtitle: {
        ...Typography.body,
        color: Colors.text.secondary,
        marginTop: Spacing.xs,
    },
    clearButton: {
        padding: Spacing.sm,
        backgroundColor: Colors.status.dangerous + '20',
        borderRadius: BorderRadius.md,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: Spacing.md,
        paddingTop: 0,
        paddingBottom: Spacing.xxl,
    },
    emptyCard: {
        alignItems: 'center',
        padding: Spacing.xxl,
    },
    emptyTitle: {
        ...Typography.h3,
        color: Colors.text.primary,
        marginTop: Spacing.lg,
    },
    emptyText: {
        ...Typography.body,
        color: Colors.text.muted,
        textAlign: 'center',
        marginTop: Spacing.sm,
    },
    historyCard: {
        marginBottom: Spacing.md,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.sm,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: Spacing.xs,
    },
    statusText: {
        ...Typography.caption,
        fontWeight: '600',
    },
    typeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    typeText: {
        ...Typography.caption,
        color: Colors.text.muted,
        marginLeft: Spacing.xs,
    },
    inputText: {
        ...Typography.small,
        color: Colors.text.primary,
        fontFamily: 'SpaceMono',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: Spacing.md,
        paddingTop: Spacing.sm,
        borderTopWidth: 1,
        borderTopColor: Colors.border.subtle,
    },
    dateText: {
        ...Typography.caption,
        color: Colors.text.muted,
    },
});
