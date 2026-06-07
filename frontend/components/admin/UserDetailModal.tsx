import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { adminListStyles as s } from './adminListStyles';
import { useAppLayout } from '../../hooks/useAppLayout';
import { API_BASE } from '../../utils/apiConfig';
import { getAdminToken } from '../../utils/authStorage';
import { VerificationUser } from './userTypes';

const REJECTION_REASONS = [
  'Address does not match the address shown on the submitted ID.',
  'The uploaded ID is blurry or unreadable. Please upload a clearer copy.',
  'The submitted ID is not a valid government-issued identification document.',
  'The uploaded ID is incomplete or partially visible.',
];

function DetailField({
  label,
  value,
  desktop,
}: {
  label: string;
  value: string;
  desktop?: boolean;
}) {
  return (
    <View style={[mStyles.detailField, desktop && mStyles.detailFieldDesktop]}>
      <Text style={mStyles.detailFieldLabel}>{label}</Text>
      <Text style={mStyles.detailFieldValue}>{value}</Text>
    </View>
  );
}

function StatusBadge({ label, tone }: { label: string; tone: 'success' | 'warning' | 'danger' | 'neutral' }) {
  const badgeStyle =
    tone === 'success'
      ? mStyles.badgeSuccess
      : tone === 'warning'
        ? mStyles.badgeWarning
        : tone === 'danger'
          ? mStyles.badgeDanger
          : mStyles.badgeNeutral;
  const textStyle =
    tone === 'success'
      ? mStyles.badgeTextSuccess
      : tone === 'warning'
        ? mStyles.badgeTextWarning
        : tone === 'danger'
          ? mStyles.badgeTextDanger
          : mStyles.badgeTextNeutral;

  return (
    <View style={[mStyles.badge, badgeStyle]}>
      <Text style={[mStyles.badgeText, textStyle]}>{label}</Text>
    </View>
  );
}

type Props = {
  visible: boolean;
  userId: string | null;
  onClose: () => void;
  onUpdated?: () => void;
  showVerificationActions?: boolean;
};

