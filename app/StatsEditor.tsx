import { Button, Dialog, Portal, TextInput } from 'react-native-paper';

type Props = {
  visible: boolean;
  playerName: string | null;
  avgText: string;
  obpText: string;
  slgText: string;
  rbiText: string;
  gamesText: string;
  qabText: string;
  setAvgText: (s: string) => void;
  setObpText: (s: string) => void;
  setSlgText: (s: string) => void;
  setRbiText: (s: string) => void;
  setGamesText: (s: string) => void;
  setQabText: (s: string) => void;
  onSave: () => void;
  onClose: () => void;
};

export default function StatsEditor({ visible, playerName, avgText, obpText, slgText, rbiText, gamesText, qabText, setAvgText, setObpText, setSlgText, setRbiText, setGamesText, setQabText, onSave, onClose }: Props) {
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onClose}>
        <Dialog.Title>{playerName ? `Edit Stats — ${playerName}` : 'Edit Stats'}</Dialog.Title>
        <Dialog.Content>
          <TextInput label="Batting Average (BA)" value={avgText} onChangeText={setAvgText} keyboardType="numeric" returnKeyType="done" />
          <TextInput label="On-Base % (OBP)" value={obpText} onChangeText={setObpText} keyboardType="numeric" returnKeyType="done" />
          <TextInput label="Slugging % (SLG)" value={slgText} onChangeText={setSlgText} keyboardType="numeric" returnKeyType="done" />
          <TextInput label="RBI" value={rbiText} onChangeText={setRbiText} keyboardType="numeric" returnKeyType="done" />
          <TextInput label="Games" value={gamesText} onChangeText={setGamesText} keyboardType="numeric" returnKeyType="done" />
          <TextInput label="Quality At-Bat % (QAB%)" value={qabText} onChangeText={setQabText} keyboardType="numeric" returnKeyType="done" />
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onClose}>Cancel</Button>
          <Button onPress={onSave}>Save</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
