import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors } from '../../constants/Colors';
import { Typography, Spacing, BorderRadius } from '../../constants/Typography';
import { Card } from '../../components/ui/Card';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

// База знаний о фишинге для AI ответов
const PHISHING_KNOWLEDGE = {
    greetings: [
        'Привет! Я AI-помощник по кибербезопасности 🛡️ Чем могу помочь?',
        'Здравствуйте! Готов ответить на вопросы о фишинге и безопасности.',
    ],
    what_is_phishing: `**Фишинг** — это вид кибератаки, при которой злоумышленники пытаются получить конфиденциальные данные (пароли, данные карт), маскируясь под легитимные источники.

**Признаки фишинга:**
• Срочность и угрозы («Ваш аккаунт заблокирован!»)
• Подозрительные ссылки (http вместо https)
• Ошибки в тексте и дизайне
• Запрос личных данных
• Неизвестный отправитель`,

    how_to_protect: `**Как защититься от фишинга:**

1. **Проверяйте URL** — убедитесь что адрес начинается с https://
2. **Не переходите по подозрительным ссылкам** — лучше введите адрес вручную
3. **Используйте 2FA** — двухфакторную аутентификацию
4. **Обновляйте ПО** — используйте актуальные версии браузеров
5. **Используйте наше приложение** — проверяйте ссылки перед переходом!`,

    url_analysis: `**Как работает анализ URL:**

Наше приложение использует **машинное обучение** для анализа URL:

1. **Извлечение признаков** — длина URL, домен, HTTPS, спецсимволы
2. **ML классификация** — XGBoost модель с точностью 95%+
3. **SHAP объяснение** — показываем почему URL опасен

**Признаки фишинговых URL:**
• Длинные и запутанные адреса
• IP вместо домена
• Подозрительные слова (login, verify, secure)
• Отсутствие HTTPS`,

    about_app: `**О приложении PhishGuard:**

📱 Мобильное приложение для обнаружения фишинговых атак

**Возможности:**
• Проверка URL на фишинг
• Анализ SMS и email сообщений
• Объяснение решений (SHAP)
• История проверок

**Технологии:**
• React Native + Expo
• FastAPI (Python)
• XGBoost, Random Forest
• SHAP для объяснимости

Разработано как дипломный проект.`,

    examples: `**Примеры фишинговых URL:**

❌ http://secure-bank-login.xyz/verify
❌ http://192.168.1.1/paypal/login
❌ http://amaz0n-verify.com/account

**Примеры безопасных URL:**

✅ https://google.com
✅ https://amazon.com
✅ https://bank.ru/personal`,
};

function generateAIResponse(userMessage: string): string {
    const msg = userMessage.toLowerCase();

    // Приветствия
    if (msg.includes('привет') || msg.includes('здравствуй') || msg.includes('хай') || msg.includes('hello')) {
        return PHISHING_KNOWLEDGE.greetings[Math.floor(Math.random() * PHISHING_KNOWLEDGE.greetings.length)];
    }

    // Что такое фишинг
    if (msg.includes('что такое фишинг') || msg.includes('фишинг это') || msg.includes('что такое phishing')) {
        return PHISHING_KNOWLEDGE.what_is_phishing;
    }

    // Как защититься
    if (msg.includes('защит') || msg.includes('безопасн') || msg.includes('как не попасть') || msg.includes('как избежать')) {
        return PHISHING_KNOWLEDGE.how_to_protect;
    }

    // Анализ URL
    if (msg.includes('url') || msg.includes('ссылк') || msg.includes('как работает') || msg.includes('анализ')) {
        return PHISHING_KNOWLEDGE.url_analysis;
    }

    // О приложении
    if (msg.includes('о приложении') || msg.includes('что умеет') || msg.includes('возможности') || msg.includes('функции')) {
        return PHISHING_KNOWLEDGE.about_app;
    }

    // Примеры
    if (msg.includes('пример') || msg.includes('покажи') || msg.includes('образец')) {
        return PHISHING_KNOWLEDGE.examples;
    }

    // Спасибо
    if (msg.includes('спасибо') || msg.includes('благодар') || msg.includes('thanks')) {
        return 'Пожалуйста! Если есть ещё вопросы — спрашивайте. Ваша безопасность — наш приоритет! 🛡️';
    }

    // По умолчанию
    return `Я могу помочь вам с вопросами о:

• **Что такое фишинг?** — объясню суть атак
• **Как защититься?** — советы по безопасности
• **Как работает анализ URL?** — про ML модели
• **Примеры** — покажу фишинговые URL
• **О приложении** — возможности PhishGuard

Просто напишите свой вопрос! 💬`;
}