export function UserDetailModal({
  visible,
  userId,
  onClose,
  onUpdated,
  showVerificationActions = true,
}: Props) {
  const layout = useAppLayout();
  const isDesktop = layout.isDesktop;
  const { height: windowHeight } = useWindowDimensions();
  const desktopScrollMaxHeight = Math.max(windowHeight * 0.92 - 96, 320);
  const token = getAdminToken();
  const [user, setUser] = useState<VerificationUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmKind, setConfirmKind] = useState<'accept' | 'deactivate' | 'activate' | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReasonOpen, setRejectReasonOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [successOpen, setSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const requestOptions = useCallback(
    () => ({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }),
    [token]
  );

  const loadUser = useCallback(async () => {
    if (!token || !userId) return;
    setLoading(true);
    setUser(null);
    try {
      const res = await fetch(`${API_BASE}/users/${userId}`, requestOptions());
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Unable to load user details');
      setUser(data.user || null);
    } catch (e) {
      console.error('Load user details error:', e);
    } finally {
      setLoading(false);
    }
  }, [token, userId, requestOptions]);

  useEffect(() => {
    if (visible && userId) {
      loadUser();
    } else {
      setUser(null);
    }
  }, [visible, userId, loadUser]);

  const closeRejectModal = () => {
    setRejectOpen(false);
    setRejectReasonOpen(false);
    setRejectReason('');
  };

  const handleClose = () => {
    setConfirmOpen(false);
    closeRejectModal();
    onClose();
  };

  const refreshAfterAction = async (message: string, closeDetail = false) => {
    setSuccessMessage(message);
    setSuccessOpen(true);
    onUpdated?.();
    if (closeDetail) {
      handleClose();
    } else if (userId) {
      await loadUser();
    }
  };

  const runConfirmAction = async () => {
    if (!token || !user || !confirmKind) return;
    setActionLoading(true);
    try {
      if (confirmKind === 'accept') {
        const res = await fetch(`${API_BASE}/users/${user.user_id}/verification/review`, {
          method: 'PATCH',
          ...requestOptions(),
          body: JSON.stringify({ verificationStatus: 'approved' }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Unable to approve verification');
        setConfirmOpen(false);
        setConfirmKind(null);
        await refreshAfterAction('Resident verification accepted successfully.', true);
      } else {
        const action = confirmKind === 'deactivate' ? 'deactivate' : 'activate';
        const res = await fetch(`${API_BASE}/users/${user.user_id}/${action}`, {
          method: 'PATCH',
          ...requestOptions(),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Unable to update user status');
        setConfirmOpen(false);
        setConfirmKind(null);
        await refreshAfterAction(`User ${action}d successfully.`);
      }
    } catch (e) {
      console.error('User action error:', e);
    } finally {
      setActionLoading(false);
    }
  };

  const confirmReject = async () => {
    if (!token || !user || !rejectReason) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE}/users/${user.user_id}/verification/review`, {
        method: 'PATCH',
        ...requestOptions(),
        body: JSON.stringify({ verificationStatus: 'rejected', remarks: rejectReason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Unable to reject verification');
      closeRejectModal();
      await refreshAfterAction('Resident verification rejected successfully.', true);
    } catch (e) {
      console.error('Reject verification error:', e);
    } finally {
      setActionLoading(false);
    }
  };

  const status = (user?.verification_status || '').toLowerCase();
  const isPending = status === 'pending';
  const showAcceptReject =
    showVerificationActions && user?.role_id === 1 && isPending;

  const confirmTitle =
    confirmKind === 'accept'
      ? 'Accept Verification?'
      : confirmKind === 'deactivate'
        ? 'Deactivate User?'
        : 'Activate User?';

  const confirmMessage =
    confirmKind === 'accept'
      ? 'Are you sure you want to approve this resident\'s verification request?'
      : confirmKind === 'deactivate'
        ? `Deactivate ${user?.first_name} ${user?.last_name}? They will not be able to sign in.`
        : `Activate ${user?.first_name} ${user?.last_name}?`;

  const renderUserContent = () => {
    if (loading || !user) {
      return <ActivityIndicator color="#6366F1" style={{ marginVertical: 24 }} />;
    }

    const verificationTone =
      status === 'approved' ? 'success' : status === 'rejected' ? 'danger' : status === 'pending' ? 'warning' : 'neutral';

    return (
      <>
        <View style={[mStyles.bodyLayout, isDesktop && mStyles.bodyLayoutDesktop]}>
          <View style={[mStyles.infoPanel, isDesktop && mStyles.infoPanelDesktop]}>
            <Text style={mStyles.panelTitle}>Profile</Text>
            <View style={[mStyles.detailGrid, isDesktop && mStyles.detailGridDesktop]}>
              <DetailField desktop={isDesktop} label="User Code" value={user.user_code} />
              <DetailField desktop={isDesktop} label="Full Name" value={`${user.first_name} ${user.last_name}`} />
              <DetailField desktop={isDesktop} label="Email" value={user.email} />
              <DetailField desktop={isDesktop} label="Phone" value={user.phone_number || '-'} />
              <DetailField desktop={isDesktop} label="Address" value={user.address || '-'} />
              <DetailField desktop={isDesktop} label="Verification Type" value={user.verification_type || '-'} />
            </View>

            <View style={mStyles.statusRow}>
              <StatusBadge label={user.is_verified ? 'Verified' : 'Not Verified'} tone={user.is_verified ? 'success' : 'neutral'} />
              <StatusBadge label={user.is_active ? 'Active' : 'Inactive'} tone={user.is_active ? 'success' : 'warning'} />
              <StatusBadge
                label={user.verification_status || 'Unknown'}
                tone={verificationTone}
              />
            </View>
          </View>

          <View style={[mStyles.documentSection, isDesktop && mStyles.documentSectionDesktop]}>
            <Text style={mStyles.documentTitle}>Uploaded ID / Verification Document</Text>
            {user.document_url ? (
              <Image
                source={{ uri: user.document_url }}
                style={[mStyles.documentImage, isDesktop && mStyles.documentImageDesktop]}
                resizeMode="contain"
              />
            ) : (
              <Text style={mStyles.noDocument}>No verification document uploaded.</Text>
            )}
          </View>
        </View>

        <View style={[mStyles.actions, isDesktop && mStyles.actionsDesktop]}>
          {showAcceptReject ? (
            <>
              <TouchableOpacity
                style={[mStyles.btn, isDesktop && mStyles.btnDesktop, mStyles.acceptBtn]}
                onPress={() => {
                  setConfirmKind('accept');
                  setConfirmOpen(true);
                }}
                disabled={actionLoading}
              >
                <Text style={mStyles.btnText}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[mStyles.btn, isDesktop && mStyles.btnDesktop, mStyles.rejectBtn]}
                onPress={() => {
                  setRejectReason('');
                  setRejectReasonOpen(false);
                  setRejectOpen(true);
                }}
                disabled={actionLoading}
              >
                <Text style={mStyles.btnText}>Reject</Text>
              </TouchableOpacity>
            </>
          ) : null}

          <TouchableOpacity
            style={[
              mStyles.btn,
              isDesktop && mStyles.btnDesktop,
              user.is_active ? mStyles.deactivateBtn : mStyles.activateBtn,
            ]}
            onPress={() => {
              setConfirmKind(user.is_active ? 'deactivate' : 'activate');
              setConfirmOpen(true);
            }}
            disabled={actionLoading}
          >
            <Text style={mStyles.btnText}>{user.is_active ? 'Deactivate' : 'Activate'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[mStyles.btn, isDesktop && mStyles.btnDesktop, mStyles.closeBtn]}
            onPress={handleClose}
          >
            <Text style={mStyles.closeBtnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  };

  return (
    <>
      <Modal
        visible={visible}
        transparent={isDesktop}
        animationType={isDesktop ? 'fade' : 'slide'}
        onRequestClose={handleClose}
      >
        {isDesktop ? (
          <View style={mStyles.backdrop}>
            <View style={mStyles.detailDialog}>
              <View style={mStyles.detailHeader}>
                <View>
                  <Text style={mStyles.detailTitle}>User Details</Text>
                  {user ? (
                    <Text style={mStyles.detailSubtitle}>
                      {user.first_name} {user.last_name} · {user.user_code}
                    </Text>
                  ) : null}
                </View>
                <TouchableOpacity style={mStyles.headerCloseBtn} onPress={handleClose} accessibilityLabel="Close">
                  <Text style={mStyles.headerCloseText}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScrollView
                style={[mStyles.detailScroll, { maxHeight: desktopScrollMaxHeight }]}
                contentContainerStyle={mStyles.detailContent}
                showsVerticalScrollIndicator={false}
              >
                {renderUserContent()}
              </ScrollView>
            </View>
          </View>
        ) : (
          <SafeAreaView style={s.modalSafe}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>User Details</Text>
            </View>
            <ScrollView style={s.modalScroll} contentContainerStyle={s.modalContent}>
              {renderUserContent()}
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>

      <Modal visible={confirmOpen} transparent animationType="fade" onRequestClose={() => setConfirmOpen(false)}>
        <View style={mStyles.backdrop}>
          <View style={mStyles.dialog}>
            <Text style={mStyles.dialogTitle}>{confirmTitle}</Text>
            <Text style={mStyles.dialogMessage}>{confirmMessage}</Text>
            <View style={mStyles.dialogActions}>
              <TouchableOpacity
                style={[mStyles.dialogBtn, mStyles.dialogBtnCancel]}
                onPress={() => {
                  setConfirmOpen(false);
                  setConfirmKind(null);
                }}
                disabled={actionLoading}
              >
                <Text style={mStyles.dialogBtnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[mStyles.dialogBtn, mStyles.dialogBtnConfirm]}
                onPress={runConfirmAction}
                disabled={actionLoading}
              >
                <Text style={mStyles.btnText}>{actionLoading ? 'Saving...' : 'Confirm'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={rejectOpen} transparent animationType="fade" onRequestClose={closeRejectModal}>
        <View style={mStyles.backdrop}>
          <View style={mStyles.dialog}>
            <Text style={mStyles.dialogTitle}>Reject Verification</Text>
            <Text style={mStyles.dialogMessage}>Please select a reason before rejecting.</Text>
            <View style={mStyles.selectWrap}>
              <TouchableOpacity
                style={mStyles.selectTrigger}
                onPress={() => setRejectReasonOpen((open) => !open)}
                accessibilityRole="button"
                accessibilityState={{ expanded: rejectReasonOpen }}
              >
                <Text
                  style={[mStyles.selectTriggerText, !rejectReason && mStyles.selectPlaceholder]}
                  numberOfLines={2}
                >
                  {rejectReason || 'Select rejection reason'}
                </Text>
                <Text style={mStyles.selectChevron}>{rejectReasonOpen ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              {rejectReasonOpen ? (
                <View style={mStyles.selectOptions}>
                  {REJECTION_REASONS.map((reason) => {
                    const selected = rejectReason === reason;
                    return (
                      <TouchableOpacity
                        key={reason}
                        style={[mStyles.selectOption, selected && mStyles.selectOptionSelected]}
                        onPress={() => {
                          setRejectReason(reason);
                          setRejectReasonOpen(false);
                        }}
                      >
                        <Text style={[mStyles.selectOptionText, selected && mStyles.selectOptionTextSelected]}>
                          {reason}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : null}
            </View>
            <View style={mStyles.dialogActions}>
              <TouchableOpacity
                style={[mStyles.dialogBtn, mStyles.dialogBtnCancel]}
                onPress={closeRejectModal}
                disabled={actionLoading}
              >
                <Text style={mStyles.dialogBtnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[mStyles.dialogBtn, mStyles.rejectBtn, !rejectReason && mStyles.btnDisabled]}
                onPress={confirmReject}
                disabled={!rejectReason || actionLoading}
              >
                <Text style={mStyles.btnText}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={successOpen} transparent animationType="fade" onRequestClose={() => setSuccessOpen(false)}>
        <View style={mStyles.backdrop}>
          <View style={mStyles.dialog}>
            <Text style={mStyles.successTitle}>Success</Text>
            <Text style={mStyles.dialogMessage}>{successMessage}</Text>
            <TouchableOpacity
              style={[mStyles.dialogBtn, mStyles.dialogBtnConfirm, { width: '100%' }]}
              onPress={() => setSuccessOpen(false)}
            >
              <Text style={mStyles.btnText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const mStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 20,
  },
  detailDialog: {
    width: '100%',
    maxWidth: 960,
    maxHeight: '92%',
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  detailSubtitle: {
    marginTop: 4,
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  headerCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  headerCloseText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '700',
  },
  detailScroll: {
    flexGrow: 0,
  },
  detailContent: {
    padding: 24,
  },
  bodyLayout: {
    gap: 16,
  },
  bodyLayoutDesktop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 20,
  },
  infoPanel: {
    gap: 12,
  },
  infoPanelDesktop: {
    flex: 1,
    minWidth: 0,
  },
  panelTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  detailGrid: {
    gap: 10,
  },
  detailGridDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailField: {
    gap: 4,
  },
  detailFieldDesktop: {
    width: '48%',
    minWidth: 180,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  detailFieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  detailFieldValue: {
    fontSize: 14,
    lineHeight: 20,
    color: '#111827',
    fontWeight: '600',
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeSuccess: { backgroundColor: '#DCFCE7' },
  badgeWarning: { backgroundColor: '#FEF3C7' },
  badgeDanger: { backgroundColor: '#FEE2E2' },
  badgeNeutral: { backgroundColor: '#F3F4F6' },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  badgeTextSuccess: { color: '#166534' },
  badgeTextWarning: { color: '#92400E' },
  badgeTextDanger: { color: '#991B1B' },
  badgeTextNeutral: { color: '#374151' },
  documentSection: {
    marginTop: 16,
    marginBottom: 8,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  documentSectionDesktop: {
    flex: 1,
    minWidth: 0,
    marginTop: 0,
    marginBottom: 0,
  },
  documentTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  documentImage: {
    width: '100%',
    height: 280,
    borderRadius: 10,
    backgroundColor: '#E5E7EB',
  },
  documentImageDesktop: {
    height: 360,
  },
  noDocument: {
    color: '#6B7280',
    fontStyle: 'italic',
    paddingVertical: 24,
    textAlign: 'center',
  },
  actions: {
    gap: 10,
    marginTop: 16,
  },
  actionsDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  btn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnDesktop: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    minWidth: 120,
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  acceptBtn: { backgroundColor: '#10B981' },
  rejectBtn: { backgroundColor: '#EF4444' },
  deactivateBtn: { backgroundColor: '#F59E0B' },
  activateBtn: { backgroundColor: '#3B82F6' },
  closeBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  closeBtnText: { color: '#374151', fontWeight: '700', fontSize: 14 },
  dialog: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
  },
  dialogTitle: { fontSize: 18, fontWeight: '800', marginBottom: 8, color: '#111827' },
  successTitle: { fontSize: 18, fontWeight: '800', marginBottom: 8, color: '#10B981' },
  dialogMessage: { marginBottom: 16, color: '#374151', lineHeight: 20 },
  dialogActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  dialogBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    minWidth: 88,
    alignItems: 'center',
  },
  dialogBtnCancel: { backgroundColor: '#F3F4F6' },
  dialogBtnCancelText: { color: '#374151', fontWeight: '700' },
  dialogBtnConfirm: { backgroundColor: '#10B981' },
  btnDisabled: { opacity: 0.5 },
  selectWrap: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    marginBottom: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  selectTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  selectTriggerText: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    lineHeight: 20,
  },
  selectPlaceholder: {
    color: '#6B7280',
  },
  selectChevron: {
    fontSize: 12,
    color: '#6B7280',
  },
  selectOptions: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  selectOption: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  selectOptionSelected: {
    backgroundColor: '#EEF2FF',
  },
  selectOptionText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  selectOptionTextSelected: {
    color: '#4338CA',
    fontWeight: '700',
  },
});
