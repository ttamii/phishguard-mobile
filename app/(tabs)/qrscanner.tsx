import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Vibration,
    Alert
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '../../constants/Colors';
import { Typography, Spacing, BorderRadius } from '../../constants/Typography';
import { Button } from '../../components/ui/Button';
import { useScanStore } from '../../store/scanStore';

const { width, height } = Dimensions.get('window');
const SCAN_AREA_SIZE = width * 0.7;

export default function QRScannerScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [scannedUrl, setScannedUrl] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const { scanURL } = useScanStore();
    const insets = useSafeAreaInsets();

    const isValidUrl = (text: string): boolean => {
        try {
            // Проверяем что это URL
            if (text.startsWith('http://') || text.startsWith('https://')) {
                new URL(text);
                return true;
            }
            // Может быть домен без протокола
            if (text.includes('.') && !text.includes(' ')) {
                new URL(`https://${text}`);
                return true;
            }
            return false;
        } catch {
            return false;
        }
    };

    const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
        if (scanned) return;

        setScanned(true);
        Vibration.vibrate(100); // Тактильная обратная связь

        if (isValidUrl(data)) {
            setScannedUrl(data);
        } else {
            Alert.alert(
                'Не URL',
                `QR-код содержит: "${data.slice(0, 100)}..."\n\nЭто не похоже на ссылку.`,
                [
                    { text: 'Сканировать ещё', onPress: () => setScanned(false) }
                ]
            );
        }
    };

    const handleAnalyze = async () => {
        if (!scannedUrl) return;

        setIsAnalyzing(true);

        try {
            const result = await scanURL(scannedUrl);
            if (result) {
                router.push(`/result/${result.scanId}`);
            }
        } catch (error) {
            Alert.alert('Ошибка', 'Не удалось проанализировать URL');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleScanAgain = () => {
        setScanned(false);
        setScannedUrl(null);
    };

    // Запрос разрешений
    if (!permission) {
        return (
            <View style={[styles.container, styles.centered]}>
                <Text style={styles.permissionText}>Загрузка камеры...</Text>
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
                <Animated.View entering={FadeInDown.duration(600)} style={styles.permissionContainer}>
                    <View style={styles.permissionIcon}>
                        <Ionicons name="camera-outline" size={60} color={Colors.primary[400]} />
                    </View>
                    <Text style={styles.permissionTitle}>Доступ к камере</Text>
                    <Text style={styles.permissionDesc}>
                        Чтобы сканировать QR-коды, нужен доступ к камере
                    </Text>
                    <Button
                        title="Разрешить камеру"
                        onPress={requestPermission}
                        fullWidth
                        style={{ marginTop: Spacing.lg }}
                        icon={<Ionicons name="camera" size={20} color={Colors.text.primary} />}
                    />
                </Animated.View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Камера */}
            <CameraView
                style={StyleSheet.absoluteFillObject}
                barcodeScannerSettings={{
                    barcodeTypes: ['qr', 'aztec', 'datamatrix'],
                }}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            />

            {/* Затемнение вокруг области сканирования */}
            <View style={styles.overlay}>
                <View style={[styles.overlayRow, { height: (height - SCAN_AREA_SIZE) / 2 - 50 }]} />

                <View style={styles.scanRow}>
                    <View style={styles.overlaySide} />
                    <Animated.View
                        entering={ZoomIn.duration(500)}
                        style={styles.scanArea}
                    >
                        {/* Уголки */}
                        <View style={[styles.corner, styles.topLeft]} />
                        <View style={[styles.corner, styles.topRight]} />
                        <View style={[styles.corner, styles.bottomLeft]} />
                        <View style={[styles.corner, styles.bottomRight]} />

                        {/* Анимированная линия сканирования */}
                        {!scanned && (
                            <Animated.View
                                entering={FadeIn.duration(300)}
                                style={styles.scanLine}
                            />
                        )}
                    </Animated.View>
                    <View style={styles.overlaySide} />
                </View>

                <View style={[styles.overlayRow, { flex: 1 }]} />
            </View>

            {/* Хедер */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>QR Сканер</Text>
                <View style={styles.placeholder} />
            </View>

            {/* Инструкция или результат */}
            <View style={[styles.bottomPanel, { paddingBottom: insets.bottom + 20 }]}>
                {!scanned ? (
                    <Animated.View entering={FadeInDown.duration(400)} style={styles.instructionContainer}>
                        <View style={styles.instructionIcon}>
                            <Ionicons name="qr-code" size={32} color={Colors.primary[400]} />
                        </View>
                        <Text style={styles.instructionTitle}>Наведите на QR-код</Text>
                        <Text style={styles.instructionDesc}>
                            Отсканируйте QR-код с подозрительной ссылкой для проверки на фишинг
                        </Text>
                    </Animated.View>
                ) : scannedUrl ? (
                    <Animated.View entering={FadeInDown.duration(400)} style={styles.resultContainer}>
                        <View style={styles.resultHeader}>
                            <Ionicons name="checkmark-circle" size={28} color={Colors.status.safe} />
                            <Text style={styles.resultTitle}>URL обнаружен!</Text>
                        </View>

                        <View style={styles.urlBox}>
                            <Text style={styles.urlText} numberOfLines={2}>
                                {scannedUrl}
                            </Text>
                        </View>

                        <View style={styles.buttonRow}>
                            <Button
                                title="Сканировать ещё"
                                variant="secondary"
                                onPress={handleScanAgain}
                                style={{ flex: 1 }}
                                icon={<Ionicons name="scan" size={18} color={Colors.text.primary} />}
                            />
                            <View style={{ width: Spacing.md }} />
                            <Button
                                title="Проверить"
                                onPress={handleAnalyze}
                                loading={isAnalyzing}
                                style={{ flex: 1 }}
                                icon={<Ionicons name="shield-checkmark" size={18} color={Colors.text.primary} />}
                            />
                        </View>
                    </Animated.View>
                ) : null}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
    },

    // Permissions
    permissionContainer: {
        alignItems: 'center',
        padding: Spacing.xl,
    },
    permissionIcon: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Colors.primary[500] + '20',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.lg,
    },
    permissionTitle: {
        ...Typography.h3,
        color: Colors.text.primary,
        marginBottom: Spacing.sm,
    },
    permissionDesc: {
        ...Typography.body,
        color: Colors.text.secondary,
        textAlign: 'center',
    },
    permissionText: {
        ...Typography.body,
        color: Colors.text.secondary,
    },

    // Overlay
    overlay: {
        ...StyleSheet.absoluteFillObject,
    },
    overlayRow: {
        backgroundColor: 'rgba(0,0,0,0.6)',
        width: '100%',
    },
    scanRow: {
        flexDirection: 'row',
        height: SCAN_AREA_SIZE,
    },
    overlaySide: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    scanArea: {
        width: SCAN_AREA_SIZE,
        height: SCAN_AREA_SIZE,
        position: 'relative',
    },

    // Corners
    corner: {
        position: 'absolute',
        width: 30,
        height: 30,
        borderColor: Colors.primary[400],
    },
    topLeft: {
        top: 0,
        left: 0,
        borderTopWidth: 4,
        borderLeftWidth: 4,
        borderTopLeftRadius: 8,
    },
    topRight: {
        top: 0,
        right: 0,
        borderTopWidth: 4,
        borderRightWidth: 4,
        borderTopRightRadius: 8,
    },
    bottomLeft: {
        bottom: 0,
        left: 0,
        borderBottomWidth: 4,
        borderLeftWidth: 4,
        borderBottomLeftRadius: 8,
    },
    bottomRight: {
        bottom: 0,
        right: 0,
        borderBottomWidth: 4,
        borderRightWidth: 4,
        borderBottomRightRadius: 8,
    },

    // Scan line
    scanLine: {
        position: 'absolute',
        top: '45%',
        left: 10,
        right: 10,
        height: 2,
        backgroundColor: Colors.primary[400],
        shadowColor: Colors.primary[400],
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 10,
    },

    // Header
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
        paddingBottom: Spacing.md,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        ...Typography.h4,
        color: '#fff',
    },
    placeholder: {
        width: 44,
    },

    // Bottom Panel
    bottomPanel: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: Colors.background.primary,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: Spacing.lg,
    },

    // Instruction
    instructionContainer: {
        alignItems: 'center',
    },
    instructionIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: Colors.primary[500] + '20',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.md,
    },
    instructionTitle: {
        ...Typography.h4,
        color: Colors.text.primary,
        marginBottom: Spacing.xs,
    },
    instructionDesc: {
        ...Typography.body,
        color: Colors.text.secondary,
        textAlign: 'center',
    },

    // Result
    resultContainer: {
        gap: Spacing.md,
    },
    resultHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    resultTitle: {
        ...Typography.h4,
        color: Colors.text.primary,
    },
    urlBox: {
        backgroundColor: Colors.background.secondary,
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.border.default,
    },
    urlText: {
        ...Typography.mono,
        color: Colors.primary[400],
        fontSize: 14,
    },
    buttonRow: {
        flexDirection: 'row',
        marginTop: Spacing.sm,
    },
});
