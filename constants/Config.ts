// Конфигурация приложения
export const Config = {
    // API URL - задеплоенный backend на Render
    API_BASE_URL: 'https://phishguard-api-b6un.onrender.com',

    // Используем реальный API (не демо)
    USE_DEMO_MODE: false,

    // Таймаут запросов в миллисекундах
    API_TIMEOUT: 30000,

    // Информация о приложении
    APP_NAME: 'PhishGuard',
    APP_VERSION: '1.0.0',

    // Пороги классификации
    THRESHOLDS: {
        SAFE: 0.3,        // Вероятность < 30% = безопасно
        SUSPICIOUS: 0.7,  // 30-70% = подозрительно, > 70% = опасно
    },

    // ML модели
    MODELS: {
        LOGISTIC_REGRESSION: 'logistic_regression',
        RANDOM_FOREST: 'random_forest',
        XGBOOST: 'xgboost',
    },

    // Максимум записей в истории
    MAX_HISTORY_ITEMS: 100,
};

export default Config;
