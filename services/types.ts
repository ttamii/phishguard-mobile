// TypeScript типы для приложения обнаружения фишинга

// Классификация угрозы
export type ThreatClassification = 'safe' | 'suspicious' | 'dangerous';

// ML модели
export type ModelType = 'logistic_regression' | 'random_forest' | 'xgboost';

// Набор признаков URL
export interface FeatureSet {
    urlLength: number;
    domainLength: number;
    pathLength: number;
    hasHttps: boolean;
    hasIPAddress: boolean;
    subdomainCount: number;
    specialCharCount: number;
    hasAtSymbol: boolean;
    hasSuspiciousPort: boolean;
    suspiciousKeywords: string[];
    domainAge?: number;
    isShortened: boolean;
    numericDomain: boolean;
    pathDepth: number;
    queryParamCount: number;
    entropyScore: number;
}

// Вклад признака (SHAP)
export interface FeatureContribution {
    feature: string;
    featureRu: string; // Название на русском
    value: number | string | boolean;
    displayValue: string;
    contribution: number;
    direction: 'increases_risk' | 'decreases_risk';
}

// Объяснение модели
export interface Explanation {
    shapValues: FeatureContribution[];
    topPositiveFeatures: FeatureContribution[];
    topNegativeFeatures: FeatureContribution[];
    baseValue: number;
    interpretationText: string;
    interpretationTextRu: string;
}

// Результат сканирования
export interface ScanResult {
    scanId: string;
    url: string;
    isPhishing: boolean;
    probability: number;
    confidence: number;
    classification: ThreatClassification;
    modelUsed: ModelType;
    features: FeatureSet;
    explanation?: Explanation;
    timestamp: string;
    scanDuration: number; // миллисекунды
}

// Запрос на сканирование URL
export interface ScanURLRequest {
    url: string;
    model?: ModelType;
    includeExplanation?: boolean;
}

// Запрос на сканирование сообщения
export interface ScanMessageRequest {
    text: string;
    extractUrls?: boolean;
}

// Результат анализа сообщения
export interface MessageScanResult {
    scanId: string;
    originalText: string;
    extractedUrls: string[];
    urlResults: ScanResult[];
    overallRisk: ThreatClassification;
    timestamp: string;
}

// Информация о модели
export interface ModelInfo {
    id: ModelType;
    name: string;
    nameRu: string;
    description: string;
    descriptionRu: string;
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
}

// Элемент истории
export interface HistoryItem {
    id: string;
    type: 'url' | 'message';
    input: string;
    result: ScanResult | MessageScanResult;
    timestamp: string;
    isFavorite: boolean;
}

// Статистика
export interface ScanStatistics {
    totalScans: number;
    safeCount: number;
    suspiciousCount: number;
    dangerousCount: number;
    todayScans: number;
    weekScans: number;
}

// Состояние загрузки
export interface LoadingState {
    isLoading: boolean;
    error: string | null;
}

// Перевод признаков на русский
export const FeatureTranslations: Record<string, string> = {
    urlLength: 'Длина URL',
    domainLength: 'Длина домена',
    pathLength: 'Длина пути',
    hasHttps: 'Наличие HTTPS',
    hasIPAddress: 'IP вместо домена',
    subdomainCount: 'Количество поддоменов',
    specialCharCount: 'Спецсимволы',
    hasAtSymbol: 'Символ @',
    hasSuspiciousPort: 'Подозрительный порт',
    suspiciousKeywords: 'Подозрительные слова',
    domainAge: 'Возраст домена',
    isShortened: 'Сокращённый URL',
    numericDomain: 'Цифровой домен',
    pathDepth: 'Глубина пути',
    queryParamCount: 'Кол-во параметров',
    entropyScore: 'Энтропия URL',
};

// Перевод классификации
export const ClassificationTranslations: Record<ThreatClassification, string> = {
    safe: 'Безопасно',
    suspicious: 'Подозрительно',
    dangerous: 'Опасно',
};

// Перевод моделей
export const ModelTranslations: Record<ModelType, string> = {
    logistic_regression: 'Логистическая регрессия',
    random_forest: 'Случайный лес',
    xgboost: 'XGBoost',
};
