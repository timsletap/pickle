import * as DocumentPicker from 'expo-document-picker';
import { useState } from 'react';
import { View } from 'react-native';
import { Button, Card, Paragraph } from 'react-native-paper';

type CsvDocument = {
    name?: string;
    uri?: string;
}

export default function Statistics() {
    const [csvFile, setCsvFile] = useState<CsvDocument | null>(null);

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
    };

    const removeCsvFile = () => setCsvFile(null);

    return (
        <Card style={{ margin: 16 }}>
            <Card.Title title="Attach CSV" />
            <Card.Content>
                {csvFile ? (
                    <View style={{ padding: 8, borderWidth: 1, borderColor: '#ddd', borderRadius: 6, backgroundColor: '#fafafa' }}>
                        <Paragraph numberOfLines={1}>{csvFile.name ?? csvFile.uri ?? 'Selected file'}</Paragraph>
                        <Button mode="contained" onPress={removeCsvFile} style={{ marginTop: 8 }}>Remove File</Button>
                        <Button mode="contained" onPress={pickCsvFile} style={{ marginTop: 8 }}>Change File</Button>
                    </View>
                ) : (
                    <Button mode="contained" onPress={pickCsvFile}>Select CSV File</Button>
                )}
            </Card.Content>
        </Card>
    );
}