import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

// ==========================================
// 1. TYPES & INTERFACES
// ==========================================

export interface RatingStarsProps {
  /**
   * Current rating value (1 to maxStars)
   * @default 0
   */
  rating?: number;
  /**
   * Maximum star count
   * @default 5
   */
  maxStars?: number;
  /**
   * Size of each star in pixels
   * @default 28
   */
  starSize?: number;
  /**
   * Active filled star color
   * @default '#F59E0B' (Amber / Gold)
   */
  activeColor?: string;
  /**
   * Inactive star color
   * @default '#E2E8F0' (Slate 200)
   */
  inactiveColor?: string;
  /**
   * If true, star selection is disabled (used for view-only ratings)
   * @default false
   */
  readOnly?: boolean;
  /**
   * Callback fired when a star is selected
   */
  onRatingChange?: (newRating: number) => void;
  /**
   * Shows numerical rating value text next to stars (e.g. "4.8")
   * @default false
   */
  showRatingValue?: boolean;
  /**
   * Custom container style overrides
   */
  containerStyle?: ViewStyle;
}

// ==========================================
// 2. COMPONENT IMPLEMENTATION
// ==========================================

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating = 0,
  maxStars = 5,
  starSize = 28,
  activeColor = '#F59E0B',
  inactiveColor = '#E2E8F0',
  readOnly = false,
  onRatingChange,
  showRatingValue = false,
  containerStyle,
}) => {
  const handleStarPress = (selectedStarIndex: number) => {
    if (!readOnly && onRatingChange) {
      onRatingChange(selectedStarIndex);
    }
  };

  const renderStar = (index: number) => {
    const starNumber = index + 1;
    const isFilled = starNumber <= Math.floor(rating);
    const isHalf = !isFilled && starNumber === Math.ceil(rating) && rating % 1 !== 0;

    const starColor = isFilled || isHalf ? activeColor : inactiveColor;

    return (
      <TouchableOpacity
        key={index}
        disabled={readOnly}
        onPress={() => handleStarPress(starNumber)}
        activeOpacity={0.7}
        style={styles.starWrapper}
        hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
      >
        <Text style={{ fontSize: starSize, color: starColor, lineHeight: starSize + 2 }}>
          {isHalf ? '★' : isFilled ? '★' : '☆'}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.starsRow}>
        {Array.from({ length: maxStars }, (_, index) => renderStar(index))}
      </View>

      {showRatingValue && (
        <Text style={[styles.ratingText, { fontSize: Math.max(12, starSize * 0.5) }]}>
          {rating.toFixed(1)}
        </Text>
      )}
    </View>
  );
};

// ==========================================
// 3. STYLESHEET
// ==========================================

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starWrapper: {
    paddingHorizontal: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 8,
    fontWeight: '700',
    color: '#0F172A',
  },
});

export default RatingStars;