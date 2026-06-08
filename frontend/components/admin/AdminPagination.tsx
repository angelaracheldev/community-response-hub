import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { adminPaginationStyles as styles } from '../../styles/admin/pagination';

type Props = {
  page: number;
  total: number;
  pageSize: number;
  onPrev: () => void;
  onNext: () => void;
};

export function AdminPagination({ page, total, pageSize, onPrev, onNext }: Props) {
  const totalPages = Math.max(1, Math.ceil((total || 0) / pageSize));
  const canPrev = page > 1;
  const canNext = page * pageSize < (total || 0);

  return (
    <View style={styles.row}>
      <TouchableOpacity
        disabled={!canPrev}
        onPress={onPrev}
        style={[styles.btn, !canPrev && styles.btnDisabled]}
      >
        <Text style={styles.btnText}>Prev</Text>
      </TouchableOpacity>
      <Text style={styles.pageText}>
        {page} / {totalPages}
      </Text>
      <TouchableOpacity
        disabled={!canNext}
        onPress={onNext}
        style={[styles.btn, !canNext && styles.btnDisabled]}
      >
        <Text style={styles.btnText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
}


