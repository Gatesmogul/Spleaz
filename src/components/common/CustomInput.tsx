import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

// ==========================================
// 1. TYPES & INTERFACES
// ==========================================

export interface CustomInputProps extends TextInputProps {
  /**
   * Field label displayed above the input box
   */
  label?: string;
  /**
   * Error message displayed below the input box (triggers red error border)
   */
  error?: string;
  /**
   * Helper or hint text displayed below the input when there is no error
   */
  helperText?: string;
  /**
   * Icon element displayed inside the input on the left
   */
  leftIcon?: React.ReactNode;
  /**
   * Icon element displayed inside the input on the right
   */
  rightIcon?: React.ReactNode;
  /**
   * Custom container style overrides
   */
  containerStyle?: ViewStyle;
  /**
   * Custom input box style overrides
   */
  inputContainerStyle?: ViewStyle;
  /**
   * Custom text style overrides for the TextInput
   */
  inputStyle?: TextStyle;
  /**
   * Custom label text style overrides
   */
  labelStyle?: TextStyle;
  /**
   * Shows a clear button on the right when there is text
   * @default false
   */
  showClearButton?: boolean;
  /**
   * Function called when the clear button is pressed
   */
  onClear?: () => void;
}

// ==========================================
// 2. COMPONENT IMPLEMENTATION
// ==========================================

export const CustomInput: React.FC<CustomInputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  containerStyle,
  inputContainerStyle,
  inputStyle,
  labelStyle,
  secureTextEntry,
  showClearButton = false,
  onClear,
  value,
  onChangeText,
  onFocus,
  onBlur,
  editable = true,
  placeholderTextColor = '#94A3B8',
  ...restProps
}) => {
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(!secureTextEntry);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  // Determine border color based on state priority: Error > Focus > Default
  const getBorderColor = (): string => {
    if (error) return '#EF4444'; // Red
    if (isFocused) return '#0F172A'; // Spleaz Dark Theme Accent
    return '#E2E8F0'; // Slate 200 Border
  };

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {/* Field Label */}
      {label && (
        <Text style={[styles.label, error ? styles.labelError : null, labelStyle]}>
          {label}
        </Text>
      )}

      {/* Input Field Container */}
      <View
        style={[
          styles.inputContainer,
          { borderColor: getBorderColor() },
          !editable && styles.disabledContainer,
          inputContainerStyle,
        ]}
      >
        {/* Left Icon */}
        {leftIcon && <View style={styles.iconContainerLeft}>{leftIcon}</View>}

        {/* Text Input */}
        <TextInput
          style={[
            styles.textInput,
            !editable && styles.disabledTextInput,
            inputStyle,
          ]}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={editable}
          placeholderTextColor={placeholderTextColor}
          secureTextEntry={secureTextEntry ? !isPasswordVisible : false}
          autoCapitalize="none"
          {...restProps}
        />

        {/* Clear Button */}
        {showClearButton && value && value.length > 0 && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onClear}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.clearText}>✕</Text>
          </TouchableOpacity>
        )}

        {/* Password Toggle Button */}
        {secureTextEntry && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={togglePasswordVisibility}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.toggleText}>
              {isPasswordVisible ? 'HIDE' : 'SHOW'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Right Icon (if not password toggle) */}
        {!secureTextEntry && rightIcon && (
          <View style={styles.iconContainerRight}>{rightIcon}</View>
        )}
      </View>

      {/* Error or Helper Message */}
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
};

// ==========================================
// 3. STYLESHEET
// ==========================================

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155', // Slate 700
    marginBottom: 6,
  },
  labelError: {
    color: '#EF4444',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderWidth: 1.5,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
  },
  disabledContainer: {
    backgroundColor: '#F1F5F9', // Slate 100
    borderColor: '#E2E8F0',
  },
  textInput: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: '#0F172A', // Slate 900
    paddingVertical: 0, // Solves Android vertical centering
  },
  disabledTextInput: {
    color: '#94A3B8',
  },
  iconContainerLeft: {
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerRight: {
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton: {
    marginLeft: 8,
    padding: 4,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  clearText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
    marginLeft: 2,
  },
  helperText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    marginLeft: 2,
  },
});

export default CustomInput;