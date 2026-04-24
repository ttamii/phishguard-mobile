import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
  TouchableOpacity
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as WebBrowser from 'expo-web-browser';

import { Colors } from '../../constants/Colors';
import { Typography, Spacing, BorderRadius } from '../../constants/Typography';
import { Card } from '../../components/ui/Card';

const VIDEOS = [
  {
    id: 'gWGhUdHItto',
    title: 'Что такое фишинг?',
    duration: '3:24',
    desc: 'Наглядное объяснение того, как работает фишинг и почему это главная угроза в сети.'
  },
  {
    id: 'RCWET-iD6KE',
    title: 'Социальная инженерия',
    duration: '4:15',
    desc: 'Как мошенники манипулируют человеческой психологией для взлома защищенных систем.'
  },
  {
    id: '8zSoyAmHHc4',
    title: 'Вредоносное ПО (Malware)',
    duration: '5:30',
    desc: 'Разбор видов вирусов, троянов и методов их незаметного проникновения на устройства.'
  },
  {
    id: 'aofmtE6Rp-w',
    title: 'Программы-вымогатели (Ransomware)',
    duration: '4:42',
    desc: 'Как работают вирусы-шифровальщики и как защитить свои критически важные данные.'
  },
  {
    id: '74xiirBy5Iw',
    title: 'Безопасность паролей',
    duration: '3:50',
    desc: 'Почему сложные пароли и двухфакторная аутентификация — основа кибербезопасности.'
  }
];

export default function EducationScreen() {
  const insets = useSafeAreaInsets();

  const handlePlayVideo = async (id: string) => {
    // Открываем видео во встроенном браузере приложения (In-App Browser).
    // Это обходит запрет YouTube на встраивание (Error 153), но оставляет пользователя внутри твоего приложения!
    await WebBrowser.openBrowserAsync(`https://www.youtube.com/watch?v=${id}`);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 100 }
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
        <Text style={styles.title}>Обучение и защита</Text>
        <Text style={styles.subtitle}>База знаний по кибербезопасности</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(100).duration(400)}>
        <Card variant="default" style={styles.card}>
          <Text style={styles.sectionTitle}>Что такое фишинг?</Text>
          <Text style={styles.paragraph}>
            Фишинг (от англ. phishing — выуживание) — это вид интернет-мошенничества, цель которого — получить доступ к конфиденциальным данным пользователей: логинам, паролям, данным банковских карт.
          </Text>
          <Text style={styles.paragraph}>
            Мошенники создают поддельные копии популярных сайтов (банков, соцсетей, интернет-магазинов) и рассылают ссылки на них через email, SMS или мессенджеры, маскируясь под официальные уведомления.
          </Text>
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(400)}>
        <Card variant="outlined" style={styles.card}>
          <Text style={styles.sectionTitle}>Основные признаки атаки</Text>

          <View style={styles.listItem}>
            <Ionicons name="alert-circle" size={24} color={Colors.status.warning} />
            <Text style={styles.listText}>Срочность: "Ваш аккаунт заблокирован! Срочно перейдите по ссылке..."</Text>
          </View>

          <View style={styles.listItem}>
            <Ionicons name="link" size={24} color={Colors.status.dangerous} />
            <Text style={styles.listText}>Странные URL: Вместо kaspi.kz используется kaspi-secure-login.com.</Text>
          </View>

          <View style={styles.listItem}>
            <Ionicons name="mail" size={24} color={Colors.status.info} />
            <Text style={styles.listText}>Обезличенное обращение: "Уважаемый клиент" вместо вашего имени.</Text>
          </View>

          <View style={styles.listItem}>
            <Ionicons name="gift" size={24} color={Colors.status.safe} />
            <Text style={styles.listText}>Слишком выгодные предложения: "Вы выиграли iPhone 15!"</Text>
          </View>
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300).duration(400)}>
        <Text style={styles.videoHeader}>Видео-курсы от IBM Security</Text>

        {VIDEOS.map((video, index) => (
          <View key={video.id} style={styles.videoCard}>
            <Text style={styles.videoTitle}>{index + 1}. {video.title}</Text>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handlePlayVideo(video.id)}
              style={styles.videoContainer}
            >
              <ImageBackground
                source={{ uri: `https://img.youtube.com/vi/${video.id}/maxresdefault.jpg` }}
                style={styles.thumbnail}
                imageStyle={styles.thumbnailImage}
              >
                <View style={styles.overlay}>
                  <View style={styles.playButton}>
                    <Ionicons name="play" size={24} color="#fff" style={{ marginLeft: 3 }} />
                  </View>
                  <Text style={styles.videoDuration}>{video.duration}</Text>
                </View>
              </ImageBackground>
            </TouchableOpacity>

            <Text style={styles.videoDesc}>{video.desc}</Text>
          </View>
        ))}
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
  },
  header: {
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.h2,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.text.secondary,
  },
  card: {
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.h4,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  paragraph: {
    ...Typography.body,
    color: Colors.text.secondary,
    lineHeight: 24,
    marginBottom: Spacing.md,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  listText: {
    ...Typography.body,
    color: Colors.text.secondary,
    flex: 1,
    lineHeight: 22,
  },
  videoHeader: {
    ...Typography.h4,
    color: Colors.text.primary,
    marginBottom: Spacing.lg,
    marginTop: Spacing.md,
  },
  videoCard: {
    marginBottom: Spacing.xl,
  },
  videoTitle: {
    ...Typography.bodyMedium,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
    fontWeight: '600',
  },
  videoContainer: {
    height: 180,
    width: '100%',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.background.secondary,
    marginBottom: Spacing.sm,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailImage: {
    borderRadius: BorderRadius.lg,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  videoDuration: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.8)',
    color: '#fff',
    ...Typography.caption,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  videoDesc: {
    ...Typography.caption,
    color: Colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.md,
  }
});
