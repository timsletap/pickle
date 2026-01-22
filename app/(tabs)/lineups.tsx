import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { updatePlayerStats } from '../../config/FirebaseConfig';
import BattingOrder from '../Lineups/BattingOrder';
import FieldView from '../Lineups/FieldView';
import PickerDialog from '../Lineups/PickerDialog';
import RosterScroller from '../Lineups/RosterScroller';
import StatsDialog from '../Lineups/StatsDialog';
import styles, { colors } from '../Lineups/styles';
import { POSITIONS, Player } from '../Lineups/types';
import { useAuth } from '../auth-context';
import { fetchPlayerInfo } from '../realtimeDb';

export default function Lineups() {
  const [roster, setRoster] = useState<Player[]>([]);
  const { user } = useAuth();

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const tabPosition = useRef(new Animated.Value(0)).current;
  const [tabWidth, setTabWidth] = useState(0);

  const handleTabChange = (mode: 'defense' | 'offense') => {
    Animated.spring(tabPosition, {
      toValue: mode === 'defense' ? 0 : 1,
      friction: 8,
      tension: 70,
      useNativeDriver: true,
    }).start();
    setViewMode(mode);
  };

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (!user) {
      setRoster([]);
      return;
    }

    const unsub = fetchPlayerInfo(user.uid, (playersRecord) => {
      if (!playersRecord) {
        setRoster([]);
        return;
      }

      const players: Player[] = Object.entries(playersRecord).map(([key, value], idx) => {
        const fullName = (value.name || "").trim();
        const parts = fullName.split(/\s+/);
        const first_name = parts.shift() || "";
        const last_name = parts.join(' ');

        const id: string | number = /^[0-9]+$/.test(key) ? parseInt(key, 10) : key;

        return {
          id,
          first_name,
          last_name,
          jersey: value.jerseyNumber ?? undefined,
          stats: value.stats ?? undefined,
        } as Player;
      });

      setRoster(players);
    });

    return () => {
      try {
        unsub();
      } catch (e) {
        // ignore
      }
    };
  }, [user]);

  const [sortMode, setSortMode] = useState<'name' | 'ba' | 'obp' | 'slg' | 'rbi' | 'games' | 'qab'>('name');
  const [viewMode, setViewMode] = useState<'defense' | 'offense'>('defense');
  const [statsDialog, setStatsDialog] = useState<{ visible: boolean; player: any }>({ visible: false, player: null });
  const [battingOrder, setBattingOrder] = useState<any[] | null>(null);

  const initialAssignments: Record<string, any> = POSITIONS.reduce((acc, p) => ({ ...acc, [p.id]: null }), {});
  const [assignments, setAssignments] = useState<Record<string, any>>(initialAssignments);
  const [dialog, setDialog] = useState<{ visible: boolean; positionId: string | null }>({ visible: false, positionId: null });

  const openPicker = (positionId: string) => setDialog({ visible: true, positionId });
  const closePicker = () => setDialog({ visible: false, positionId: null });

  const selectPlayer = (player: any) => {
    if (!dialog.positionId) return;
    setAssignments((prev) => ({ ...prev, [dialog.positionId as string]: player }));
    closePicker();
  };
  const selectNone = () => {
    if (!dialog.positionId) return;
    setAssignments((prev) => ({ ...prev, [dialog.positionId as string]: null }));
    closePicker();
  };

  const posById = (id: string) => POSITIONS.find((p) => p.id === id) as any;

  const openStats = (player: any) => setStatsDialog({ visible: true, player });
  const closeStats = () => setStatsDialog({ visible: false, player: null });

  const getMetric = (p: any, mode: string) => {
    const s = p.stats ?? {};
    if (mode === 'ba') return s.ba ?? 0;
    if (mode === 'obp') return s.obp ?? 0;
    if (mode === 'slg') return s.slg ?? 0;
    if (mode === 'rbi') return s.rbi ?? 0;
    if (mode === 'games') return s.games ?? 0;
    if (mode === 'qab') return s.qab ?? 0;
    return 0;
  };

  const sortedRoster = [...roster].sort((a: any, b: any) => {
    if (sortMode === 'name') return a.last_name.localeCompare(b.last_name);
    return getMetric(b, sortMode) - getMetric(a, sortMode);
  });

  const sortOptions: { key: typeof sortMode; label: string }[] = [
    { key: 'name', label: 'Name' },
    { key: 'ba', label: 'BA' },
    { key: 'obp', label: 'OBP' },
    { key: 'slg', label: 'SLG' },
    { key: 'rbi', label: 'RBI' },
    { key: 'games', label: 'Games' },
    { key: 'qab', label: 'QAB' },
  ];

  return (
    <View style={styles.page}>
      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={styles.headerSubtitle}>GAME DAY</Text>
        <Text style={styles.headerTitle}>Lineups</Text>

        {/* Tab Bar - matching ChalkTalk style */}
        <View
          style={{
            flexDirection: 'row',
            marginTop: 16,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            borderRadius: 20,
            padding: 5,
            borderWidth: 1.5,
            borderColor: 'rgba(0, 255, 65, 0.25)',
            shadowColor: '#00ff41',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 15,
            elevation: 8,
          }}
          onLayout={(e) => {
            setTabWidth((e.nativeEvent.layout.width - 10) / 2);
          }}
        >
          {/* Animated Indicator */}
          {tabWidth > 0 && (
            <Animated.View
              style={{
                position: 'absolute',
                top: 5,
                left: 5,
                bottom: 5,
                width: tabWidth,
                borderRadius: 15,
                overflow: 'hidden',
                transform: [{
                  translateX: tabPosition.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, tabWidth],
                  }),
                }],
              }}
            >
              <LinearGradient
                colors={['#00ff41', '#00cc33', '#00ff41']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ flex: 1 }}
              />
            </Animated.View>
          )}

          {/* Defense Tab */}
          <TouchableOpacity
            onPress={() => handleTabChange('defense')}
            activeOpacity={0.8}
            style={{
              flex: 1,
              paddingVertical: 14,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 15,
              zIndex: 1,
            }}
          >
            <MaterialCommunityIcons
              name="shield-outline"
              size={22}
              color={viewMode === 'defense' ? '#000' : '#00ff41'}
              style={{ marginBottom: 4 }}
            />
            <Text style={{
              fontSize: 11,
              fontWeight: '800',
              color: viewMode === 'defense' ? '#000' : '#00ff41',
              letterSpacing: 0.8,
            }}>
              DEFENSE
            </Text>
          </TouchableOpacity>

          {/* Offense Tab */}
          <TouchableOpacity
            onPress={() => handleTabChange('offense')}
            activeOpacity={0.8}
            style={{
              flex: 1,
              paddingVertical: 14,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 15,
              zIndex: 1,
            }}
          >
            <MaterialCommunityIcons
              name="baseball-bat"
              size={22}
              color={viewMode === 'offense' ? '#000' : '#00ff41'}
              style={{ marginBottom: 4 }}
            />
            <Text style={{
              fontSize: 11,
              fontWeight: '800',
              color: viewMode === 'offense' ? '#000' : '#00ff41',
              letterSpacing: 0.8,
            }}>
              OFFENSE
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Content */}
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        {viewMode === 'defense' ? (
          <View style={{ paddingTop: 16 }}>
            <FieldView positions={POSITIONS} assignments={assignments} openPicker={openPicker} />
          </View>
        ) : (
          <BattingOrder
            roster={roster}
            sortMode={sortMode}
            setSortMode={setSortMode}
            openStats={openStats}
            battingOrder={battingOrder ?? undefined}
            onAutoGenerate={async () => {
              const alg = require('../Lineups/LineupAlgorithm') as typeof import('../Lineups/LineupAlgorithm');
              const result = alg.generateOptimalLineup(roster, { lineupSize: Math.min(9, roster.length)});
              try {
                const raw = alg.computeRawMetrics(roster);
                await Promise.all(roster.map(async (p) => {
                  const rcv = raw.get(p.id)?.rcv ?? 0;
                  const merged = { ...(p.stats ?? {}), rcv };
                  try {
                    await updatePlayerStats(user!.uid, String(p.id), merged);
                  } catch (e) {}
                }));
              } catch (e) {}
              setBattingOrder(result.lineup);
            }}
            onClearOrder={() => setBattingOrder(null)}
          />
        )}

        {/* Divider */}
        <View style={styles.divider} />

        {/* Players Section */}
        <View style={styles.rosterContainer}>
          <Text style={styles.sectionTitle}>Players</Text>

          {/* Sort Buttons */}
          <View style={styles.sortRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {sortOptions.map((opt) => (
                <TouchableOpacity
                  key={opt.key}
                  onPress={() => setSortMode(opt.key)}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 16,
                    borderRadius: 10,
                    marginRight: 8,
                    backgroundColor: sortMode === opt.key ? colors.primary : 'transparent',
                    borderWidth: 1.5,
                    borderColor: sortMode === opt.key ? colors.primary : colors.primaryBorder,
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={{
                    fontSize: 12,
                    fontWeight: '700',
                    color: sortMode === opt.key ? '#000' : colors.primary,
                  }}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <RosterScroller sortedRoster={sortedRoster} metricMode={sortMode} assignments={assignments} posById={posById} openStats={openStats} />
        </View>
      </Animated.View>

      <PickerDialog visible={dialog.visible} positionId={dialog.positionId} closePicker={closePicker} roster={roster} assignments={assignments} selectNone={selectNone} selectPlayer={selectPlayer} posById={posById} />

      <StatsDialog visible={statsDialog.visible} player={statsDialog.player} closeStats={closeStats} />
    </View>
  );
}
