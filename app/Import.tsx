import * as DocumentPicker from 'expo-document-picker';
import { readAsStringAsync } from 'expo-file-system/legacy';
import { router } from 'expo-router';
import Papa from 'papaparse';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, IconButton, Paragraph } from 'react-native-paper';

import { useAuth } from './auth-context';
import { fetchPlayerInfo, savePlayerInfo, savePlayerStats, savePlayerStatsDefensive } from './realtimeDb';

type CsvDocument = {
    name?: string;
    uri?: string;
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000', paddingTop: 96, paddingHorizontal: 16 },
    card: {
        backgroundColor: 'rgba(0,0,0,0.45)',
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: 'rgba(0,168,120,0.18)',
        shadowColor: '#00a878',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 18,
        elevation: 8,
    },
    cardContent: {
        padding: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(0,168,120,0.12)',
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    paragraph: { color: '#fff' },
    button: { backgroundColor: '#00a878' },
    tableCell: { borderRightWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
    tableRow: { borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.04)' },
    backButton: { position: 'absolute', left: 12, top: 70, zIndex: 60 },
});

export default function Import() {
    const [csvFile, setCsvFile] = useState<CsvDocument | null>(null);
    const [parsedData, setParsedData] = useState<any[]>([]);
    const [headers, setHeaders] = useState<string[]>([]);

    const { user } = useAuth();
    const [players, setPlayers] = useState<any[]>([]);
    const [saving, setSaving] = useState(false);

    const pickCsvFile = async () => {
        const result = await DocumentPicker.getDocumentAsync({
            type: 'text/csv',
            copyToCacheDirectory: true,
        });

        // unify result shapes: prefer assets[0] when present
        const r: any = result;
        const asset = Array.isArray(r.assets) && r.assets[0] ? r.assets[0] : r;
        const uri = asset?.uri;
        if (!uri) return;
        const name = asset.name ?? uri.split('/').pop();
        setCsvFile({ name, uri });

        try {
            const text = await readAsStringAsync(uri);

            // drop the first row (often contains whitespace or garbage)
            const lines = text.split(/\r?\n/);
            const withoutFirst = lines.slice(1).join('\n');

            const parsed = Papa.parse(withoutFirst, { header: true, skipEmptyLines: true, delimiter: ',' });
            setParsedData(parsed.data as any[]);
            setHeaders(parsed.meta.fields ?? []);
        } catch (err) {
            console.error('Failed to read or parse CSV file', err);
        }
    };

    const saveCsvToFirebase = async () => {
        if (!user || parsedData.length === 0) return;
        setSaving(true);
        try {
            const playersMap: any = await new Promise((resolve) => {
                const unsub = fetchPlayerInfo(user.uid, (data) => {
                    unsub && unsub();
                    resolve(data || {});
                });
            });

            const entries = Object.entries(playersMap);

            const results = await Promise.all(parsedData.map(async (row) => {
                const jerseyNumber = row['Number'];
                const nameVal = row['First'] + ' ' + row['Last'];
                let playerId: string | undefined = undefined;

                if (jerseyNumber != null && String(jerseyNumber).trim() !== '') {
                    const jc = String(jerseyNumber).trim();
                    const match = entries.find(([id, val]) => String((val as any).jerseyNumber ?? '').trim() === jc);
                    if (match) playerId = match[0];
                }

                if (!playerId && nameVal) {
                    const nameToFind = String(nameVal).trim().toLowerCase();
                    const match = entries.find(([id, val]) => String((val as any).name ?? '').trim().toLowerCase() === nameToFind);
                    if (match) playerId = match[0];
                }

                if (nameVal == null || String(nameVal).trim() === '') {
                    return { ok: false, playerId };
                }

                const parse = (v: any) => (v === '' || v == null ? null : Number(v));
                const stats: any = {};
                const statsDefensive: any = {};

                // offensive stats
                if (row['AVG'] != null) stats.ba = parse(row['AVG']);
                if (row['OBP'] != null) stats.obp = parse(row['OBP']);
                if (row['SLG'] != null) stats.slg = parse(row['SLG']);
                if (row['RBI'] != null) stats.rbi = parse(row['RBI']);
                if (row['GP'] != null) stats.games = parse(row['GP']);
                if (row['QAB%'] != null) stats.qab = parse(row['QAB%']);

                // defensive stats
                if (row['TC'] != null) statsDefensive.ta = parse(row['TC']);
                if (row['E'] != null && row['TC'] != null) {
                    const tc = parse(row['TC']);
                    const e = parse(row['E']);
                    if (tc != null && e != null && tc > 0) {
                        statsDefensive.etc = e/tc;
                    }
                }
                if (row['A'] != null) statsDefensive.a = parse(row['A']);
                if (row['PO'] != null) statsDefensive.po = parse(row['PO']);
                if (row['INN'] != null) statsDefensive.innings = parse(row['INN']);
                if (row['DP'] != null) statsDefensive.dp = parse(row['DP']);

                try {
                    if (playerId) {
                        await savePlayerStats(user.uid, stats, playerId);
                        await savePlayerStatsDefensive(user.uid, statsDefensive, playerId);
                    } 
                    else {
                        const playerObj = {
                            name: String(nameVal).trim(),
                            positions: [],
                            jerseyNumber: jerseyNumber != null && String(jerseyNumber).trim() !== '' ? Number(String(jerseyNumber).trim()) : undefined,
                        }
                        const newId = await savePlayerInfo(
                            user.uid,
                            playerObj,
                        );
                        
                        await savePlayerStats(user.uid, stats, newId);
                        await savePlayerStatsDefensive(user.uid, statsDefensive, newId);
                        playerId = newId;
                    }
                    return { ok: true, playerId };
                } catch (err) {
                    return { ok: false, playerId };
                }
            }));

            console.log('CSV import results:', results);
        } catch (err) {
            console.error('Failed to save CSV data to Firebase', err);
        } finally {
            setSaving(false);
        }
    };

    const removeCsvFile = () => {
        setCsvFile(null);
        setParsedData([]);
        setHeaders([]);
    };

    return (
        <View style={styles.container}>
            <IconButton
                icon="arrow-left"
                size={30}
                onPress={() => router.push('/profile')}
                containerColor="transparent"
                iconColor="#fff"
                style={styles.backButton}
            />
            <Card style={[styles.card, { margin: 16, marginTop: 30 }]}>
                <Card.Title title="Attach CSV" titleStyle={{ textAlign: 'center', fontSize: 18, color: '#fff', marginTop: 14 }}/>
                <Card.Content>
                    {csvFile ? (
                        <View
                            style={styles.cardContent}
                        >
                            <Paragraph numberOfLines={1} style={styles.paragraph}>{csvFile.name ?? csvFile.uri ?? 'Selected file'}</Paragraph>
                            <Button mode="contained" onPress={removeCsvFile} style={[styles.button, { marginTop: 8 }]}>
                                Remove File
                            </Button>
                            <Button mode="contained" onPress={pickCsvFile} style={[styles.button, { marginTop: 8 }]}>
                                Change File
                            </Button>
                        </View>
                    ) : (
                        <Button mode="contained" onPress={pickCsvFile} style={[styles.button, { marginTop: 8 }]} labelStyle={{ color: '#000000ff' }}>Select CSV File</Button>
                    )}
                </Card.Content>
            </Card>
            <View style={{ marginHorizontal: 16 }}>
                {parsedData.length > 0 && (
                    <Button
                        mode="contained"
                        onPress={saveCsvToFirebase}
                        loading={saving}
                        disabled={saving}
                        style={[styles.button, { marginTop: 8 }]}
                    >
                        Save to Firebase
                    </Button>
                )}
            </View>
            <View style={{ margin: 16 }}>
                {parsedData.length === 0 ? (
                    <Paragraph style={[styles.paragraph, { marginTop: 16 }]}>No data parsed from the CSV file.</Paragraph>
                ) : (
                    <ScrollView horizontal style={{ marginTop: 16 }} contentContainerStyle={{ flexGrow: 1 }}>
                        <View>
                            <View style={{ flexDirection: 'row', paddingRight: 8 }}>
                                {headers.map((header) => (
                                    <View
                                        key={header}
                                        style={[styles.tableCell, { minWidth: 120, padding: 6 }]}
                                    >
                                        <Paragraph style={[styles.paragraph, { fontWeight: '600' }]} numberOfLines={1}>
                                            {header}
                                        </Paragraph>
                                    </View>
                                ))}
                            </View>

                            <ScrollView style={{ maxHeight: 200 }}>
                                {parsedData.map((row, rowIndex) => (
                                    <View
                                        key={rowIndex}
                                        style={[styles.tableRow, { flexDirection: 'row', paddingVertical: 6 }]}
                                    >
                                        {headers.map((header) => (
                                            <View key={header} style={[styles.tableCell, { minWidth: 120, padding: 6 }]}>
                                                <Paragraph style={styles.paragraph} numberOfLines={1}>{String(row[header] ?? '')}</Paragraph>
                                            </View>
                                        ))}
                                    </View>
                                ))}
                            </ScrollView>
                        </View>
                    </ScrollView>
                )}
            </View>
        </View>
    );
}

