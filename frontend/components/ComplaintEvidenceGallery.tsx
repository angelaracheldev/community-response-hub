import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Linking,
  ScrollView,
} from 'react-native';
import { ComplaintMedia } from '../utils/complaintApi';

type Props = {
  media: ComplaintMedia[];
  emptyMessage?: string;
};

export default function ComplaintEvidenceGallery({ media, emptyMessage }: Props) {
  if (media.length === 0) {
    return emptyMessage ? <Text style={styles.empty}>{emptyMessage}</Text> : null;
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {media.map((item) => (
        <TouchableOpacity
          key={item.media_id}
          style={styles.item}
          onPress={() => Linking.openURL(item.media_url)}
        >
          {item.media_type === 'image' ? (
            <Image source={{ uri: item.media_url }} style={styles.thumbnail} resizeMode="cover" />
          ) : (
            <View style={styles.videoPlaceholder}>
              <Text style={styles.videoIcon}>▶</Text>
              <Text style={styles.videoLabel}>Video</Text>
            </View>
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 10,
    paddingVertical: 4,
  },
  item: {
    width: 100,
    height: 100,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  videoPlaceholder: {
    flex: 1,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoIcon: {
    color: '#fff',
    fontSize: 24,
    marginBottom: 4,
  },
  videoLabel: {
    color: '#d1d5db',
    fontSize: 11,
    fontWeight: '600',
  },
  empty: {
    color: '#6b7280',
    fontSize: 14,
  },
});
