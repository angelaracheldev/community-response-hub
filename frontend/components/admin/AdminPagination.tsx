import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  btn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: '#6366F1',
    borderRadius: 8,
    minWidth: 72,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.45 },
  btnText: { color: '#fff', fontWeight: '700' },
  pageText: { fontWeight: '700', minWidth: 64, textAlign: 'center' },
});
