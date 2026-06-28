import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ExpoLocation from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BACKEND_URL } from '../constants/config';

interface Props {
    visible: boolean;
    onCancel: () => void;
    alertId: string | null;
}

const DASHBOARD_API = 'http://10.12.75.198:3001/api/accidents';

export default function EmergencyCountdownModal({ visible, onCancel, alertId }: Props) {
    const [countdown, setCountdown] = useState(10);
    const progress = useRef(new Animated.Value(1)).current;
    const realtimeInterval = useRef<any>(null);
    const locationPermission = useRef(false);

    // Request location permission once
    useEffect(() => {
        (async () => {
            const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
            locationPermission.current = status === 'granted';
            console.log('[EmergencyModal] Location permission:', status);
        })();
    }, []);

    // Reset & animate when modal becomes visible
    useEffect(() => {
        if (visible) {
            console.log('[EmergencyModal] Modal opened. alertId:', alertId);
            setCountdown(10);
            progress.setValue(1);
            Animated.timing(progress, {
                toValue: 0,
                duration: 10000,
                useNativeDriver: false,
            }).start();
        } else {
            // Stop real-time updates when modal closes
            if (realtimeInterval.current) {
                clearInterval(realtimeInterval.current);
                realtimeInterval.current = null;
            }
        }
    }, [visible]);

    // Timer & Auto-confirm
    useEffect(() => {
        if (!visible) return;
        if (countdown <= 0) {
            console.log('[EmergencyModal] Countdown expired. Auto-confirming...');
            sendEmergencyData('confirmed');
            return;
        }
        const t = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(t);
    }, [countdown, visible]);

    const getLocationData = async () => {
        // Fallback data for testing if real GPS fails
        const fallbackValue = {
            coords: { latitude: -1.9705, longitude: 30.1044, accuracy: 10 },
            locationName: 'Kicukiro',
            address: 'KK 15 Rd, Kicukiro'
        };

        if (!locationPermission.current) return fallbackValue;

        try {
            // Use Highest accuracy for precise location
            const loc = await ExpoLocation.getCurrentPositionAsync({
                accuracy: ExpoLocation.Accuracy.Highest,
            });
            const coords = loc.coords;

            // Reverse geocode to get human-readable address
            let locationName = 'Unknown';
            let address = 'Unknown';
            try {
                const places = await ExpoLocation.reverseGeocodeAsync({
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                });
                if (places.length > 0) {
                    const place = places[0];
                    // Pick the most specific name available
                    locationName = place.name || place.district || place.city || place.subregion || 'Unknown';

                    // Build a precise address string
                    const parts = [
                        place.name,
                        place.streetNumber,
                        place.street,
                        place.district,
                        place.city
                    ].filter((v, i, a) => v && a.indexOf(v) === i); // Filter out empty and duplicates

                    address = parts.join(', ') || locationName;
                }
            } catch (geoErr: any) {
                console.warn('[EmergencyModal] Reverse geocode failed:', geoErr.message);
            }

            // Fallback only if both failed completely
            if (locationName === 'Unknown' && address === 'Unknown' &&
                coords.latitude === -1.9705) { // Only fallback if we are already using a mock-like coord
                locationName = 'Kicukiro';
                address = 'KK 15 Rd, Kicukiro';
            }

            return { coords, locationName, address };
        } catch (e: any) {
            console.warn('[EmergencyModal] GPS failed, using fallback:', e.message);
            return fallbackValue;
        }
    };

    const sendEmergencyData = async (type: 'realtime' | 'confirmed') => {
        if (!alertId) return;
        const locationData = await getLocationData();
        const now = new Date();

        // Format time as HH:MM
        const timeFormatted = now.toTimeString().slice(0, 5);
        const isoTimestamp = now.toISOString();

        const lat = locationData?.coords.latitude ?? null;
        const lng = locationData?.coords.longitude ?? null;
        const coordsString = lat !== null && lng !== null
            ? `${lat.toFixed(6)}, ${lng.toFixed(6)}`
            : 'Unknown';

        // Exact payload the dashboard API expects
        const dashboardPayload = {
            time: timeFormatted,
            location: locationData?.locationName ?? 'Unknown',
            coordinates: coordsString,
            address: locationData?.address ?? 'Unknown',
        };

        if (type === 'confirmed') {
            console.log('[EmergencyModal] Sending to dashboard:', JSON.stringify(dashboardPayload));

            // 1. Send directly to dashboard API
            fetch(DASHBOARD_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dashboardPayload),
            })
                .then(r => console.log('[EmergencyModal] Dashboard response:', r.status))
                .catch(e => console.error('[EmergencyModal] Dashboard error:', e.message));
        }

        // 2. Also send to your own backend for DB logging and server-side forwarding
        const backendPayload = {
            locationLat: lat,
            locationLng: lng,
            locationAccuracy: locationData?.coords.accuracy ?? null,
            timestamp: isoTimestamp,
            address: locationData?.address ?? 'Unknown',
            locationCity: locationData?.locationName ?? 'Unknown'
        };
        const endpoint = type === 'confirmed'
            ? `${BACKEND_URL}/api/emergency/confirm/${alertId}`
            : `${BACKEND_URL}/api/emergency/update/${alertId}`;

        fetch(endpoint, {
            method: type === 'confirmed' ? 'PATCH' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(backendPayload),
        })
            .then(r => console.log(`[EmergencyModal] Backend (${type}) response:`, r.status))
            .catch(e => console.error('[EmergencyModal] Backend error:', e.message))
            .finally(() => {
                if (type === 'confirmed') onCancel();
            });
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
    container: { flex: 1 },
    gradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    content: { width: '90%', alignItems: 'center' },
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
