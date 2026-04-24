import React from 'react';
import { View, Platform, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/Colors';
import { FloatingChatButton } from '../../components/chat/FloatingChatButton';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  // Высота таб-бара с учётом home indicator iPhone
  const tabBarHeight = 60 + Math.max(insets.bottom, 10);

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors.primary[400],
          tabBarInactiveTintColor: Colors.text.muted,
          tabBarStyle: {
            backgroundColor: Colors.background.secondary,
            borderTopColor: Colors.border.default,
            borderTopWidth: 1,
            height: tabBarHeight,
            paddingTop: 6,
            paddingBottom: Math.max(insets.bottom, 10),
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '500',
            marginTop: 2,
          },
          tabBarIconStyle: {
            marginTop: 2,
          },
          headerShown: false,
        }}
      >
        {/* Главная */}
        <Tabs.Screen
          name="index"
          options={{
            title: 'Главная',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'home' : 'home-outline'}
                size={22}
                color={color}
              />
            ),
          }}
        />

        {/* Обучение (вместо URL Сканера) */}
        <Tabs.Screen
          name="education"
          options={{
            title: 'Обучение',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'school' : 'school-outline'}
                size={22}
                color={color}
              />
            ),
          }}
        />

        {/* QR - Центральная кнопка (выделенная) */}
        <Tabs.Screen
          name="qrscanner"
          options={{
            title: '',
            tabBarIcon: ({ focused }) => (
              <View style={styles.qrButton}>
                <LinearGradient
                  colors={[Colors.primary[500], Colors.primary[600]]}
                  style={styles.qrGradient}
                >
                  <Ionicons
                    name="qr-code"
                    size={26}
                    color="#fff"
                  />
                </LinearGradient>
              </View>
            ),
          }}
        />

        {/* История */}
        <Tabs.Screen
          name="history"
          options={{
            title: 'История',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'time' : 'time-outline'}
                size={22}
                color={color}
              />
            ),
          }}
        />

        {/* Профиль */}
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Профиль',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'person' : 'person-outline'}
                size={22}
                color={color}
              />
            ),
          }}
        />

        {/* Скрытые экраны */}
        <Tabs.Screen name="scanner" options={{ href: null }} />
        <Tabs.Screen name="message" options={{ href: null }} />
        <Tabs.Screen name="chatbot" options={{ href: null }} />
        <Tabs.Screen name="about" options={{ href: null }} />
      </Tabs>

      {/* Плавающая кнопка AI чат-бота */}
      <FloatingChatButton />
    </View>
  );
}

const styles = StyleSheet.create({
  qrButton: {
    marginTop: -25,
    shadowColor: Colors.primary[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  qrGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.background.secondary,
  },
});

