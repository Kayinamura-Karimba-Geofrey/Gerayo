import { AnimatedScreen } from '@/components/AnimatedScreen';
import { Cairo_400Regular, Cairo_700Bold, useFonts } from '@expo-google-fonts/cairo';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  { id: '1', title: 'Rules', icon: 'book-outline', color: '#4A90E2' },
  { id: '2', title: 'Signals', icon: 'traffic-cone', color: '#F5A623' },
  { id: '3', title: 'Emergency', icon: 'alert-circle-outline', color: '#D0021B' },
  { id: '4', title: 'Videos', icon: 'play-circle-outline', color: '#7ED321' },
  { id: '5', title: 'Fines', icon: 'receipt-outline', color: '#9013FE' },
];

const SAFETY_TIPS = [
  {
    id: '1',
    title: 'Speed Limits',
    description: 'Always respect speed limits specified on road signs to prevent accidents.',
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5962?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: '2',
    title: 'Seat Belts',
    description: 'Wearing a seat belt reduces the risk of fatal injury by 45%.',
    image: 'https://images.unsplash.com/photo-1596733430284-f7437f61a1a9?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: '3',
    title: 'Night Driving',
    description: 'Ensure your headlights are clean and properly aligned before driving at night.',
    image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=400',
  },
];

export default function ExploreScreen() {
  const [fontsLoaded] = useFonts({
    Cairo_400Regular,
    Cairo_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1A1458" />
      </View>
    );
  }

  return (
    <AnimatedScreen style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with Search */}
        <LinearGradient
          colors={['#1A1458', '#054B8D']}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Explore Gerayo</Text>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              placeholder="Search rules, tips, services..."
              placeholderTextColor="#999"
              style={styles.searchInput}
            />
          </View>
        </LinearGradient>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesList}>
            {CATEGORIES.map((item) => (
              <TouchableOpacity key={item.id} style={styles.categoryCard}>
                <View style={[styles.iconCircle, { backgroundColor: item.color + '20' }]}>
                  <Ionicons name={item.icon as any} size={24} color={item.color} />
                </View>
                <Text style={styles.categoryText}>{item.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Safety Tips */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Safety Tips</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {SAFETY_TIPS.map((tip) => (
            <TouchableOpacity key={tip.id} style={styles.tipCard}>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <Text style={styles.tipDescription} numberOfLines={2}>
                  {tip.description}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#CCC" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Latest Updates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Traffic Guidelines</Text>
          <View style={styles.guidelineCard}>
            <LinearGradient
              colors={['rgba(26, 20, 88, 0.8)', 'rgba(5, 75, 141, 0.8)']}
              style={styles.guidelineOverlay}
            >
              <Text style={styles.guidelineTitle}>New Traffic Law 2024</Text>
              <Text style={styles.guidelineSubtitle}>Learn about the latest updates in traffic regulations.</Text>
              <TouchableOpacity style={styles.readMoreBtn}>
                <Text style={styles.readMoreText}>READ MORE</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </AnimatedScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  header: {
    paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    fontFamily: 'Cairo_700Bold',
    fontSize: 28,
    color: '#FFF',
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Cairo_400Regular',
    fontSize: 16,
    color: '#333',
  },
  section: {
    marginTop: 25,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontFamily: 'Cairo_700Bold',
    fontSize: 20,
    color: '#1A1458',
    marginBottom: 15,
  },
  seeAll: {
    fontFamily: 'Cairo_400Regular',
    fontSize: 14,
    color: '#054B8D',
  },
  categoriesList: {
    paddingRight: 20,
  },
  categoryCard: {
    alignItems: 'center',
    marginRight: 20,
    width: 80,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryText: {
    fontFamily: 'Cairo_400Regular',
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  tipCard: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  tipContent: {
    flex: 1,
    marginRight: 10,
  },
  tipTitle: {
    fontFamily: 'Cairo_700Bold',
    fontSize: 16,
    color: '#1A1458',
  },
  tipDescription: {
    fontFamily: 'Cairo_400Regular',
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  guidelineCard: {
    height: 180,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#1A1458',
  },
  guidelineOverlay: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  guidelineTitle: {
    fontFamily: 'Cairo_700Bold',
    fontSize: 22,
    color: '#FFF',
  },
  guidelineSubtitle: {
    fontFamily: 'Cairo_400Regular',
    fontSize: 14,
    color: '#EEE',
    marginTop: 5,
    marginBottom: 20,
  },
  readMoreBtn: {
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  readMoreText: {
    fontFamily: 'Cairo_700Bold',
    fontSize: 12,
    color: '#1A1458',
  },
});

