import * as DocumentPicker from 'expo-document-picker';
import { readAsStringAsync } from 'expo-file-system/legacy';
import Papa from 'papaparse';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Button, Card, Paragraph } from 'react-native-paper';

type CsvDocument = {
    name?: string;
    uri?: string;
}

export default function Statistics() {
    const [csvFile, setCsvFile] = useState<CsvDocument | null>(null);
    const [parsedData, setParsedData] = useState<any[]>([]);
    const [headers, setHeaders] = useState<string[]>([]);

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
            const parsed = Papa.parse(text, { header: true, skipEmptyLines: true, delimiter: ',' });
            setParsedData(parsed.data as any[]);
            setHeaders(parsed.meta.fields ?? []);
        } catch (err) {
            console.error('Failed to read or parse CSV file', err);
        }
    };

    const removeCsvFile = () => {
        setCsvFile(null);
        setParsedData([]);
        setHeaders([]);
    };

    return (
        <>
            <Card style={{ margin: 16 }}>
                <Card.Title title="Attach CSV" />
                <Card.Content>
                    {csvFile ? (
                        <View
                            style={{
                                padding: 8,
                                borderWidth: 1,
                                borderColor: '#ddd',
                                borderRadius: 6,
                                backgroundColor: '#fafafa',
                            }}
                        >
                            <Paragraph numberOfLines={1}>{csvFile.name ?? csvFile.uri ?? 'Selected file'}</Paragraph>
                            <Button mode="contained" onPress={removeCsvFile} style={{ marginTop: 8 }}>
                                Remove File
                            </Button>
                            <Button mode="contained" onPress={pickCsvFile} style={{ marginTop: 8 }}>
                                Change File
                            </Button>
                        </View>
                    ) : (
                        <Button mode="contained" onPress={pickCsvFile}>
                            Select CSV File
                        </Button>
                    )}
                </Card.Content>
            </Card>

            <View style={{ margin: 16 }}>
                {parsedData.length === 0 ? (
                    <Paragraph style={{ marginTop: 16 }}>No data parsed from the CSV file.</Paragraph>
                ) : (
                    <ScrollView horizontal style={{ marginTop: 16 }} contentContainerStyle={{ flexGrow: 1 }}>
                        <View>
                            <View style={{ flexDirection: 'row', paddingRight: 8 }}>
                                {headers.map((header) => (
                                    <View
                                        key={header}
                                        style={{ minWidth: 120, padding: 6, borderRightWidth: 1, borderColor: '#eee' }}
                                    >
                                        <Paragraph style={{ fontWeight: '600' }} numberOfLines={1}>
                                            {header}
                                        </Paragraph>
                                    </View>
                                ))}
                            </View>

                            <ScrollView style={{ maxHeight: 200 }}>
                                {parsedData.map((row, rowIndex) => (
                                    <View
                                        key={rowIndex}
                                        style={{ flexDirection: 'row', paddingVertical: 6, borderBottomWidth: 1, borderColor: '#eee' }}
                                    >
                                        {headers.map((header) => (
                                            <View key={header} style={{ minWidth: 120, padding: 6, borderRightWidth: 1, borderColor: '#eee' }}>
                                                <Paragraph numberOfLines={1}>{String(row[header] ?? '')}</Paragraph>
                                            </View>
                                        ))}
                                    </View>
                                ))}
                            </ScrollView>
                        </View>
                    </ScrollView>
                )}
            </View>
        </>
    );
}