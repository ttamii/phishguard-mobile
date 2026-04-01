import AsyncStorage from '@react-native-async-storage/async-storage';
import { HistoryItem, ScanStatistics } from './types';
import { Config } from '../constants/Config';

const STORAGE_KEYS = {
    HISTORY: '@phishing_detector/history',
    STATISTICS: '@phishing_detector/statistics',
    SETTINGS: '@phishing_detector/settings',
};

// Сохранить историю
export async function saveHistory(history: HistoryItem[]): Promise<void> {
    try {
        // Ограничиваем количество записей
        const trimmedHistory = history.slice(0, Config.MAX_HISTORY_ITEMS);
        await AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(trimmedHistory));
    } catch (error) {
        console.error('Ошибка сохранения истории:', error);
    }
}

// Загрузить историю
export async function loadHistory(): Promise<HistoryItem[]> {
    try {
        const data = await AsyncStorage.getItem(STORAGE_KEYS.HISTORY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Ошибка загрузки истории:', error);
        return [];
    }
}

// Добавить элемент в историю
export async function addToHistory(item: HistoryItem): Promise<void> {
    const history = await loadHistory();
    history.unshift(item);
    await saveHistory(history);
}

// Удалить элемент из истории
export async function removeFromHistory(id: string): Promise<void> {
    const history = await loadHistory();
    const filtered = history.filter(item => item.id !== id);
    await saveHistory(filtered);
}

// Очистить всю историю
export async function clearHistory(): Promise<void> {
    try {
        await AsyncStorage.removeItem(STORAGE_KEYS.HISTORY);
    } catch (error) {
        console.error('Ошибка очистки истории:', error);
    }
}

// Сохранить статистику
export async function saveStatistics(stats: ScanStatistics): Promise<void> {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.STATISTICS, JSON.stringify(stats));
    } catch (error) {
        console.error('Ошибка сохранения статистики:', error);
    }
}

// Загрузить статистику
export async function loadStatistics(): Promise<ScanStatistics> {
    try {
        const data = await AsyncStorage.getItem(STORAGE_KEYS.STATISTICS);
        if (data) {
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Ошибка загрузки статистики:', error);
    }

    // Возвращаем пустую статистику по умолчанию
    return {
        totalScans: 0,
        safeCount: 0,
        suspiciousCount: 0,
        dangerousCount: 0,
        todayScans: 0,
        weekScans: 0,
    };
}

// Обновить статистику после сканирования
export async function updateStatistics(classification: 'safe' | 'suspicious' | 'dangerous'): Promise<void> {
    const stats = await loadStatistics();

    stats.totalScans += 1;
    stats.todayScans += 1;
    stats.weekScans += 1;

    switch (classification) {
        case 'safe':
            stats.safeCount += 1;
            break;
        case 'suspicious':
            stats.suspiciousCount += 1;
            break;
        case 'dangerous':
            stats.dangerousCount += 1;
            break;
    }

    await saveStatistics(stats);
}

// Экспорт истории в JSON
export async function exportHistoryToJSON(): Promise<string> {
    const history = await loadHistory();
    return JSON.stringify(history, null, 2);
}
