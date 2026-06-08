import React from 'react';
import { Text, View, Image, TouchableOpacity, Linking, ScrollView } from 'react-native';
import { ComplaintMedia } from '../utils/complaintApi';
import { complaintEvidenceGalleryStyles as styles } from '../styles/complaint/evidenceGallery';

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


