import * as DocumentPicker from 'expo-document-picker';
import { useState } from 'react';
import { Alert } from 'react-native';
import { Button, Card, Paragraph } from 'react-native-paper';

type CsvDocument = {
    type: 'success' | 'cancel';
    name?: string;
    uri?: string;
    size?: number;
    mimeType?: string;
}

export default function Statistics() {
    const [csvFile, setCsvFile] = useState<CsvDocument | null>(null);

    const pickCsvFile = async () => {
        const result = await DocumentPicker.getDocumentAsync({
            type: 'text/csv',
            copyToCacheDirectory: true,
        })
        
        if (!('uri' in result)) {
            return;
        }

        const name = (result as any).name as string | undefined;
        const uri = (result as any).uri as string | undefined;
        const size = (result as any).size as number | undefined;
        const mimeType = (result as any).mimeType as string | undefined;

        if (name?.toLowerCase().endsWith('.csv')) {
            Alert.alert('Invalid File', 'Please select a valid CSV file.');
            return;
        }
        setCsvFile({ type: 'success', name, uri, size, mimeType});
    };

    const removeCsvFile = () => {
        setCsvFile(null);
    };

    return (
        <Card style={{ margin: 16 }}>
            <Card.Title title="Attach CSV" />
            <Card.Content>
                {csvFile ? (
                    <>
                        <Paragraph numberOfLines={1}>{csvFile.name}</Paragraph>
                        <Button onPress={removeCsvFile}>Remove File</Button>
                        <Button onPress={pickCsvFile}>Change File</Button>
                    </>
                ) : (
                    <Button onPress={pickCsvFile}>Select CSV File</Button>
                )}
            </Card.Content>
        </Card>
    );
}