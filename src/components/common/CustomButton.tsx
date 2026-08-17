import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewStyle,
} from 'react-native';

// ==========================================
// 1. TYPES & INTERFACES
// ==========================================

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text' | 'danger';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface CustomButtonProps extends TouchableOpacityProps {
  /**
   * Button title text
   */
  title: string;
  /**
   * Action function called on button press
   */
  onPress: () => void;
  /**
   * Visual style variant
   * @default 'primary'
   */
  variant?: ButtonVariant;
  /**
   * Size configuration controlling padding and font sizes
   * @default 'medium'
   */
  size?: ButtonSize;
  /**
   * Shows a loading spinner and disables interaction when true
   * @default false
   */
  isLoading?: boolean;
  /**
   * Disables button interactions and applies disabled styling
   * @default false
   */
  disabled?: boolean;
  /**
   * Optional icon component to render before the title
   */
  leftIcon?: React.ReactNode;
  /**
   * Optional icon component to render after the title
   */
  rightIcon?: React.ReactNode;
  /**
   * Makes the button take up full available width
   * @default true
   */
  fullWidth?: boolean;
  /**
   * Custom container style overrides
   */
  style?: ViewStyle;
  /**
   * Custom text style overrides
   */
  textStyle?: TextStyle;
}

// ==========================================
// 2. COMPONENT IMPLEMENTATION
// ==========================================

export const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  fullWidth = true,
  style,
  textStyle,
  activeOpacity = 0.7,
  ...restProps
}) => {
  const isButtonDisabled = disabled || isLoading;

  // Determine dynamic container styles
  const getContainerStyles = (): ViewStyle[] => {
    const containerStyleList: ViewStyle[] = [
      styles.baseButton,
      styles[`${variant}Container`],
      styles[`${size}Size`],
    ];

    if (fullWidth) {
      containerStyleList.push(styles.fullWidth);
    }

    if (isButtonDisabled) {
      containerStyleList.push(
        variant === 'outline' || variant === 'text'
          ? styles.disabledBorderText
          : styles.disabledContainer
      );
    }

    if (style) {
      containerStyleList.push(style);
    }

    return containerStyleList;
  };

  // Determine dynamic text styles
  const getTextStyles = (): TextStyle[] => {
    const textStyleList: TextStyle[] = [
      styles.baseText,
      styles[`${variant}Text`],
      styles[`${size}Text`],
    ];

    if (isButtonDisabled) {
      textStyleList.push(styles.disabledText);
    }

    if (textStyle) {
      textStyleList.push(textStyle);
    }

    return textStyleList;
  };

  // Determine indicator color based on variant
  const getSpinnerColor = (): string => {
    if (disabled) return '#9CA3AF';
    switch (variant) {
      case 'outline':
      case 'text':
        return '#0F172A';
      case 'secondary':
        return '#0F172A';
      default:
        return '#FFFFFF';
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isButtonDisabled}
      activeOpacity={activeOpacity}
      style={getContainerStyles()}
      {...restProps}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={getSpinnerColor()} />
      ) : (
        <View style={styles.contentContainer}>
          {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
          <Text style={getTextStyles()}>{title}</Text>
          {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
};

// ==========================================
// 3. STYLESHEET
// ==========================================

const styles = StyleSheet.create({
  // Base Layout
  baseButton: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: {
    width: '100%',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Icon Spacing
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },

  // Sizes Padding
  smallSize: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    minHeight: 36,
  },
  mediumSize: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    minHeight: 48,
  },
  largeSize: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    minHeight: 56,
  },

  // Variant Containers
  primaryContainer: {
    backgroundColor: '#0F172A', // Spleaz Dark Theme Primary Color
  },
  secondaryContainer: {
    backgroundColor: '#F1F5F9',
  },
  outlineContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#0F172A',
  },
  textContainer: {
    backgroundColor: 'transparent',
  },
  dangerContainer: {
    backgroundColor: '#EF4444',
  },

  // Disabled Container States
  disabledContainer: {
    backgroundColor: '#E2E8F0',
  },
  disabledBorderText: {
    borderColor: '#CBD5E1',
    backgroundColor: 'transparent',
  },

  // Base Text
  baseText: {
    fontWeight: '600',
    textAlign: 'center',
  },

  // Sizes Font Size
  smallText: {
    fontSize: 13,
  },
  mediumText: {
    fontSize: 15,
  },
  largeText: {
    fontSize: 17,
  },

  // Variant Text Colors
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#0F172A',
  },
  outlineText: {
    color: '#0F172A',
  },
  textText: {
    color: '#0F172A',
  },
  dangerText: {
    color: '#FFFFFF',
  },

  // Disabled Text Color
  disabledText: {
    color: '#9CA3AF',
  },
});

export default CustomButton;