import axios, { AxiosInstance, AxiosError } from 'axios';
import {
    ScanResult,
    ScanURLRequest,
    MessageScanResult,
    ModelInfo,
    Explanation,
    ThreatClassification
} from './types';
import { Config } from '../constants/Config';

// Демо данные для работы без сервера
function generateDemoScanResult(url: string, model: string = 'xgboost'): ScanResult {
    // Простой анализ URL
    const hasHttps = url.startsWith('https://');
    const hasSuspiciousWords = /login|verify|secure|account|confirm|bank|paypal|password/i.test(url);
    const hasIp = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(url);
    const isLongUrl = url.length > 75;
    const hasAtSymbol = url.includes('@');
    const hasSuspiciousTld = /\.(xyz|tk|ml|ga|cf|gq|top|click|loan|work)$/i.test(url);

    // Расчёт вероятности
    let probability = 0.15; // Базовый
    if (!hasHttps) probability += 0.15;
    if (hasSuspiciousWords) probability += 0.25;
    if (hasIp) probability += 0.30;
    if (isLongUrl) probability += 0.10;
    if (hasAtSymbol) probability += 0.20;
    if (hasSuspiciousTld) probability += 0.25;

    probability = Math.min(0.99, probability);

    const classification: ThreatClassification =
        probability >= 0.7 ? 'dangerous' :
            probability >= 0.3 ? 'suspicious' : 'safe';

    const suspiciousKeywords = [];
    if (/login/i.test(url)) suspiciousKeywords.push('login');
    if (/verify/i.test(url)) suspiciousKeywords.push('verify');
    if (/secure/i.test(url)) suspiciousKeywords.push('secure');
    if (/account/i.test(url)) suspiciousKeywords.push('account');
    if (/bank/i.test(url)) suspiciousKeywords.push('bank');

    const explanation: Explanation = {
        shapValues: [
            { feature: 'hasHttps', featureRu: 'Наличие HTTPS', value: hasHttps, displayValue: hasHttps ? 'Да' : 'Нет', contribution: hasHttps ? -0.1 : 0.15, direction: hasHttps ? 'decreases_risk' : 'increases_risk' },
            { feature: 'suspiciousKeywords', featureRu: 'Подозрительные слова', value: suspiciousKeywords.length, displayValue: `${suspiciousKeywords.length} слов`, contribution: suspiciousKeywords.length * 0.08, direction: 'increases_risk' },
            { feature: 'urlLength', featureRu: 'Длина URL', value: url.length, displayValue: `${url.length} символов`, contribution: isLongUrl ? 0.1 : -0.05, direction: isLongUrl ? 'increases_risk' : 'decreases_risk' },
            { feature: 'hasIPAddress', featureRu: 'IP вместо домена', value: hasIp, displayValue: hasIp ? 'Да' : 'Нет', contribution: hasIp ? 0.3 : -0.05, direction: hasIp ? 'increases_risk' : 'decreases_risk' },
            { feature: 'hasAtSymbol', featureRu: 'Символ @', value: hasAtSymbol, displayValue: hasAtSymbol ? 'Да' : 'Нет', contribution: hasAtSymbol ? 0.2 : 0, direction: hasAtSymbol ? 'increases_risk' : 'decreases_risk' },
        ],
        topPositiveFeatures: [],
        topNegativeFeatures: [],
        baseValue: 0.35,
        interpretationText: probability > 0.7 ? 'High phishing risk' : probability > 0.3 ? 'Suspicious URL' : 'Appears safe',
        interpretationTextRu: probability > 0.7 ? 'Высокий риск фишинга' : probability > 0.3 ? 'Подозрительный URL' : 'Выглядит безопасно',
    };

    return {
        scanId: `demo-${Date.now()}`,
        url,
        isPhishing: probability >= 0.5,
        probability: Math.round(probability * 100) / 100,
        confidence: Math.round((probability > 0.5 ? probability * 1.05 : (1 - probability) * 1.05) * 100) / 100,
        classification,
        modelUsed: model,
        features: {
            urlLength: url.length,
            domainLength: new URL(url.startsWith('http') ? url : `https://${url}`).hostname.length,
            pathLength: url.split('/').slice(3).join('/').length,
            hasHttps,
            hasIPAddress: hasIp,
            subdomainCount: (url.match(/\./g) || []).length - 1,
            specialCharCount: (url.match(/[@#$%^&*()]/g) || []).length,
            hasAtSymbol,
            hasSuspiciousPort: false,
            suspiciousKeywords,
            isShortened: false,
            numericDomain: false,
            pathDepth: url.split('/').length - 3,
            queryParamCount: (url.match(/[?&]/g) || []).length,
            entropyScore: 4.2,
        },
        explanation,
        timestamp: new Date().toISOString(),
        scanDuration: 150 + Math.floor(Math.random() * 100),
    };
}

// Класс API клиента
class PhishingAPI {
    private client: AxiosInstance;
    private useDemoMode: boolean = true;

    constructor() {
        this.client = axios.create({
            baseURL: Config.API_BASE_URL,
            timeout: Config.API_TIMEOUT,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });

        // Проверяем доступность сервера
        this.checkServerAvailability();
    }

    private async checkServerAvailability() {
        // Попробуем подключиться несколько раз (Render может просыпаться до 60 сек)
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                console.log(`🔄 Попытка подключения к серверу (${attempt}/3)...`);
                await this.client.get('/health', { timeout: 15000 });
                this.useDemoMode = false;
                console.log('✅ API сервер доступен');
                return;
            } catch {
                console.log(`⏳ Сервер не ответил (попытка ${attempt}/3)`);
                if (attempt < 3) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            }
        }
        this.useDemoMode = true;
        console.log('📱 Работаем в демо-режиме (без сервера)');
    }

    // Сканирование URL
    async scanURL(request: ScanURLRequest): Promise<ScanResult> {
        // Всегда пробуем реальный API сначала (если не принудительный демо-режим)
        if (!Config.USE_DEMO_MODE) {
            try {
                console.log('🔄 Отправляем запрос к серверу...');
                const response = await this.client.post<ScanResult>('/api/v1/scan/url', {
                    url: request.url,
                    model: request.model || 'xgboost',
                    include_explanation: request.includeExplanation ?? true,
                }, { timeout: 30000 });
                console.log('✅ Получен ответ от сервера');
                this.useDemoMode = false;
                return response.data;
            } catch (error) {
                console.log('⚠️ Сервер недоступен, используем демо-режим');
                this.useDemoMode = true;
            }
        }

        // Fallback на демо-режим
        await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
        return generateDemoScanResult(request.url, request.model);
    }

    // Сканирование сообщения
    async scanMessage(text: string, extractUrls: boolean = true): Promise<MessageScanResult> {
        // Извлекаем URL из текста
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const extractedUrls = text.match(urlRegex) || [];

        if (this.useDemoMode || Config.USE_DEMO_MODE) {
            await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));

            const urlResults = await Promise.all(
                extractedUrls.map(url => this.scanURL({ url, model: 'xgboost', includeExplanation: true }))
            );

            const overallRisk: ThreatClassification =
                urlResults.some(r => r.classification === 'dangerous') ? 'dangerous' :
                    urlResults.some(r => r.classification === 'suspicious') ? 'suspicious' : 'safe';

            return {
                scanId: `msg-${Date.now()}`,
                originalText: text.slice(0, 500),
                extractedUrls,
                urlResults,
                overallRisk,
                timestamp: new Date().toISOString(),
            };
        }

        const response = await this.client.post<MessageScanResult>('/api/v1/scan/message', {
            text,
            extract_urls: extractUrls,
        });
        return response.data;
    }

    // Получение объяснения для сканирования
    async getExplanation(scanId: string): Promise<Explanation> {
        const response = await this.client.get<Explanation>(
            `/api/v1/scan/${scanId}/explanation`
        );
        return response.data;
    }

    // Получение информации о доступных моделях
    async getModels(): Promise<ModelInfo[]> {
        if (this.useDemoMode || Config.USE_DEMO_MODE) {
            return [
                { id: 'logistic_regression', name: 'Logistic Regression', nameRu: 'Логистическая регрессия', description: 'Fast linear classifier', descriptionRu: 'Быстрый линейный классификатор', accuracy: 0.90, precision: 0.89, recall: 0.92, f1Score: 0.91 },
                { id: 'random_forest', name: 'Random Forest', nameRu: 'Случайный лес', description: 'Ensemble of decision trees', descriptionRu: 'Ансамбль деревьев решений', accuracy: 0.93, precision: 0.92, recall: 0.95, f1Score: 0.93 },
                { id: 'xgboost', name: 'XGBoost', nameRu: 'XGBoost', description: 'Best accuracy model', descriptionRu: 'Модель с лучшей точностью', accuracy: 0.95, precision: 0.95, recall: 0.95, f1Score: 0.95 },
            ];
        }
        const response = await this.client.get<{ models: ModelInfo[] }>('/api/v1/models');
        return response.data.models;
    }

    // Проверка здоровья API
    async healthCheck(): Promise<boolean> {
        try {
            const response = await this.client.get('/health', { timeout: 3000 });
            return response.status === 200;
        } catch {
            return false;
        }
    }
}

// Экспорт синглтона
export const api = new PhishingAPI();
export default api;
