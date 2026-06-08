import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { adminListStyles as s } from '../../styles/admin/list';
import { userDetailModalStyles as mStyles } from '../../styles/admin/userDetailModal';
import { useAppLayout } from '../../hooks/useAppLayout';
import { colors } from '../../styles/theme';
import { API_BASE } from '../../utils/apiConfig';
import { getAuthToken } from '../../utils/sessionAuth';
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
  compact,
}: {
  label: string;
  value: string;
  desktop?: boolean;
  compact?: boolean;
}) {
  return (
    <View style={[mStyles.detailField, desktop && mStyles.detailFieldDesktop, compact && mStyles.detailFieldMobile]}>
      <Text style={[mStyles.detailFieldLabel, compact && mStyles.detailFieldLabelMobile]}>{label}</Text>
      <Text style={[mStyles.detailFieldValue, compact && mStyles.detailFieldValueMobile]}>{value}</Text>
    </View>
  );
}

function StatusBadge({
  label,
  tone,
  compact,
}: {
  label: string;
  tone: 'success' | 'warning' | 'danger' | 'neutral';
  compact?: boolean;
}) {
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
    <View style={[mStyles.badge, badgeStyle, compact && mStyles.badgeMobile]}>
      <Text style={[mStyles.badgeText, textStyle, compact && mStyles.badgeTextMobile]}>{label}</Text>
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
  const [token, setToken] = useState<string | null>(null);
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

  useEffect(() => {
    void getAuthToken().then(setToken);
  }, []);

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
      return <ActivityIndicator color={colors.primary} style={{ marginVertical: 24 }} />;
    }

    const verificationTone =
      status === 'approved' ? 'success' : status === 'rejected' ? 'danger' : status === 'pending' ? 'warning' : 'neutral';

    return (
      <View style={!isDesktop ? mStyles.mobileContent : undefined}>
        <View style={[mStyles.bodyLayout, isDesktop && mStyles.bodyLayoutDesktop, !isDesktop && mStyles.bodyLayoutMobile]}>
          <View style={[mStyles.infoPanel, isDesktop && mStyles.infoPanelDesktop, !isDesktop && mStyles.infoPanelMobile]}>
            <Text style={[mStyles.panelTitle, !isDesktop && mStyles.panelTitleMobile]}>Profile</Text>
            <View
              style={[
                mStyles.detailGrid,
                isDesktop && mStyles.detailGridDesktop,
                !isDesktop && mStyles.detailGridMobile,
              ]}
            >
              <DetailField compact={!isDesktop} desktop={isDesktop} label="User Code" value={user.user_code} />
              <DetailField
                compact={!isDesktop}
                desktop={isDesktop}
                label="Full Name"
                value={`${user.first_name} ${user.last_name}`}
              />
              <DetailField compact={!isDesktop} desktop={isDesktop} label="Email" value={user.email} />
              <DetailField compact={!isDesktop} desktop={isDesktop} label="Phone" value={user.phone_number || '-'} />
              <DetailField compact={!isDesktop} desktop={isDesktop} label="Address" value={user.address || '-'} />
              <DetailField
                compact={!isDesktop}
                desktop={isDesktop}
                label="Verification Type"
                value={user.verification_type || '-'}
              />
            </View>

            <View style={[mStyles.statusRow, !isDesktop && mStyles.statusRowMobile]}>
              <StatusBadge
                compact={!isDesktop}
                label={user.is_verified ? 'Verified' : 'Not Verified'}
                tone={user.is_verified ? 'success' : 'neutral'}
              />
              <StatusBadge
                compact={!isDesktop}
                label={user.is_active ? 'Active' : 'Inactive'}
                tone={user.is_active ? 'success' : 'warning'}
              />
              <StatusBadge
                compact={!isDesktop}
                label={user.verification_status || 'Unknown'}
                tone={verificationTone}
              />
            </View>
          </View>

          <View
            style={[
              mStyles.documentSection,
              isDesktop && mStyles.documentSectionDesktop,
              !isDesktop && mStyles.documentSectionMobile,
            ]}
          >
            <Text style={[mStyles.documentTitle, !isDesktop && mStyles.documentTitleMobile]}>
              Uploaded ID / Verification Document
            </Text>
            {user.document_url ? (
              <Image
                source={{ uri: user.document_url }}
                style={[
                  isDesktop ? mStyles.documentImage : mStyles.documentThumbnail,
                  isDesktop && mStyles.documentImageDesktop,
                ]}
                resizeMode="contain"
              />
            ) : (
              <Text style={mStyles.noDocument}>No verification document uploaded.</Text>
            )}
          </View>
        </View>

        <View style={[mStyles.actions, isDesktop && mStyles.actionsDesktop, !isDesktop && mStyles.actionsMobile, !isDesktop && mStyles.mobileActions]}>
          {showAcceptReject ? (
            <>
              <TouchableOpacity
                style={[
                  mStyles.btn,
                  isDesktop && mStyles.btnDesktop,
                  !isDesktop && mStyles.btnMobile,
                  mStyles.acceptBtn,
                ]}
                onPress={() => {
                  setConfirmKind('accept');
                  setConfirmOpen(true);
                }}
                disabled={actionLoading}
              >
                <Text style={[mStyles.btnText, !isDesktop && mStyles.btnTextMobile]}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  mStyles.btn,
                  isDesktop && mStyles.btnDesktop,
                  !isDesktop && mStyles.btnMobile,
                  mStyles.rejectBtn,
                ]}
                onPress={() => {
                  setRejectReason('');
                  setRejectReasonOpen(false);
                  setRejectOpen(true);
                }}
                disabled={actionLoading}
              >
                <Text style={[mStyles.btnText, !isDesktop && mStyles.btnTextMobile]}>Reject</Text>
              </TouchableOpacity>
            </>
          ) : null}

          <TouchableOpacity
            style={[
              mStyles.btn,
              isDesktop && mStyles.btnDesktop,
              !isDesktop && mStyles.btnMobile,
              user.is_active ? mStyles.deactivateBtn : mStyles.activateBtn,
            ]}
            onPress={() => {
              setConfirmKind(user.is_active ? 'deactivate' : 'activate');
              setConfirmOpen(true);
            }}
            disabled={actionLoading}
          >
            <Text style={[mStyles.btnText, !isDesktop && mStyles.btnTextMobile]}>
              {user.is_active ? 'Deactivate' : 'Activate'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[mStyles.btn, isDesktop && mStyles.btnDesktop, !isDesktop && mStyles.btnMobile, mStyles.closeBtn]}
            onPress={handleClose}
          >
            <Text style={[mStyles.closeBtnText, !isDesktop && mStyles.btnTextMobile]}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
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
          <SafeAreaView style={[s.modalSafe, mStyles.mobileScreen]}>
            <View style={mStyles.mobileHeader}>
              <Text style={mStyles.mobileHeaderTitle}>User Details</Text>
            </View>
            <View style={mStyles.mobileBody}>{renderUserContent()}</View>
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