export default function ChatbotScreen() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: 'Привет! 👋 Я AI-помощник по кибербезопасности.\n\nМогу ответить на вопросы о фишинге, помочь разобраться в результатах проверки и дать советы по безопасности.\n\nО чём хотите узнать?',
            timestamp: new Date(),
        }
    ]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);

    const sendMessage = () => {
        if (!inputText.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: inputText.trim(),
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setIsTyping(true);

        // Имитация задержки AI ответа
        setTimeout(() => {
            const aiResponse = generateAIResponse(userMessage.content);
            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: aiResponse,
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, assistantMessage]);
            setIsTyping(false);
        }, 800 + Math.random() * 500);
    };

    useEffect(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
    }, [messages]);

    const quickQuestions = [
        'Что такое фишинг?',
        'Как защититься?',
        'Примеры URL',
    ];

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={90}
        >
            {/* Заголовок */}
            <View style={styles.header}>
                <LinearGradient
                    colors={[Colors.primary[600], Colors.primary[700]]}
                    style={styles.headerGradient}
                >
                    <View style={styles.headerContent}>
                        <Ionicons name="chatbubbles" size={28} color={Colors.text.primary} />
                        <View style={styles.headerText}>
                            <Text style={styles.headerTitle}>AI Помощник</Text>
                            <Text style={styles.headerSubtitle}>Эксперт по кибербезопасности</Text>
                        </View>
                    </View>
                </LinearGradient>
            </View>

            {/* Сообщения */}
            <ScrollView
                ref={scrollViewRef}
                style={styles.messagesContainer}
                contentContainerStyle={styles.messagesContent}
                showsVerticalScrollIndicator={false}
            >
                {messages.map((message, index) => (
                    <Animated.View
                        key={message.id}
                        entering={FadeInUp.duration(300)}
                        style={[
                            styles.messageWrapper,
                            message.role === 'user' ? styles.userWrapper : styles.assistantWrapper,
                        ]}
                    >
                        {message.role === 'assistant' && (
                            <View style={styles.avatarContainer}>
                                <Ionicons name="shield-checkmark" size={20} color={Colors.primary[400]} />
                            </View>
                        )}
                        <View style={[
                            styles.messageBubble,
                            message.role === 'user' ? styles.userBubble : styles.assistantBubble,
                        ]}>
                            <Text style={[
                                styles.messageText,
                                message.role === 'user' && styles.userText,
                            ]}>
                                {message.content}
                            </Text>
                        </View>
                    </Animated.View>
                ))}

                {isTyping && (
                    <Animated.View
                        entering={FadeInUp.duration(200)}
                        style={[styles.messageWrapper, styles.assistantWrapper]}
                    >
                        <View style={styles.avatarContainer}>
                            <Ionicons name="shield-checkmark" size={20} color={Colors.primary[400]} />
                        </View>
                        <View style={[styles.messageBubble, styles.assistantBubble, styles.typingBubble]}>
                            <Text style={styles.typingText}>Печатает...</Text>
                        </View>
                    </Animated.View>
                )}
            </ScrollView>

            {/* Быстрые вопросы */}
            {messages.length <= 2 && (
                <View style={styles.quickQuestionsContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {quickQuestions.map((question, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.quickQuestion}
                                onPress={() => {
                                    setInputText(question);
                                    setTimeout(sendMessage, 100);
                                }}
                            >
                                <Text style={styles.quickQuestionText}>{question}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* Поле ввода */}
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder="Задайте вопрос..."
                    placeholderTextColor={Colors.text.muted}
                    multiline
                    maxLength={500}
                    onSubmitEditing={sendMessage}
                />
                <TouchableOpacity
                    style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
                    onPress={sendMessage}
                    disabled={!inputText.trim()}
                >
                    <Ionicons
                        name="send"
                        size={22}
                        color={inputText.trim() ? Colors.text.primary : Colors.text.muted}
                    />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background.primary,
    },
    header: {
        overflow: 'hidden',
    },
    headerGradient: {
        paddingTop: Spacing.xl,
        paddingBottom: Spacing.md,
        paddingHorizontal: Spacing.md,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerText: {
        marginLeft: Spacing.md,
    },
    headerTitle: {
        ...Typography.h3,
        color: Colors.text.primary,
    },
    headerSubtitle: {
        ...Typography.caption,
        color: Colors.text.secondary,
    },
    messagesContainer: {
        flex: 1,
    },
    messagesContent: {
        padding: Spacing.md,
        paddingBottom: Spacing.lg,
    },
    messageWrapper: {
        flexDirection: 'row',
        marginBottom: Spacing.md,
        alignItems: 'flex-end',
    },
    userWrapper: {
        justifyContent: 'flex-end',
    },
    assistantWrapper: {
        justifyContent: 'flex-start',
    },
    avatarContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Colors.primary[500] + '30',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.sm,
    },
    messageBubble: {
        maxWidth: '75%',
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
    },
    userBubble: {
        backgroundColor: Colors.primary[500],
        borderBottomRightRadius: BorderRadius.sm,
    },
    assistantBubble: {
        backgroundColor: Colors.background.secondary,
        borderBottomLeftRadius: BorderRadius.sm,
    },
    messageText: {
        ...Typography.body,
        color: Colors.text.primary,
        lineHeight: 22,
    },
    userText: {
        color: Colors.text.primary,
    },
    typingBubble: {
        paddingVertical: Spacing.sm,
    },
    typingText: {
        ...Typography.small,
        color: Colors.text.muted,
        fontStyle: 'italic',
    },
    quickQuestionsContainer: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderTopWidth: 1,
        borderTopColor: Colors.border.subtle,
    },
    quickQuestion: {
        backgroundColor: Colors.primary[500] + '20',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.full,
        marginRight: Spacing.sm,
    },
    quickQuestionText: {
        ...Typography.small,
        color: Colors.primary[400],
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: Spacing.md,
        paddingBottom: Spacing.lg,
        backgroundColor: Colors.background.secondary,
        borderTopWidth: 1,
        borderTopColor: Colors.border.default,
    },
    input: {
        flex: 1,
        backgroundColor: Colors.background.tertiary,
        borderRadius: BorderRadius.lg,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        paddingTop: Spacing.sm,
        ...Typography.body,
        color: Colors.text.primary,
        maxHeight: 100,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.primary[500],
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: Spacing.sm,
    },
    sendButtonDisabled: {
        backgroundColor: Colors.background.tertiary,
    },
});
