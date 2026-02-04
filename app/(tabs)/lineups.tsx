import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { useAuth } from '../auth-context';
import DefenseView from '../Lineups/lineupsDefense';
import OffenseView from '../Lineups/lineupsOffense';
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
            stats: v.stats || {}, 
            statsDefensive: v.statsDefensive || {} 
          } as Player;
        });
        arr.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
        setPlayers(arr);
        setRoster(arr);
        setLoading(false);
      });

      return () => unsub && unsub();
    }, [user]
  );

  const [sortMode, setSortMode] = useState<'name' | 'tc' | 'etc' | 'a' | 'dp' | 'po' | 'innings' | 'ba' | 'obp' | 'slg' | 'rbi' | 'games' | 'qab'>('name');
  const [viewMode, setViewMode] = useState<'defense' | 'offense'>('defense');
  const [statsDialog, setStatsDialog] = useState<{ visible: boolean; player: any }>({ visible: false, player: null });
  const [battingOrder, setBattingOrder] = useState<any[] | null>(null);
  const [selectedBatSlot, setSelectedBatSlot] = useState<number | null>(null);
  const initializedRef = useRef(false);

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

  // On first render (when roster loads) set default batting order to alphabetical
  useEffect(() => {
    if (initializedRef.current) return;
    if (!roster || roster.length === 0) return;
    initializedRef.current = true;
    const size = Math.min(9, roster.length);
    const base: (any | null)[] = [...roster]
      .sort((a: any, b: any) => (a.name ?? '').localeCompare(b.name ?? ''))
      .slice(0, size);
    while (base.length < size) base.push(null);
    setBattingOrder(base);
  }, [roster]);

  const getMetric = (p: any, mode: string) => {
    const sDefensive = p.statsDefensive ?? {};
    const sOffensive = p.stats ?? {};
    if (mode === 'tc') return sDefensive.tc ?? 0;
    if (mode === 'etc') return sDefensive.etc ?? 0;
    if (mode === 'a') return sDefensive.a ?? 0;
    if (mode === 'dp') return sDefensive.dp ?? 0;
    if (mode === 'po') return sDefensive.po ?? 0;
    if (mode === 'innings') return sDefensive.innings ?? 0;
    if (mode === 'ba') return sOffensive.ba ?? 0;
    if (mode === 'obp') return sOffensive.obp ?? 0;
    if (mode === 'slg') return sOffensive.slg ?? 0;
    if (mode === 'rbi') return sOffensive.rbi ?? 0;
    if (mode === 'games') return sOffensive.games ?? 0;
    if (mode === 'qab') return sOffensive.qab ?? 0;
    return 0;
  };

  type SortKey = 'name' | 'tc' | 'etc' | 'a' | 'dp' | 'po' | 'innings' | 'ba' | 'obp' | 'slg' | 'rbi' | 'games' | 'qab';
  const defensiveSortOptions: { key: SortKey; label: string }[] = [
    { key: 'name', label: 'Name' },
    { key: 'tc', label: 'TC' },
    { key: 'etc', label: 'ETC' },
    { key: 'a', label: 'A' },
    { key: 'dp', label: 'DP' },
    { key: 'po', label: 'PO' },
    { key: 'innings', label: 'Innings' },
  ];

  const offensiveSortOptions: { key: SortKey; label: string }[] = [
    { key: 'name', label: 'Name' },
    { key: 'ba', label: 'BA' },
    { key: 'obp', label: 'OBP' },
    { key: 'slg', label: 'SLG' },
    { key: 'rbi', label: 'RBI' },
    { key: 'games', label: 'GP' },
    { key: 'qab', label: 'QAB%' },
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
              paddingVertical: 8,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 12,
              zIndex: 1,
            }}
          >
            <MaterialCommunityIcons
              name="shield-outline"
              size={18}
              color={viewMode === 'defense' ? '#000' : '#00a878'}
              style={{ marginBottom: 4 }}
            />
            <Text style={{
              fontSize: 10,
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
              paddingVertical: 8,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 12,
              zIndex: 1,
            }}
          >
            <MaterialCommunityIcons
              name="baseball-bat"
              size={18}
              color={viewMode === 'offense' ? '#000' : '#00a878'}
              style={{ marginBottom: 4 }}
            />
            <Text style={{
              fontSize: 10,
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
          <DefenseView 
            positions={POSITIONS} 
            assignments={assignments} 
            openPicker={openPicker} />
        ) : (
          <OffenseView
            roster={roster}
            sortMode={sortMode}
            setSortMode={setSortMode}
            openStats={openStats}
            battingOrder={battingOrder ?? undefined}
            setBattingOrder={setBattingOrder}
            selectedBatSlot={selectedBatSlot}
            setSelectedBatSlot={setSelectedBatSlot}
            user={user}
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
              {(viewMode === 'defense' ? defensiveSortOptions : offensiveSortOptions).map((opt) => (
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

          <RosterScroller
            sortedRoster={sortedRoster}
            metricMode={sortMode}
            assignments={assignments}
            posById={posById}
            openStats={openStats}
            onPlayerSelect={(p: Player) => {
              if (selectedBatSlot === null) {
                openStats(p);
                return;
              }
              const idx = selectedBatSlot;
              const size = Math.min(9, roster.length);
              setBattingOrder((prev) => {
                const base = prev ? [...prev] : Array(size).fill(null);
                while (base.length < size) base.push(null);

                // find if this player is already in the lineup
                const prevIndex = base.findIndex((entry: any) => entry && entry.id === p.id);
                if (prevIndex === idx) {
                  // already in desired slot
                  return base;
                }

                if (prevIndex >= 0) {
                  // swap the players between prevIndex and idx
                  const tmp = base[idx];
                  base[idx] = p;
                  base[prevIndex] = tmp ?? null;
                } else {
                  // player not previously in lineup: place in slot (no duplicates exist)
                  base[idx] = p;
                }

                return base;
              });
              setSelectedBatSlot(null);
            }}
          />
        </View>
      </Animated.View>

      <PickerDialog visible={dialog.visible} positionId={dialog.positionId} closePicker={closePicker} roster={roster} assignments={assignments} selectNone={selectNone} selectPlayer={selectPlayer} posById={posById} />

      <StatsDialog visible={statsDialog.visible} player={statsDialog.player} closeStats={closeStats} />
    </View>
  );
}
