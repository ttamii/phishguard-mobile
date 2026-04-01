import { create } from 'zustand';
import {
    ScanResult,
    MessageScanResult,
    HistoryItem,
    ScanStatistics,
    ModelType,
    ThreatClassification
} from '../services/types';
import {
    loadHistory,
    saveHistory,
    addToHistory,
    loadStatistics,
    updateStatistics
} from '../services/storage';
import { api } from '../services/api';

interface ScanState {
    // Текущее сканирование
    currentScan: ScanResult | null;
    currentMessageScan: MessageScanResult | null;
    isScanning: boolean;
    scanError: string | null;

    // История
    history: HistoryItem[];
    isLoadingHistory: boolean;

    // Статистика
    statistics: ScanStatistics;

    // Настройки
    selectedModel: ModelType;
    includeExplanation: boolean;

    // Действия
    scanURL: (url: string) => Promise<ScanResult | null>;
    scanMessage: (text: string) => Promise<MessageScanResult | null>;
    setSelectedModel: (model: ModelType) => void;
    setIncludeExplanation: (include: boolean) => void;
    loadHistoryFromStorage: () => Promise<void>;
    clearError: () => void;
    clearCurrentScan: () => void;
}

export const useScanStore = create<ScanState>((set, get) => ({
    // Начальное состояние
    currentScan: null,
    currentMessageScan: null,
    isScanning: false,
    scanError: null,
    history: [],
    isLoadingHistory: false,
    statistics: {
        totalScans: 0,
        safeCount: 0,
        suspiciousCount: 0,
        dangerousCount: 0,
        todayScans: 0,
        weekScans: 0,
    },
    selectedModel: 'xgboost',
    includeExplanation: true,

    // Сканирование URL
    scanURL: async (url: string) => {
        set({ isScanning: true, scanError: null, currentScan: null });

        try {
            const { selectedModel, includeExplanation } = get();
            const result = await api.scanURL({
                url,
                model: selectedModel,
                includeExplanation,
            });

            // Добавляем в историю
            const historyItem: HistoryItem = {
                id: result.scanId,
                type: 'url',
                input: url,
                result,
                timestamp: result.timestamp,
                isFavorite: false,
            };

            await addToHistory(historyItem);
            await updateStatistics(result.classification);

            // Обновляем локальное состояние
            const history = await loadHistory();
            const statistics = await loadStatistics();

            set({
                currentScan: result,
                isScanning: false,
                history,
                statistics,
            });

            return result;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Произошла ошибка';
            set({ scanError: errorMessage, isScanning: false });
            return null;
        }
    },

    // Сканирование сообщения
    scanMessage: async (text: string) => {
        set({ isScanning: true, scanError: null, currentMessageScan: null });

        try {
            const result = await api.scanMessage(text, true);

            // Добавляем в историю
            const historyItem: HistoryItem = {
                id: result.scanId,
                type: 'message',
                input: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
                result,
                timestamp: result.timestamp,
                isFavorite: false,
            };

            await addToHistory(historyItem);
            await updateStatistics(result.overallRisk);

            const history = await loadHistory();
            const statistics = await loadStatistics();

            set({
                currentMessageScan: result,
                isScanning: false,
                history,
                statistics,
            });

            return result;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Произошла ошибка';
            set({ scanError: errorMessage, isScanning: false });
            return null;
        }
    },

    // Установить модель
    setSelectedModel: (model: ModelType) => {
        set({ selectedModel: model });
    },

    // Включить/выключить объяснение
    setIncludeExplanation: (include: boolean) => {
        set({ includeExplanation: include });
    },

    // Загрузить историю из хранилища
    loadHistoryFromStorage: async () => {
        set({ isLoadingHistory: true });
        try {
            const history = await loadHistory();
            const statistics = await loadStatistics();
            set({ history, statistics, isLoadingHistory: false });
        } catch (error) {
            set({ isLoadingHistory: false });
        }
    },

    // Очистить ошибку
    clearError: () => {
        set({ scanError: null });
    },

    // Очистить текущий результат
    clearCurrentScan: () => {
        set({ currentScan: null, currentMessageScan: null });
    },
}));

export default useScanStore;
