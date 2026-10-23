import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface StatusBadgeProps {
  isRepaid: boolean;
  isOverdue: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ isRepaid, isOverdue }) => {
  if (isRepaid) {
    return (
      <View style={[styles.badge, styles.repaidBadge]}>
        <Text style={[styles.badgeText, styles.repaidText]}>SETTLED</Text>
      </View>
    );
  }

  if (isOverdue) {
    return (
      <View style={[styles.badge, styles.overdueBadge]}>
        <Text style={[styles.badgeText, styles.overdueText]}>OVERDUE</Text>
      </View>
    );
  }

  return (
    <View style={[styles.badge, styles.pendingBadge]}>
      <Text style={[styles.badgeText, styles.pendingText]}>ACTIVE</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  repaidBadge: {
    backgroundColor: '#ECFDF5',
  },
  repaidText: {
    color: '#059669',
  },
  overdueBadge: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  overdueText: {
    color: '#DC2626',
  },
  pendingBadge: {
    backgroundColor: '#F1F5F9',
  },
  pendingText: {
    color: '#475569',
  },
});
