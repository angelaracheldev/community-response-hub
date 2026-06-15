import React from 'react';
import { Image, Modal, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ResizeMode, Video } from 'expo-av';
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
          <Video
            source={{ uri: media.media_url }}
            style={styles.media}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
          />
        ) : null}
      </SafeAreaView>
    </Modal>
  );
}
