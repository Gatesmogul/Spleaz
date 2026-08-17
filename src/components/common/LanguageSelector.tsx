import React, { useState } from 'react';
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from 'react-native';

// ==========================================
// 1. TYPES & INTERFACES
// ==========================================

export interface LanguageOption {
  code: string; // e.g., 'en', 'fr', 'es'
  name: string; // e.g., 'English', 'Français', 'Español'
  flag: string; // Emoji flag or icon indicator
}

export interface LanguageSelectorProps {
  /**
   * Currently active language code (e.g., 'en')
   */
  currentLanguage?: string;
  /**
   * Callback fired when a new language is selected
   */
  onSelectLanguage?: (languageCode: string) => void;
  /**
   * List of supported languages. Defaults to English, French, and Spanish.
   */
  languages?: LanguageOption[];
  /**
   * Visual layout style mode
   * - 'modal': Triggers a slide-up selection modal (Ideal for Header/Profile)
   * - 'inline': Displays inline horizontal option chips
   * @default 'modal'
   */
  variant?: 'modal' | 'inline';
  /**
   * Label title displayed on top of selector or modal header
   */
  label?: string;
  /**
   * Custom container style overrides
   */
  containerStyle?: ViewStyle;
}

// Default supported languages for Spleaz
const DEFAULT_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
];

// ==========================================
// 2. COMPONENT IMPLEMENTATION
// ==========================================

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLanguage = 'en',
  onSelectLanguage,
  languages = DEFAULT_LANGUAGES,
  variant = 'modal',
  label = 'Select Preferred Language',
  containerStyle,
}) => {
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const activeLangOption =
    languages.find((lang) => lang.code === currentLanguage) || languages[0];

  const handleSelect = (code: string) => {
    if (onSelectLanguage) {
      onSelectLanguage(code);
    }
    setModalVisible(false);
  };

  // ------------------------------------------
  // INLINE VARIANT
  // ------------------------------------------
  if (variant === 'inline') {
    return (
      <View style={[styles.inlineWrapper, containerStyle]}>
        {label ? <Text style={styles.inlineLabel}>{label}</Text> : null}
        <View style={styles.chipContainer}>
          {languages.map((lang) => {
            const isSelected = lang.code === currentLanguage;
            return (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.chip,
                  isSelected ? styles.chipSelected : styles.chipUnselected,
                ]}
                onPress={() => handleSelect(lang.code)}
                activeOpacity={0.7}
              >
                <Text style={styles.flagText}>{lang.flag}</Text>
                <Text
                  style={[
                    styles.chipText,
                    isSelected ? styles.chipTextSelected : styles.chipTextUnselected,
                  ]}
                >
                  {lang.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  }

  // ------------------------------------------
  // MODAL VARIANT
  // ------------------------------------------
  return (
    <View style={containerStyle}>
      {/* Trigger Button */}
      <TouchableOpacity
        style={styles.triggerButton}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <View style={styles.triggerContent}>
          <Text style={styles.flagText}>{activeLangOption.flag}</Text>
          <Text style={styles.triggerText}>{activeLangOption.name}</Text>
        </View>
        <Text style={styles.chevronIcon}>▼</Text>
      </TouchableOpacity>

      {/* Selection Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                {/* Modal Header */}
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{label}</Text>
                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={styles.closeIcon}>✕</Text>
                  </TouchableOpacity>
                </View>

                {/* Languages List */}
                <FlatList
                  data={languages}
                  keyExtractor={(item) => item.code}
                  renderItem={({ item }) => {
                    const isSelected = item.code === currentLanguage;
                    return (
                      <TouchableOpacity
                        style={[
                          styles.languageItem,
                          isSelected && styles.languageItemSelected,
                        ]}
                        onPress={() => handleSelect(item.code)}
                        activeOpacity={0.6}
                      >
                        <View style={styles.languageItemLeft}>
                          <Text style={styles.flagTextLarge}>{item.flag}</Text>
                          <Text
                            style={[
                              styles.languageItemText,
                              isSelected && styles.languageItemTextSelected,
                            ]}
                          >
                            {item.name}
                          </Text>
                        </View>
                        {isSelected && <Text style={styles.checkmark}>✓</Text>}
                      </TouchableOpacity>
                    );
                  }}
                  ItemSeparatorComponent={() => <View style={styles.separator} />}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

// ==========================================
// 3. STYLESHEET
// ==========================================

const styles = StyleSheet.create({
  // Trigger Button
  triggerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  triggerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flagText: {
    fontSize: 16,
    marginRight: 8,
  },
  flagTextLarge: {
    fontSize: 20,
    marginRight: 12,
  },
  triggerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  chevronIcon: {
    fontSize: 10,
    color: '#64748B',
  },

  // Modal Overlay & Layout
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 32,
    paddingHorizontal: 20,
    maxHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  closeIcon: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '600',
  },

  // Language List Item
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  languageItemSelected: {
    backgroundColor: '#F1F5F9',
  },
  languageItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageItemText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#334155',
  },
  languageItemTextSelected: {
    fontWeight: '700',
    color: '#0F172A',
  },
  checkmark: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  separator: {
    height: 1,
    backgroundColor: '#F8FAFC',
  },

  // Inline Variant
  inlineWrapper: {
    width: '100%',
  },
  inlineLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipSelected: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  chipUnselected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  chipTextUnselected: {
    color: '#475569',
  },
});

export default LanguageSelector;