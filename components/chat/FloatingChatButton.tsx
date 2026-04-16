import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    ScrollView,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Dimensions,
    ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
    FadeInUp,
    SlideInRight
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors } from '../../constants/Colors';
import { Typography, Spacing, BorderRadius } from '../../constants/Typography';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============================================================
// GOOGLE GEMINI API (БЕСПЛАТНЫЙ!)
// Получить ключ: https://aistudio.google.com/app/apikey
// ============================================================
// Ключ загружается из config/secrets.json (не пушится в GitHub)
let GEMINI_API_KEY = '';
try {
    const secrets = require('../config/secrets.json');
    GEMINI_API_KEY = secrets.GEMINI_API_KEY || '';
    if (GEMINI_API_KEY) {
        console.log('✅ Gemini API key loaded from JSON (starts with: ' + GEMINI_API_KEY.substring(0, 5) + '...)');
    } else {
        console.warn('⚠️ Gemini API key is empty in secrets.json');
    }
} catch (e) {
    console.log('⚠️ Gemini API key not found in secrets.json, using fallback mode');
}

const SYSTEM_PROMPT = `Ты — AI-помощник по кибербезопасности в приложении PhishGuard.

СТРОГИЕ ПРАВИЛА:
- Отвечай ТОЛЬКО на вопросы о фишинге, кибербезопасности, защите данных и работе приложения PhishGuard.
- Если вопрос НЕ связан с кибербезопасностью — вежливо откажи: "Я специализируюсь только на кибербезопасности. Задайте вопрос о фишинге или защите данных."
- Отвечай кратко (2-4 предложения), на русском языке, дружелюбно.
- Используй эмодзи для акцентов.

О приложении PhishGuard:
- Использует ML модель XGBoost для анализа URL
- Точность обнаружения: 94.5%
- Анализирует 20 лексических признаков URL
- Показывает SHAP объяснение почему URL опасен
- Работает без загрузки страницы — анализирует только строку URL`;

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

// Функция для вызова Google Gemini API
async function callGemini(messages: { role: string; content: string }[]): Promise<string> {

    try {
        // Формируем контент для Gemini
        const contents = messages.map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
        }));

        // Добавляем системный промпт в начало
        contents.unshift({
            role: 'user',
            parts: [{ text: `Контекст: ${SYSTEM_PROMPT}\n\nТеперь отвечай на вопросы пользователя:` }]
        });

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: contents.slice(-10), // Последние 10 сообщений
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 500,
                    },
                    safetySettings: [
                        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
                        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
                        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
                        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
                    ],
                }),
            }
        );

        if (!response.ok) {
            const error = await response.json();
            console.error('Gemini Error:', error);
            return getFallbackResponse(messages[messages.length - 1].content);
        }

        const data = await response.json();

        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
            return data.candidates[0].content.parts[0].text;
        }

        return getFallbackResponse(messages[messages.length - 1].content);
    } catch (error) {
        console.error('Gemini API Error:', error);
        return getFallbackResponse(messages[messages.length - 1].content);
    }
}

// Fallback ответы если нет API ключа
function getFallbackResponse(msg: string): string {
    const m = msg.toLowerCase();

    if (m.includes('привет') || m.includes('здравств')) {
        return 'Привет! 👋 Я AI-помощник по кибербезопасности. Спрашивай о фишинге, защите данных или работе приложения!';
    }
    if (m.includes('фишинг') && (m.includes('что') || m.includes('это'))) {
        return '🎣 **Фишинг** — это кибератака, где мошенники маскируются под легитимные сайты чтобы украсть ваши данные (пароли, карты). Признаки: подозрительные ссылки, срочность, ошибки в тексте.';
    }
    if (m.includes('защит') || m.includes('безопасн')) {
        return '🛡️ **Советы по защите:**\n1. Проверяйте URL (https://)\n2. Не кликайте на подозрительные ссылки\n3. Используйте 2FA\n4. Проверяйте ссылки в нашем приложении!';
    }
    if (m.includes('работает') || m.includes('анализ') || m.includes('модел')) {
        return '🤖 PhishGuard использует XGBoost модель (94.5% точность) для анализа 20 признаков URL: длина, домен, HTTPS, энтропия, подозрительные слова и др. SHAP объясняет почему URL опасен.';
    }
    if (m.includes('спасибо') || m.includes('благодар')) {
        return 'Пожалуйста! 😊 Ваша безопасность — мой приоритет. Если есть вопросы — спрашивайте!';
    }

    return '🤔 Могу помочь с:\n• Что такое фишинг?\n• Как защититься?\n• Как работает анализ URL?\n\nЗадайте вопрос более конкретно!';
}

