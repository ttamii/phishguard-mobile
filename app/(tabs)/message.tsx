import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';
import * as Clipboard from 'expo-clipboard';

import { Colors } from '../../constants/Colors';
import { Typography, Spacing, BorderRadius } from '../../constants/Typography';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

// Для связи с нашим локальным API для теста (или Render для продакшена)
// Если бэкенд выключен, мы используем простую локальную оценку ниже для быстрого UI теста
const API_URL = 'http://127.0.0.1:8000/api/v1/password';

export default function MessageScreen() {
  const insets = useSafeAreaInsets();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Локальная заглушка на случай, если локальный бэкенд недоступен
  const localAnalyze = (text: string) => {
    if (!text) return null;
    let score = 0;
    const feedback = [];
    if (text.length < 8) feedback.push("Пароль слишком короткий (минимум 8 символов)");
    else score += 1;
    if (!/[A-Z]/.test(text)) feedback.push("Добавьте заглавные буквы");
    else score += 1;
    if (!/[0-9]/.test(text)) feedback.push("Добавьте цифры");
    else score += 1;
    if (!/[^a-zA-Z0-9]/.test(text)) feedback.push("Добавьте специальные символы (!@#$%)");
    else score += 1;
    if (score === 4) feedback.push("Отличный пароль!");
    
    return { score, feedback };
  };

  const analyzePassword = async (text: string) => {
    setPassword(text);
    if (!text) {
      setResult(null);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: text })
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
      } else {
        // Если API не отвечает (например, с телефона не видит localhost), используем локальную заглушку
        setResult(localAnalyze(text));
      }
    } catch (e) {
      // Заглушка для демонстрации UI без бэкенда
      setResult(localAnalyze(text));
    }
  };

  const generatePassword = async () => {
    setGenerating(true);
    try {
      const res = await fetch(`${API_URL}/generate?length=16`);
      if (res.ok) {
        const data = await res.json();
        setPassword(data.password);
        analyzePassword(data.password);
      } else {
        throw new Error("Local API offline");
      }
    } catch (e) {
      // Локальная генерация, если API недоступно
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
      let p = "";
      for (let i = 0; i < 16; i++) {
        p += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      setPassword(p);
      analyzePassword(p);
      setShowPassword(true); // Автоматически показываем сгенерированный пароль
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    if (password) {
      await Clipboard.setStringAsync(password);
    }
  };

  const getScoreColor = (score: number) => {
    switch (score) {
      case 0:
      case 1: return Colors.status.dangerous;
      case 2: return Colors.status.warning || '#F59E0B';
      case 3:
      case 4: return Colors.status.safe;
      default: return Colors.text.muted;
    }
  };

  const getScoreText = (score: number) => {
    switch (score) {
      case 0: return 'Очень слабый';
      case 1: return 'Слабый';
      case 2: return 'Средний';
      case 3: return 'Надежный';
      case 4: return 'Очень надежный';
      default: return '';
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 40 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
          <Button
            title=""
            icon={<Ionicons name="arrow-back" size={24} color={Colors.text.primary} />}
            variant="ghost"
            onPress={() => router.back()}
            style={styles.backButton}
          />
          <Text style={styles.title}>Анализатор паролей</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <Card variant="default" style={styles.inputCard}>
            <Text style={styles.label}>Введите или сгенерируйте пароль</Text>
            
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color={Colors.text.muted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={analyzePassword}
                placeholder="Ваш пароль..."
                placeholderTextColor={Colors.text.muted}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.iconButton}
              >
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={Colors.text.muted} />
              </TouchableOpacity>
              {password.length > 0 && (
                <TouchableOpacity
                  onPress={copyToClipboard}
                  style={styles.iconButton}
                >
                  <Ionicons name="copy-outline" size={20} color={Colors.primary[400]} />
                </TouchableOpacity>
              )}
            </View>

            <Button
              title={generating ? "Генерация..." : "Сгенерировать надежный"}
              variant="secondary"
              icon={<Ionicons name="color-wand-outline" size={20} color={Colors.text.primary} />}
              onPress={generatePassword}
              disabled={generating}
              fullWidth
              style={styles.generateButton}
            />
          </Card>
        </Animated.View>

        {result && (
          <Animated.View entering={FadeInDown.delay(200).duration(400)}>
            <Card variant="outlined" style={styles.resultCard}>
              <View style={styles.scoreHeader}>
                <Text style={styles.scoreTitle}>Надежность:</Text>
                <Text style={[styles.scoreText, { color: getScoreColor(result.score) }]}>
                  {getScoreText(result.score)}
                </Text>
              </View>

              <View style={styles.progressBarContainer}>
                {[0, 1, 2, 3, 4].map((level) => (
                  <View
                    key={level}
                    style={[
                      styles.progressSegment,
                      {
                        backgroundColor: level <= result.score ? getScoreColor(result.score) : Colors.border.default
                      }
                    ]}
                  />
                ))}
              </View>

              <View style={styles.feedbackContainer}>
                <Text style={styles.feedbackTitle}>Рекомендации:</Text>
                {result.feedback.map((tip: string, index: number) => (
                  <View key={index} style={styles.feedbackItem}>
                    <Ionicons name={result.score === 4 ? "checkmark-circle" : "alert-circle"} size={16} color={getScoreColor(result.score)} />
                    <Text style={styles.feedbackText}>{tip}</Text>
                  </View>
                ))}
              </View>
            </Card>
          </Animated.View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  content: {
    padding: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  backButton: {
    padding: 0,
    width: 40,
    height: 40,
    marginRight: Spacing.sm,
  },
  title: {
    ...Typography.h2,
    color: Colors.text.primary,
  },
  inputCard: {
    marginBottom: Spacing.md,
  },
  label: {
    ...Typography.bodyMedium,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border.default,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
    height: 50,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    color: Colors.text.primary,
    ...Typography.body,
    height: '100%',
  },
  iconButton: {
    padding: 0,
    width: 36,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  generateButton: {
    marginTop: Spacing.sm,
  },
  resultCard: {
    padding: Spacing.lg,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  scoreTitle: {
    ...Typography.h4,
    color: Colors.text.primary,
  },
  scoreText: {
    ...Typography.h4,
    fontWeight: '700',
  },
  progressBarContainer: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: Spacing.xl,
  },
  progressSegment: {
    flex: 1,
    height: 6,
    borderRadius: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.lg,
  },
  infoText: {
    ...Typography.body,
    color: Colors.text.secondary,
    marginLeft: Spacing.sm,
    flex: 1,
  },
  highlight: {
    color: Colors.text.primary,
    fontWeight: '600',
  },
  feedbackContainer: {
    gap: Spacing.sm,
  },
  feedbackTitle: {
    ...Typography.bodyMedium,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  feedbackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  feedbackText: {
    ...Typography.body,
    color: Colors.text.secondary,
    flex: 1,
  },
});
