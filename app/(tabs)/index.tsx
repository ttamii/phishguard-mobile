import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';

import { Colors } from '../../constants/Colors';
import { Typography, Spacing, BorderRadius } from '../../constants/Typography';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useScanStore } from '../../store/scanStore';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const [quickUrl, setQuickUrl] = useState('');
  const { statistics, history, loadHistoryFromStorage, isScanning, scanURL } = useScanStore();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadHistoryFromStorage();
  }, []);

  const handleQuickScan = async () => {
    if (!quickUrl.trim()) return;
    const result = await scanURL(quickUrl.trim());
    if (result) {
      router.push(`/result/${result.scanId}`);
    }
  };

  const recentScans = history.slice(0, 3);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 100 }
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Заголовок */}
      <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Добро пожаловать в</Text>
            <Text style={styles.appName}>PhishGuard</Text>
          </View>
          <View style={styles.logoContainer}>
            <Ionicons name="shield-checkmark" size={40} color={Colors.primary[400]} />
          </View>
        </View>
        <Text style={styles.tagline}>
          Защита от фишинговых атак с помощью ИИ
        </Text>
      </Animated.View>

      {/* Быстрое сканирование */}
      <Animated.View entering={FadeInDown.delay(100).duration(600)}>
        <Card variant="gradient" style={styles.quickScanCard}>
          <Text style={styles.cardTitle}>Быстрая проверка URL</Text>
          <Input
            value={quickUrl}
            onChangeText={setQuickUrl}
            placeholder="https://example.com"
            icon="link-outline"
            showPasteButton
            showClearButton
            style={styles.quickInput}
          />
          <Button
            title={isScanning ? "Проверка..." : "Проверить"}
            onPress={handleQuickScan}
            loading={isScanning}
            disabled={!quickUrl.trim()}
            fullWidth
            icon={<Ionicons name="scan" size={20} color={Colors.text.primary} />}
          />
        </Card>
      </Animated.View>

      {/* Кнопки действий */}
      <Animated.View
        entering={FadeInDown.delay(200).duration(600)}
        style={styles.actionsContainer}
      >
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/scanner')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[Colors.primary[600], Colors.primary[700]]}
            style={styles.actionGradient}
          >
            <Ionicons name="link" size={32} color={Colors.text.primary} />
            <Text style={styles.actionTitle}>URL Сканер</Text>
            <Text style={styles.actionDesc}>Проверка ссылок</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/message')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[Colors.accent.purple, '#7C3AED']}
            style={styles.actionGradient}
          >
            <Ionicons name="chatbubble-ellipses" size={32} color={Colors.text.primary} />
            <Text style={styles.actionTitle}>Сообщения</Text>
            <Text style={styles.actionDesc}>Анализ SMS/Email</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* Статистика */}
      <Animated.View entering={FadeInDown.delay(300).duration(600)}>
        <Text style={styles.sectionTitle}>Статистика</Text>
        <View style={styles.statsContainer}>
          <Card variant="outlined" style={styles.statCard}>
            <Text style={styles.statNumber}>{statistics.totalScans}</Text>
            <Text style={styles.statLabel}>Всего проверок</Text>
          </Card>

          <Card variant="outlined" style={[styles.statCard, { borderColor: Colors.status.safe }]}>
            <Text style={[styles.statNumber, { color: Colors.status.safe }]}>
              {statistics.safeCount}
            </Text>
            <Text style={styles.statLabel}>Безопасных</Text>
          </Card>

          <Card variant="outlined" style={[styles.statCard, { borderColor: Colors.status.dangerous }]}>
            <Text style={[styles.statNumber, { color: Colors.status.dangerous }]}>
              {statistics.dangerousCount}
            </Text>
            <Text style={styles.statLabel}>Угроз</Text>
          </Card>
        </View>
      </Animated.View>

      {/* Недавние проверки */}
      <Animated.View entering={FadeInDown.delay(400).duration(600)}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Недавние проверки</Text>
          <TouchableOpacity onPress={() => router.push('/history')}>
            <Text style={styles.seeAll}>Все →</Text>
          </TouchableOpacity>
        </View>

        {recentScans.length === 0 ? (
          <Card variant="outlined" style={styles.emptyCard}>
            <Ionicons name="document-outline" size={40} color={Colors.text.muted} />
            <Text style={styles.emptyText}>История пуста</Text>
            <Text style={styles.emptyHint}>Проверки появятся здесь</Text>
          </Card>
        ) : (
          recentScans.map((item, index) => (
            <Animated.View
              key={item.id}
              entering={FadeInRight.delay(500 + index * 100).duration(400)}
            >
              <TouchableOpacity
                onPress={() => router.push(`/result/${item.id}`)}
                activeOpacity={0.7}
              >
                <Card style={styles.historyItem}>
                  <View style={styles.historyItemContent}>
                    <View style={[
                      styles.statusDot,
                      { backgroundColor: getStatusColor(item.result) }
                    ]} />
                    <View style={styles.historyItemText}>
                      <Text style={styles.historyUrl} numberOfLines={1}>
                        {item.input}
                      </Text>
                      <Text style={styles.historyTime}>
                        {formatRelativeTime(item.timestamp)}
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={Colors.text.muted}
                    />
                  </View>
                </Card>
              </TouchableOpacity>
            </Animated.View>
          ))
        )}
      </Animated.View>

      {/* Подвал */}
      <Animated.View entering={FadeInDown.delay(600).duration(600)}>
        <Card variant="outlined" style={styles.infoCard}>
          <Ionicons name="school" size={24} color={Colors.primary[400]} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Дипломный проект</Text>
            <Text style={styles.infoDesc}>
              Разработка методов обнаружения фишинговых атак с использованием ИИ
            </Text>
          </View>
        </Card>
      </Animated.View>
    </ScrollView>
  );
}