export function FloatingChatButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: 'Привет! 👋 Я AI-помощник PhishGuard.\n\nМогу ответить на вопросы о фишинге, кибербезопасности и работе приложения. Спрашивай!'
        }
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);

    useEffect(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
    }, [messages]);

    const sendMessage = async () => {
        if (!inputText.trim() || isLoading) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: inputText.trim()
        };

        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsLoading(true);

        try {
            const history = [...messages, userMsg].map(m => ({
                role: m.role,
                content: m.content,
            }));

            const response = await callGemini(history);

            setMessages(prev => [...prev, {
                id: `${Date.now()}-ai`,
                role: 'assistant',
                content: response
            }]);
        } catch (error) {
            setMessages(prev => [...prev, {
                id: `${Date.now()}-err`,
                role: 'assistant',
                content: '❌ Ошибка соединения. Попробуйте позже.'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const quickQuestions = [
        'Что такое фишинг?',
        'Как защититься?',
        'Как работает анализ?',
    ];

    const isApiConfigured = true; // Gemini API key is configured

    return (
        <>
            {/* Плавающая кнопка */}
            <TouchableOpacity
                style={styles.floatingButton}
                onPress={() => setIsOpen(true)}
                activeOpacity={0.9}
            >
                <LinearGradient
                    colors={[Colors.primary[500], Colors.primary[600]]}
                    style={styles.floatingButtonGradient}
                >
                    <Ionicons name="sparkles" size={26} color={Colors.text.primary} />
                </LinearGradient>
            </TouchableOpacity>

            {/* Модальное окно чата */}
            <Modal
                visible={isOpen}
                animationType="slide"
                transparent
                onRequestClose={() => setIsOpen(false)}
            >
                <View style={styles.modalOverlay}>
                    <Animated.View
                        entering={SlideInRight.duration(300)}
                        style={styles.chatContainer}
                    >
                        {/* Заголовок */}
                        <LinearGradient
                            colors={[Colors.primary[600], Colors.primary[700]]}
                            style={styles.chatHeader}
                        >
                            <View style={styles.chatHeaderContent}>
                                <View style={styles.aiIcon}>
                                    <Ionicons name="sparkles" size={20} color={Colors.primary[400]} />
                                </View>
                                <View style={styles.chatHeaderText}>
                                    <Text style={styles.chatTitle}>AI Помощник</Text>
                                    <Text style={styles.chatSubtitle}>
                                        {isApiConfigured ? 'Gemini 1.5 Flash' : 'Демо режим'}
                                    </Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={() => setIsOpen(false)} style={styles.closeButton}>
                                <Ionicons name="close" size={24} color={Colors.text.primary} />
                            </TouchableOpacity>
                        </LinearGradient>

                        {/* Сообщения */}
                        <ScrollView
                            ref={scrollViewRef}
                            style={styles.messagesContainer}
                            contentContainerStyle={styles.messagesContent}
                        >
                            {messages.map((msg) => (
                                <Animated.View
                                    key={msg.id}
                                    entering={FadeInUp.duration(200)}
                                    style={[
                                        styles.messageBubble,
                                        msg.role === 'user' ? styles.userBubble : styles.aiBubble
                                    ]}
                                >
                                    <Text style={[
                                        styles.messageText,
                                        msg.role === 'user' && styles.userText
                                    ]}>
                                        {msg.content}
                                    </Text>
                                </Animated.View>
                            ))}
                            {isLoading && (
                                <View style={[styles.messageBubble, styles.aiBubble, styles.loadingBubble]}>
                                    <ActivityIndicator size="small" color={Colors.primary[400]} />
                                    <Text style={styles.loadingText}>AI думает...</Text>
                                </View>
                            )}
                        </ScrollView>

                        {/* Быстрые вопросы */}
                        {messages.length <= 2 && (
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                style={styles.quickButtonsContainer}
                                contentContainerStyle={styles.quickButtons}
                            >
                                {quickQuestions.map((q, i) => (
                                    <TouchableOpacity
                                        key={i}
                                        style={styles.quickButton}
                                        onPress={() => {
                                            setInputText(q);
                                            setTimeout(sendMessage, 100);
                                        }}
                                    >
                                        <Text style={styles.quickButtonText}>{q}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        )}

                        {/* Ввод */}
                        <KeyboardAvoidingView
                            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                        >
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    value={inputText}
                                    onChangeText={setInputText}
                                    placeholder="Спросите что-нибудь..."
                                    placeholderTextColor={Colors.text.muted}
                                    onSubmitEditing={sendMessage}
                                    editable={!isLoading}
                                    multiline
                                />
                                <TouchableOpacity
                                    style={[
                                        styles.sendButton,
                                        (!inputText.trim() || isLoading) && styles.sendButtonDisabled
                                    ]}
                                    onPress={sendMessage}
                                    disabled={!inputText.trim() || isLoading}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator size="small" color={Colors.text.muted} />
                                    ) : (
                                        <Ionicons
                                            name="send"
                                            size={20}
                                            color={inputText.trim() ? '#fff' : Colors.text.muted}
                                        />
                                    )}
                                </TouchableOpacity>
                            </View>
                        </KeyboardAvoidingView>
                    </Animated.View>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    floatingButton: {
        position: 'absolute',
        bottom: 120,
        right: 16,
        zIndex: 1000,
        shadowColor: Colors.primary[500],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 8,
    },
    floatingButtonGradient: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    chatContainer: {
        height: SCREEN_HEIGHT * 0.8,
        backgroundColor: Colors.background.primary,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: 'hidden',
    },
    chatHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.md,
        paddingTop: Spacing.lg,
    },
    chatHeaderContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    aiIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    chatHeaderText: {
        marginLeft: Spacing.sm,
    },
    chatTitle: {
        ...Typography.bodyMedium,
        color: Colors.text.primary,
    },
    chatSubtitle: {
        ...Typography.caption,
        color: Colors.text.secondary,
    },
    closeButton: {
        padding: Spacing.sm,
    },
    messagesContainer: {
        flex: 1,
    },
    messagesContent: {
        padding: Spacing.md,
        paddingBottom: Spacing.xl,
    },
    messageBubble: {
        maxWidth: '85%',
        padding: Spacing.md,
        borderRadius: 16,
        marginBottom: Spacing.sm,
    },
    userBubble: {
        backgroundColor: Colors.primary[500],
        alignSelf: 'flex-end',
        borderBottomRightRadius: 4,
    },
    aiBubble: {
        backgroundColor: Colors.background.secondary,
        alignSelf: 'flex-start',
        borderBottomLeftRadius: 4,
    },
    messageText: {
        ...Typography.body,
        color: Colors.text.primary,
        lineHeight: 22,
    },
    userText: {
        color: '#fff',
    },
    loadingBubble: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    loadingText: {
        ...Typography.small,
        color: Colors.text.muted,
    },
    quickButtonsContainer: {
        maxHeight: 50,
    },
    quickButtons: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        gap: 8,
        flexDirection: 'row',
    },
    quickButton: {
        backgroundColor: Colors.primary[500] + '20',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.primary[500] + '40',
    },
    quickButtonText: {
        ...Typography.small,
        color: Colors.primary[400],
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: Spacing.md,
        borderTopWidth: 1,
        borderTopColor: Colors.border.default,
        backgroundColor: Colors.background.secondary,
    },
    input: {
        flex: 1,
        backgroundColor: Colors.background.tertiary,
        borderRadius: 20,
        paddingHorizontal: Spacing.md,
        paddingVertical: 10,
        ...Typography.body,
        color: Colors.text.primary,
        maxHeight: 100,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.primary[500],
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: Spacing.sm,
    },
    sendButtonDisabled: {
        backgroundColor: Colors.background.tertiary,
    },
});
