import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, router, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '../constants/Colors';
import { authService } from '../services/auth';

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'auth',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const segments = useSegments();

  // Проверка аутентификации при запуске
  useEffect(() => {
    checkAuth();
    // Единый callback для изменения статуса авторизации
    authService.setOnAuthChangeCallback((authenticated: boolean) => {
      setIsAuthenticated(authenticated);
    });
  }, []);

  const checkAuth = async () => {
    try {
      // Проверяем наличие активной сессии (а не просто данных пользователя)
      const hasSession = await authService.hasActiveSession();

      if (hasSession) {
        // Есть сессия — проверяем биометрию если включена
        const user = await authService.getCurrentUser();
        const biometricEnabled = await authService.isBiometricEnabled();

        if (user && biometricEnabled) {
          const { isSupported } = await authService.checkBiometricSupport();
          if (isSupported) {
            const success = await authService.authenticateWithBiometric();
            setIsAuthenticated(success);
            return;
          }
        }
        // Сессия есть — пускаем
        setIsAuthenticated(true);
      } else {
        // Нет сессии — на экран логина
        setIsAuthenticated(false);
      }
    } catch (e) {
      setIsAuthenticated(false);
    }
  };

  // Редирект на основе статуса аутентификации
  useEffect(() => {
    if (isAuthenticated === null || !loaded) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!isAuthenticated && !inAuthGroup) {
      // Не авторизован и не на странице авторизации - редирект
      router.replace('/auth/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Авторизован но на странице авторизации - в приложение
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments, loaded]);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded && isAuthenticated !== null) {
      SplashScreen.hideAsync();
    }
  }, [loaded, isAuthenticated]);

  if (!loaded || isAuthenticated === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background.primary }}>
        <ActivityIndicator size="large" color={Colors.primary[400]} />
      </View>
    );
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="auth" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        <Stack.Screen name="result/[id]" />
      </Stack>
    </ThemeProvider>
  );
}