function getStatusColor(result: any): string {
  const classification = 'classification' in result ? result.classification : result.overallRisk;
  switch (classification) {
    case 'safe': return Colors.status.safe;
    case 'suspicious': return Colors.status.suspicious;
    case 'dangerous': return Colors.status.dangerous;
    default: return Colors.text.muted;
  }
}

function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Только что';
  if (minutes < 60) return `${minutes} мин. назад`;
  if (hours < 24) return `${hours} ч. назад`;
  if (days < 7) return `${days} дн. назад`;

  return date.toLocaleDateString('ru-RU');
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
    marginBottom: Spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    ...Typography.body,
    color: Colors.text.secondary,
  },
  appName: {
    ...Typography.h1,
    color: Colors.text.primary,
    marginTop: Spacing.xs,
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.primary[500] + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagline: {
    ...Typography.small,
    color: Colors.text.muted,
    marginTop: Spacing.sm,
  },
  quickScanCard: {
    marginBottom: Spacing.lg,
  },
  cardTitle: {
    ...Typography.h4,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  quickInput: {
    marginBottom: Spacing.md,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  actionCard: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  actionGradient: {
    padding: Spacing.lg,
    alignItems: 'center',
    minHeight: 120,
  },
  actionTitle: {
    ...Typography.bodyMedium,
    color: Colors.text.primary,
    marginTop: Spacing.sm,
  },
  actionDesc: {
    ...Typography.caption,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
  sectionTitle: {
    ...Typography.h4,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  seeAll: {
    ...Typography.small,
    color: Colors.primary[400],
  },
  statsContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.md,
  },
  statNumber: {
    ...Typography.h2,
    color: Colors.text.primary,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.text.muted,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  emptyCard: {
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.text.secondary,
    marginTop: Spacing.md,
  },
  emptyHint: {
    ...Typography.small,
    color: Colors.text.muted,
    marginTop: Spacing.xs,
  },
  historyItem: {
    marginBottom: Spacing.sm,
  },
  historyItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: Spacing.md,
  },
  historyItemText: {
    flex: 1,
  },
  historyUrl: {
    ...Typography.small,
    color: Colors.text.primary,
    fontFamily: 'SpaceMono',
  },
  historyTime: {
    ...Typography.caption,
    color: Colors.text.muted,
    marginTop: 2,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  infoContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  infoTitle: {
    ...Typography.bodyMedium,
    color: Colors.text.primary,
  },
  infoDesc: {
    ...Typography.caption,
    color: Colors.text.muted,
    marginTop: Spacing.xs,
  },
});
