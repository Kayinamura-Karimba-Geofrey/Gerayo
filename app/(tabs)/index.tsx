import { FloatingFooter } from '@/components/FloatingFooter';
import { useAuth } from '@/context/AuthContext';
import { useIoTData } from '@/hooks/useIoTData';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const BACKEND_URL = 'http://localhost:3000';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { data: sensorData, isConnected } = useIoTData();
  const { token, user } = useAuth();

  const [alerts, setAlerts] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);

  useEffect(() => {
    if (token) {
      fetch(`${BACKEND_URL}/api/alerts`, { headers: { 'x-auth-token': token } })
        .then(res => res.json())
        .then(data => Array.isArray(data) ? setAlerts(data) : null)
        .catch(console.error);

      fetch(`${BACKEND_URL}/api/vehicles/inspections`, { headers: { 'x-auth-token': token } })
        .then(res => res.json())
        .then(data => Array.isArray(data) ? setVehicles(data) : null)
        .catch(console.error);
    }
  }, [token]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Main Content */}
      <ScrollView
        contentContainerStyle={[styles.contentContainer, { paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
      >

        {/* Header Icons Container - 30px from top */}
        <View style={[styles.headerIconsContainer, { top: 30 }]}>
          <View style={styles.headerIcons}>
            <View style={styles.notificationBadge}>
              <Image source={require('../../assets/images/notification_icon.png')} style={{ width: 30, height: 30 }} resizeMode="contain" />
              <View style={styles.badge}><Text style={styles.badgeText}>3</Text></View>
            </View>
            <Image
              source={require('../../assets/images/user_icon.png')}
              style={styles.profileImage}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Header Section - Title at 35px from top */}
        <View style={[styles.headerContainer, { marginTop: 35 }]}>
          <View style={styles.headerTexts}>
            <Text style={styles.welcomeText}>Welcome back, {user?.name || 'User'}</Text>
            <Text style={styles.appTitle}>Car Portal</Text>
          </View>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Image
            source={require('../../assets/images/hero-car 1.png')}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroOverlay}>
            <Text style={styles.gerayoText}>Gerayo</Text>
            <Text style={styles.heroSubtitle}>Your Car Management System</Text>
          </View>
        </View>


        {/* Upcoming Inspections */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Upcoming Inspections</Text>

          {/* Inspection Card 1 */}
          <View style={[styles.card, styles.cardBlueBorder]}>
            <View style={styles.cardMainRow}>
              <LinearGradient
                colors={['#3B6CF2', '#5D5FEF', '#7B4DFF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.cardIconContainerBlue}
              >
                <Image
                  source={require('../../assets/images/upcomming_inspection_longtimeremaining.png')}
                  style={{ width: 20, height: 20, tintColor: '#FFF' }}
                  resizeMode="contain"
                />
              </LinearGradient>
              <View style={styles.cardContent}>
                <Text style={styles.plateNumber}>RAB 123A</Text>
                <Text style={styles.carModel}>Toyota Corolla</Text>
              </View>
              <View style={styles.daysLeftContainer}>
                <Text style={styles.daysLeftBlue}>25</Text>
                <Text style={styles.daysLeftLabel}>days left</Text>
              </View>
            </View>
            <View style={styles.cardDivider} />
            <Text style={styles.nextInspection}>Next inspection : January 2026</Text>
          </View>

          {/* Inspection Card 2 */}
          <View style={[styles.card, styles.cardRedBorder]}>
            <View style={styles.cardMainRow}>
              <LinearGradient
                colors={['#3B6CF2', '#5D5FEF', '#7B4DFF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.cardIconContainerRed}
              >
                <Image
                  source={require('../../assets/images/upcomming_inspection_shortime_remaining.png')}
                  style={{ width: 23.91, height: 23.91, tintColor: '#FFF' }}
                  resizeMode="contain"
                />
              </LinearGradient>
              <View style={styles.cardContent}>
                <Text style={styles.plateNumber}>RAE 789C</Text>
                <Text style={styles.carModel}>Volkswagen Golf</Text>
              </View>
              <View style={styles.daysLeftContainer}>
                <Text style={styles.daysLeftRed}>02</Text>
                <Text style={styles.daysLeftLabel}>days left</Text>
              </View>
            </View>
            <View style={styles.cardDivider} />
            <Text style={styles.nextInspection}>Next inspection : Feb 2026</Text>
          </View>
        </View>

        {/* Police Alerts */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Recent Context Alerts</Text>

          {alerts.length > 0 ? alerts.map((alert: any) => (
            <TouchableOpacity key={alert.id} style={styles.announcementCard}>
              <View style={[styles.sidebar, { backgroundColor: alert.type === 'error' ? '#D32F2F' : alert.type === 'warning' ? '#FFB800' : '#2D5EFF' }]} />
              <View style={styles.announcementMain}>
                <View style={styles.announcementHeader}>
                  <View style={[styles.announcementIconCircle, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}>
                    {/* Placeholder Icon */}
                    <Image source={require('../../assets/images/newtrafficsuggestion.png')} style={{ width: 20, height: 20 }} resizeMode="contain" />
                  </View>
                  <View style={styles.announcementTextContainer}>
                    <Text style={styles.announcementTitle}>{alert.title}</Text>
                    <Text style={styles.announcementText}>{alert.message}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )) : <Text style={{ color: '#fff', marginLeft: 20 }}>No active alerts.</Text>}
        </View>

        {/* Removed extra hardcoded announcements from dummy layout */}

      </ScrollView>

      <FloatingFooter activeTab="home" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050511', // Very dark background
  },
  contentContainer: {
    paddingHorizontal: 20,
    justifyContent: 'flex-start',
  },
  headerIconsContainer: {
    position: 'absolute',
    right: 20,
    zIndex: 10,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  headerTexts: {
    alignItems: 'flex-start',
  },
  welcomeText: {
    fontFamily: 'CairoMedium',
    fontSize: 24,
    color: '#FFF',
    lineHeight: 22,
    marginBottom: 15,
  },
  appTitle: {
    fontFamily: 'CairoBold',
    fontSize: 36,
    color: '#FFF',
    lineHeight: 22,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  notificationBadge: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: 'red',
    borderRadius: 8,
    width: 14,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1
  },
  badgeText: {
    fontFamily: 'CairoBold',
    color: '#FFF',
    fontSize: 9,
  },
  profileImage: {
    width: 32,
    height: 32,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 25,
    position: 'relative',
    height: 200,
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 15,
    alignItems: 'flex-start',
    paddingLeft: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  gerayoText: {
    fontFamily: 'CairoMedium',
    fontSize: 24,
    color: '#FFF',
    marginBottom: 2,
    marginTop: 10,
  },
  heroSubtitle: {
    fontFamily: 'Cairo',
    fontSize: 16,
    color: '#FFF',
    lineHeight: 22,
  },
  sectionContainer: {
    marginBottom: 20,
    width: '100%',
  },
  sectionTitle: {
    fontFamily: 'Cairo',
    fontSize: 20,
    color: '#FFF',
    lineHeight: 22,
    marginBottom: 15,
    textAlign: 'left',
    paddingLeft: 20,
  },
  card: {
    backgroundColor: '#131722',
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
  },
  cardMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardBlueBorder: {
    borderColor: '#2D5EFF',
  },
  cardRedBorder: {
    borderColor: '#4E2328',
  },
  cardIconContainerBlue: {
    width: 49,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  cardIconContainerRed: {
    width: 49,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  cardContent: {
    flex: 1,
    alignItems: 'flex-start',
    paddingTop: 2, // Slight offset to ensure top is lower than icon top
  },
  plateNumber: {
    fontFamily: 'CairoMedium',
    color: '#FFF',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: -3,
    paddingLeft: 4,
  },
  carModel: {
    fontFamily: 'Cairo',
    color: '#FFF',
    fontSize: 16, // Matching subtitle style size
  },
  daysLeftContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 45,
  },
  daysLeftBlue: {
    fontFamily: 'Cairo',
    color: '#2D5EFF',
    fontSize: 20,
    lineHeight: 22,
    textAlign: 'center',
  },
  daysLeftRed: {
    fontFamily: 'Cairo',
    color: '#D32F2F',
    fontSize: 20,
    lineHeight: 22,
    textAlign: 'center',
  },
  daysLeftLabel: {
    fontFamily: 'Cairo',
    color: '#FFF',
    fontSize: 11,
    lineHeight: 22,
    marginTop: -2,
    textAlign: 'center',
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(151, 151, 151, 0.15)',
    marginTop: 18,
    marginBottom: 12,
  },
  nextInspection: {
    fontFamily: 'Cairo',
    color: '#FFF',
    fontSize: 14, // Cairo Regular around 13-15
    lineHeight: 22,
    textAlign: 'left',
  },
  announcementCard: {
    backgroundColor: '#131722',
    borderRadius: 16,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: 12,
    minHeight: 100,
  },
  sidebar: {
    width: 6,
    height: '100%',
  },
  announcementMain: {
    flex: 1,
    padding: 15,
  },
  announcementHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  announcementIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(45, 94, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  announcementTextContainer: {
    flex: 1,
    marginRight: 8,
  },
  announcementTitle: {
    fontFamily: 'CairoMedium',
    color: '#FFF',
    fontSize: 20,
    lineHeight: 22,
    marginBottom: 4,
  },
  announcementText: {
    fontFamily: 'Cairo',
    color: '#FFF',
    fontSize: 15, // Cairo Regular around 14-16
    lineHeight: 22,
    opacity: 0.8,
  },
  announcementDate: {
    fontFamily: 'Cairo',
    color: '#FFF',
    fontSize: 14,
    opacity: 0.6,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 10,
    marginRight: 5,
  },
  statusText: {
    fontFamily: 'Cairo',
    color: '#FFF',
    fontSize: 12,
    opacity: 0.7,
  },
  sensorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 15,
  },
  sensorCard: {
    flex: 1,
    backgroundColor: '#131722',
    borderRadius: 20,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  sensorIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(45, 94, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  sensorIcon: {
    width: 20,
    height: 20,
    tintColor: '#FFF',
  },
  sensorLabel: {
    fontFamily: 'Cairo',
    color: '#FFF',
    fontSize: 12,
    opacity: 0.6,
  },
  sensorValue: {
    fontFamily: 'CairoBold',
    color: '#FFF',
    fontSize: 18,
  },
});
