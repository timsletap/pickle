import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  page: {
    flex: 1,
    padding: 16,
  },
  title: {
    marginBottom: 8,
  },
  instructions: {
    marginBottom: 12,
  },
  field: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#cfeeb7",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#8fc97a",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  positionCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333",
  },
  pressed: {
    opacity: 0.7,
  },
  circleText: {
    fontWeight: "bold",
  },
  posLabel: {
    marginTop: 6,
    fontSize: 12,
    textAlign: "center",
    width: 90,
  },
  dialogList: {
    maxHeight: 300,
  },
  rosterContainer: {
    marginTop: 16,
  },
  sortRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  rosterScroll: {
    paddingVertical: 8,
  },
  playerCard: {
    alignItems: 'center',
    width: 72,
    marginRight: 12,
  },
  playerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  playerNumber: {
    fontWeight: 'bold',
  },
  playerName: {
    marginTop: 6,
    fontSize: 12,
    textAlign: 'center',
  },
  assignedText: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  viewToggleRow: {
    flexDirection: 'row',
    marginVertical: 12,
    alignItems: 'center',
  },
  battingContainer: {
    width: '100%',
    marginTop: 8,
  },
  battingList: {
    maxHeight: 240,
  }
});