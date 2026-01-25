import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { updatePlayerStats } from '../../config/FirebaseConfig';
import { useAuth } from '../auth-context';
import BattingOrder from '../Lineups/BattingOrder';
import FieldView from '../Lineups/FieldView';
import PickerDialog from '../Lineups/PickerDialog';
import RosterScroller from '../Lineups/RosterScroller';
import StatsDialog from '../Lineups/StatsDialog';
import styles, { colors } from '../Lineups/styles';
import { POSITIONS } from '../Lineups/types';
import { fetchPlayerInfo } from '../realtimeDb';
import { Player } from '../types';

export default function Lineups() {
  const [roster, setRoster] = useState<Player[]>([]);
  const { user } = useAuth();

  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

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

    const unsub = fetchPlayerInfo(user.uid, (data) => {
      if (!data) {
        setPlayers([]);
        setLoading(false);
        return;
      }

      const arr = Object.entries(data).map(([id, val]) => {
        const v = val as any;
          return { 
            id, 
            name: v.name, 
            positions: v.positions || [], 
            jerseyNumber: v.jerseyNumber ?? undefined, 
            statsDefensive: v.statsDefensive || {} 
          } as Player;
        });
        arr.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
        setPlayers(arr);
        setRoster(arr);
        setLoading(false);
      });

      return () => unsub && unsub();
    }, [user]);

  const [sortMode, setSortMode] = useState<'name' | 'tc' | 'etc' | 'a' | 'dp' | 'po' | 'innings'>('name');
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
    const s = p.statsDefensive ?? {};
    if (mode === 'tc') return s.tc ?? 0;
    if (mode === 'etc') return s.etc ?? 0;
    if (mode === 'a') return s.a ?? 0;
    if (mode === 'dp') return s.dp ?? 0;
    if (mode === 'po') return s.po ?? 0;
    if (mode === 'innings') return s.innings ?? 0;
    return 0;
  };

  type SortKey = 'name' | 'tc' | 'etc' | 'a' | 'dp' | 'po' | 'innings';
  const sortOptions: { key: SortKey; label: string }[] = [
    { key: 'name', label: 'Name' },
    { key: 'tc', label: 'TC' },
    { key: 'etc', label: 'ETC' },
    { key: 'a', label: 'A' },
    { key: 'dp', label: 'DP' },
    { key: 'po', label: 'PO' },
    { key: 'innings', label: 'Innings' },
  ];

  const sortedRoster = [...roster].sort((a: any, b: any) => {
    if (sortMode === 'name') return (a.name ?? '').localeCompare(b.name ?? '');
    return getMetric(b, sortMode) - getMetric(a, sortMode);
  });

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
            borderColor: 'rgba(0, 168, 120, 0.25)',
            shadowColor: '#00a878',
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
              <View style={{ flex: 1, backgroundColor: '#00a878' }} />
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
              color={viewMode === 'defense' ? '#000' : '#00a878'}
              style={{ marginBottom: 4 }}
            />
            <Text style={{
              fontSize: 11,
              fontWeight: '800',
              color: viewMode === 'defense' ? '#000' : '#00a878',
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
              color={viewMode === 'offense' ? '#000' : '#00a878'}
              style={{ marginBottom: 4 }}
            />
            <Text style={{
              fontSize: 11,
              fontWeight: '800',
              color: viewMode === 'offense' ? '#000' : '#00a878',
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
