import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { adminListStyles as s } from '../../styles/admin/list';
import { adminComplaintsStyles as styles } from '../../styles/app/adminComplaints';

type Option = { label: string; value: string };

type Props = {
  value: string;
  onValueChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
  compact?: boolean;
  overlayDropdown?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export default function AdminSelect({
  value,
  onValueChange,
  options,
  placeholder = 'Select...',
  disabled = false,
  compact = false,
  overlayDropdown = true,
  open: controlledOpen,
  onOpenChange,
}: Props) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const setOpen = (next: boolean) => {
    if (isControlled) {
      onOpenChange?.(next);
    } else {
      setInternalOpen(next);
    }
  };

  const selected = options.find((option) => option.value === value);
  const display = value && selected ? selected.label : placeholder;
  const showPlaceholder = !value;
  const useOverlayPanel = compact && overlayDropdown;
  const needsScroll = useOverlayPanel ? options.length > 4 : compact && options.length > 8;

  const renderOptions = () =>
    options.map((option, index) => {
      const isSelected = option.value === value;
      const isLast = index === options.length - 1;
      return (
        <TouchableOpacity
          key={option.value || '__placeholder__'}
          style={[
            s.modalDetailSelectOption,
            compact && styles.filterSelectOption,
            compact && isLast && styles.filterSelectOptionLast,
            isSelected && s.modalDetailSelectOptionSelected,
          ]}
          onPress={() => {
            onValueChange(option.value);
            setOpen(false);
          }}
        >
          <Text
            style={[
              s.modalDetailSelectOptionText,
              isSelected && s.modalDetailSelectOptionTextSelected,
            ]}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      );
    });

  return (
    <View
      style={[
        s.modalDetailSelectWrap,
        compact && styles.filterSelectWrap,
        useOverlayPanel && open && styles.filterSelectWrapOpen,
        compact && useOverlayPanel && { overflow: 'visible' as const },
        compact && !useOverlayPanel && styles.filterSelectWrapInline,
      ]}
    >
      <TouchableOpacity
        style={[
          s.modalDetailSelectTrigger,
          compact && styles.filterSelectTrigger,
          disabled && s.modalDetailSelectTriggerDisabled,
        ]}
        onPress={() => !disabled && setOpen(!open)}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityState={{ expanded: open, disabled }}
      >
        <Text
          style={[s.modalDetailSelectText, showPlaceholder && s.modalDetailSelectPlaceholder]}
          numberOfLines={1}
        >
          {display}
        </Text>
        <Text style={s.modalDetailSelectChevron}>{open ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {open && !disabled ? (
        <View
          style={[
            compact ? styles.filterSelectOptionsPanel : s.modalDetailSelectOptions,
            useOverlayPanel && styles.filterSelectOptions,
            compact && !overlayDropdown && styles.filterSelectOptionsInline,
          ]}
        >
          {needsScroll ? (
            <ScrollView
              nestedScrollEnabled
              keyboardShouldPersistTaps="handled"
              style={useOverlayPanel ? styles.filterSelectScroll : styles.filterSelectScrollInline}
            >
              {renderOptions()}
            </ScrollView>
          ) : (
            renderOptions()
          )}
        </View>
      ) : null}
    </View>
  );
}
