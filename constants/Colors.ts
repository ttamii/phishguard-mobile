// Цветовая палитра - тема кибербезопасности
export const Colors = {
  // Основной — кибер-синий
  primary: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
  },

  // Цвета статусов угроз
  status: {
    safe: '#10B981',       // Изумрудный — безопасно
    suspicious: '#F59E0B', // Янтарный — подозрительно
    dangerous: '#EF4444',  // Красный — опасно
  },

  // Тёмная тема фона
  background: {
    primary: '#0F172A',    // Slate 900
    secondary: '#1E293B',  // Slate 800
    tertiary: '#334155',   // Slate 700
    card: '#1E293B',
    elevated: '#334155',
  },

  // Текст
  text: {
    primary: '#F8FAFC',
    secondary: '#94A3B8',
    muted: '#64748B',
    inverse: '#0F172A',
  },

  // Акценты
  accent: {
    cyan: '#06B6D4',
    purple: '#8B5CF6',
    pink: '#EC4899',
  },

  // Граница
  border: {
    default: '#334155',
    subtle: '#1E293B',
    focus: '#3B82F6',
  },
};

// Алиасы для светлой/тёмной темы (приложение использует только тёмную)
export const light = Colors;
export const dark = Colors;
