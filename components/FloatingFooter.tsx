import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface FloatingFooterProps {
    activeTab: 'home' | 'your-cars' | 'appointment' | 'management';
}

export const FloatingFooter: React.FC<FloatingFooterProps> = ({ activeTab }) => {
    const insets = useSafeAreaInsets();

    const renderIcon = (tab: FloatingFooterProps['activeTab'], source: any) => {
        const isActive = activeTab === tab;
        const icon = (
            <Image
                source={source}
                style={[styles.icon, { tintColor: isActive ? '#FFF' : '#666' }]}
                resizeMode="contain"
            />
        );

        if (isActive) {
            return (
                <LinearGradient
                    colors={['#3B6CF2', '#5D5FEF', '#7B4DFF']}
                    locations={[0, 0.5, 1]}
                    style={styles.activeIconContainer}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    {icon}
                </LinearGradient>
            );
        }

        return <View style={styles.iconContainer}>{icon}</View>;
    };

    return (
        <View style={[styles.footer, { bottom: 20 + insets.bottom }]}>
            <TouchableOpacity
                style={styles.footerItem}
                onPress={() => router.push('/')}
            >
                {renderIcon('home', require('../assets/images/material-symbols_home-outline-rounded.png'))}
                <Text style={[styles.footerText, activeTab === 'home' && styles.activeFooterText]}>Home</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.footerItem}
                onPress={() => router.push('/your-cars')}
            >
                {renderIcon('your-cars', require('../assets/images/car_icon.png'))}
                <Text style={[styles.footerText, activeTab === 'your-cars' && styles.activeFooterText]}>Your Car</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.footerItem}
                onPress={() => router.push('/schedule-appointment')}
            >
                {renderIcon('appointment', require('../assets/images/mdi_calendar-outline.png'))}
                <Text style={[styles.footerText, activeTab === 'appointment' && styles.activeFooterText]}>Appointment</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.footerItem}
                onPress={() => router.push('/management')}
            >
                {renderIcon('management', require('../assets/images/material-symbols_settings-outline-rounded.png'))}
                <Text style={[styles.footerText, activeTab === 'management' && styles.activeFooterText]}>Management</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    footer: {
        position: 'absolute',
        left: '50%',
        marginLeft: -172, // -344/2 to center horizontally
        width: 344,
        height: 70,
        backgroundColor: '#161B2B',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#262B3B',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingHorizontal: 10,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    footerItem: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 48,
        height: 45,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 2,
    },
    activeIconContainer: {
        width: 48,
        height: 45,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 2,
    },
    icon: {
        width: 24,
        height: 24,
    },
    footerText: {
        fontFamily: 'Cairo',
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 10,
        textAlign: 'center'
    },
    activeFooterText: {
        fontFamily: 'CairoMedium',
        color: '#FFF',
    }
});
