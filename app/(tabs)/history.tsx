import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';

const BACKEND_URL = 'http://localhost:3000';
const DEVICE_ID = 1; // Assuming the user's main device ID

export default function HistoryScreen() {
    const { token } = useAuth();
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) {
            setLoading(false);
            return;
        }
        fetch(`${BACKEND_URL}/api/sensors/history/${DEVICE_ID}`, {
            headers: { 'x-auth-token': token }
        })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setHistory(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [token]);

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <Text style={styles.title}>Historical Data</Text>

            {loading ? (
                <ActivityIndicator size="large" color="#fff" style={{ marginTop: 20 }} />
            ) : history.length > 0 ? (
                <View style={styles.chartPlaceholder}>
                    <Text style={styles.chartText}>Line Chart Here mapping {history.length} points</Text>
                    {/* In a real environment with react-native-chart-kit installed: */}
                    {/* <LineChart data={...} width={...} height={...} chartConfig={...} /> */}
                </View>
            ) : (
                <Text style={styles.noData}>No historical data available.</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#050511',
        paddingTop: 60,
        paddingHorizontal: 20
    },
    title: {
        fontFamily: 'CairoBold',
        fontSize: 24,
        color: '#FFF',
        marginBottom: 20
    },
    chartPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#131722',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#2D5EFF',
        maxHeight: 250
    },
    chartText: {
        color: '#FFF',
        fontFamily: 'CairoMedium'
    },
    noData: {
        color: '#FFF',
        fontFamily: 'Cairo',
        opacity: 0.6
    }
});
