import React, { useState } from 'react';
import { Text, View, Image, TouchableOpacity, ScrollView } from 'react-native';
import { ComplaintMedia } from '../utils/complaintApi';
import { complaintEvidenceGalleryStyles as styles } from '../styles/complaint/evidenceGallery';
import EvidenceViewerModal from './complaint/EvidenceViewerModal';

type Props = {
  media: ComplaintMedia[];
  emptyMessage?: string;
  onMediaOpen?: (item: ComplaintMedia) => void | Promise<void>;
};

export default function ComplaintEvidenceGallery({ media, emptyMessage, onMediaOpen }: Props) {
  const [viewerVisible, setViewerVisible] = useState(false);
  const [activeMedia, setActiveMedia] = useState<ComplaintMedia | null>(null);

  const handleItemPress = async (item: ComplaintMedia) => {
    setActiveMedia(item);
    setViewerVisible(true);

    if (onMediaOpen) {
      try {
        await onMediaOpen(item);
      } catch (err) {
        console.error('Evidence open handler failed:', err);
      }
    }
  };

  const handleCloseViewer = () => {
    setViewerVisible(false);
    setActiveMedia(null);
  };

  if (media.length === 0) {
    return emptyMessage ? <Text style={styles.empty}>{emptyMessage}</Text> : null;
  }

  return (
    <>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {media.map((item) => (
          <TouchableOpacity
            key={item.media_id}
            style={styles.item}
            onPress={() => handleItemPress(item)}
            activeOpacity={0.85}
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

      <EvidenceViewerModal visible={viewerVisible} media={activeMedia} onClose={handleCloseViewer} />
    </>
  );
}
