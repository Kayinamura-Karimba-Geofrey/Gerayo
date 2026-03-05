import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ExpoLocation from 'expo-location';
import React, { useEffect, useState } from 'react';
import { Animated, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
    visible: boolean;
    onCancel: () => void;
    alertId: string | null;
}

export default function EmergencyCountdownModal({ visible, onCancel, alertId }: Props) {
    const [countdown, setCountdown] = useState(10);
    const [progress] = useState(new Animated.Value(1));

    useEffect(() => {
        let interval: any;
        if (visible && countdown > 0) {
            console.log('[EmergencyModal] Starting countdown at:', countdown);
            interval = setInterval(() => {
                setCountdown(prev => {
                    const nextValue = prev - 1;
                    console.log('[EmergencyModal] Tick:', nextValue);
                    return nextValue;
                });
            }, 1000);
        } else if (countdown === 0 && visible) {
            console.log('[EmergencyModal] Countdown finished, triggering report...');
            sendToDashboard();
        }

        return () => {
            if (interval) {
                console.log('[EmergencyModal] Clearing interval');
                clearInterval(interval);
            }
        };
    }, [visible, countdown]);

    useEffect(() => {
        if (visible) {
            console.log('[EmergencyModal] Modal became visible. Resetting timer.');
            setCountdown(10);
            progress.setValue(1);
            Animated.timing(progress, {
                toValue: 0,
                duration: 10000,
                useNativeDriver: false,
            }).start();
            requestLocationPermission();
        }
    }, [visible]);

    const requestLocationPermission = async () => {
        try {
            console.log('[EmergencyModal] Requesting location permissions...');
            const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.warn('[EmergencyModal] Permission to access location was denied');
                return;
            }
            console.log('[EmergencyModal] Location permission granted');
        } catch (error) {
            console.error('[EmergencyModal] Error requesting location permission:', error);
        }
    };

    const sendToDashboard = async () => {
        try {
            console.log('[EmergencyModal] Sending accident confirmation to backend...');

            let location = null;
            try {
                location = await ExpoLocation.getCurrentPositionAsync({
                    accuracy: ExpoLocation.Accuracy.High
                });
                console.log('[EmergencyModal] Current location captured:', location?.coords);
            } catch (e: any) {
                console.error('[EmergencyModal] Error getting current location:', e.message);
            }

            const response = await fetch(`http://localhost:3000/api/emergency/confirm/${alertId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    locationLat: location?.coords.latitude || null,
                    locationLng: location?.coords.longitude || null,
                    locationAccuracy: location?.coords.accuracy || null,
                    timestamp: new Date().toISOString()
                }),
            });

            if (response.ok) {
                console.log('[EmergencyModal] Successfully sent confirmed alert to backend');
            } else {
                const errText = await response.text();
                console.error('[EmergencyModal] Failed to send to backend:', errText);
            }
        } catch (error: any) {
            console.error('[EmergencyModal] Error sending to dashboard:', error.message);
        } finally {
            onCancel();
        }
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.container}>
                <LinearGradient
                    colors={['#8B0000', '#1C1C3F']}
                    style={styles.gradient}
                >
                    <View style={styles.content}>
                        <Ionicons name="warning" size={120} color="#FFD700" />
                        <Text style={styles.title}>ACCIDENT DETECTED</Text>

                        <Text style={styles.subtitle}>Sending alert in:</Text>

                        <View style={styles.timerContainer}>
                            <View style={styles.timerCircle}>
                                <Text style={styles.countdownText}>{countdown}</Text>
                            </View>
                        </View>

                        <Text style={styles.disclaimer}>
                            Emergencies will be alerted of your location if you don't cancel
                        </Text>

                        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
                            <Text style={styles.cancelButtonText}>CANCEL ALERT</Text>
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        width: '90%',
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        color: '#FF4444',
        fontWeight: 'bold',
        marginTop: 20,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 18,
        color: '#FFFFFF',
        marginTop: 40,
        opacity: 0.8,
    },
    timerContainer: {
        marginVertical: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    timerCircle: {
        width: 150,
        height: 150,
        borderRadius: 75,
        borderWidth: 8,
        borderColor: '#A52A2A',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    countdownText: {
        fontSize: 64,
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    disclaimer: {
        color: '#FFFFFF',
        textAlign: 'center',
        paddingHorizontal: 30,
        opacity: 0.7,
        marginBottom: 40,
        lineHeight: 22,
    },
    cancelButton: {
        backgroundColor: '#FFA500',
        paddingVertical: 20,
        paddingHorizontal: 60,
        borderRadius: 12,
        width: '100%',
    },
    cancelButtonText: {
        color: '#000000',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});
