import React from 'react';
import { Image, Linking, Modal, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ComplaintMedia } from '../../utils/complaintApi';
import { evidenceViewerModalStyles as styles } from '../../styles/complaint/evidenceViewerModal';

type Props = {
  visible: boolean;
  media: ComplaintMedia | null;
  onClose: () => void;
};

export default function EvidenceViewerModal({ visible, media, onClose }: Props) {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeText}>Close</Text>
        </TouchableOpacity>
        {media?.media_type === 'image' ? (
          <Image source={{ uri: media.media_url }} style={styles.media} resizeMode="contain" />
        ) : null}
        {media?.media_type === 'video' ? (
          <View style={styles.videoFallback}>
            <Text style={styles.videoFallbackTitle}>Video evidence</Text>
            <Text style={styles.videoFallbackHint}>Open this file in your browser to play it.</Text>
            <TouchableOpacity
              onPress={() => void Linking.openURL(media.media_url)}
              style={styles.openLinkButton}
            >
              <Text style={styles.openLinkText}>Open video</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </SafeAreaView>
    </Modal>
  );
}
