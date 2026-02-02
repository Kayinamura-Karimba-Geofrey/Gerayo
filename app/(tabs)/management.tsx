import { FloatingFooter } from '@/components/FloatingFooter';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  },
  {
    id: '2',
    title: 'Seat Belts',
    description: 'Wearing a seat belt reduces the risk of fatal injury by 45%.',
  },
  {
    id: '3',
    title: 'Night Driving',
    description: 'Ensure your headlights are clean and properly aligned before driving at night.',
  },
];

export default function ManagementScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header - 50px from top */}
        <View style={[styles.header, { marginTop: 50 }]}>
          <Text style={styles.headerTitle}>Management</Text>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              placeholder="Search rules, tips, services..."
              placeholderTextColor="#999"
              style={styles.searchInput}
            />
          </View>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesList}>
            {CATEGORIES.map((item) => (
              <TouchableOpacity key={item.id} style={styles.categoryCard}>
                <LinearGradient
                  colors={['#3B6CF2', '#5D5FEF', '#7B4DFF']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.iconCircle}
                >
                  <Ionicons name={item.icon as any} size={24} color="#FFF" />
                </LinearGradient>
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
              colors={['rgba(45, 94, 255, 0.8)', 'rgba(26, 31, 46, 0.8)']}
              style={styles.guidelineOverlay}
            >
              <Text style={styles.guidelineTitle}>New Traffic Law 2024</Text>
              <Text style={styles.guidelineSubtitle}>Learn about the latest updates in traffic regulations.</Text>
              <TouchableOpacity
                onPress={() => { }}
              >
                <LinearGradient
                  colors={['#3B6CF2', '#5D5FEF', '#7B4DFF']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.readMoreBtn}
                >
                  <Text style={styles.readMoreText}>READ MORE</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>

      </ScrollView>
      <FloatingFooter activeTab="management" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050511',
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTitle: {
    fontFamily: 'CairoBold',
    fontSize: 32,
    color: '#FFF',
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1F2E',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    borderWidth: 1,
    borderColor: '#262B3B',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Cairo',
    fontSize: 16,
    color: '#FFF',
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
    fontFamily: 'CairoBold',
    fontSize: 20,
    color: '#FFF',
    marginBottom: 15,
  },
  seeAll: {
    fontFamily: 'Cairo',
    fontSize: 14,
    color: '#2D5EFF',
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
    fontFamily: 'Cairo',
    fontSize: 14,
    color: '#AAA',
    textAlign: 'center',
  },
  tipCard: {
    backgroundColor: '#1A1F2E',
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#262B3B',
  },
  tipContent: {
    flex: 1,
    marginRight: 10,
  },
  tipTitle: {
    fontFamily: 'CairoBold',
    fontSize: 16,
    color: '#FFF',
  },
  tipDescription: {
    fontFamily: 'Cairo',
    fontSize: 13,
    color: '#999',
    marginTop: 2,
  },
  guidelineCard: {
    height: 180,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#1A1F2E',
    borderWidth: 1,
    borderColor: '#262B3B',
  },
  guidelineOverlay: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  guidelineTitle: {
    fontFamily: 'CairoBold',
    fontSize: 22,
    color: '#FFF',
  },
  guidelineSubtitle: {
    fontFamily: 'Cairo',
    fontSize: 14,
    color: '#AAA',
    marginTop: 5,
    marginBottom: 20,
  },
  readMoreBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  readMoreText: {
    fontFamily: 'CairoBold',
    fontSize: 12,
    color: '#FFF',
  },
});

