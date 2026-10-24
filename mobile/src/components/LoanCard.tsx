import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Loan } from '../types';
import { StatusBadge } from './StatusBadge';

interface LoanCardProps {
  loan: Loan;
  onRepay: (id: string) => Promise<void>;
}

export const LoanCard: React.FC<LoanCardProps> = ({ loan, onRepay }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const formatDueDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getRelativeDateLabel = () => {
    if (loan.isRepaid) {
      if (loan.repaidAt) {
        return `Settled on ${formatDueDate(loan.repaidAt)}`;
      }
      return 'Settled';
    }

    const now = new Date();
    const due = new Date(loan.dueDate);
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      const pastDays = Math.abs(diffDays);
      return `Overdue by ${pastDays} ${pastDays === 1 ? 'day' : 'days'}`;
    }
    if (diffDays === 0) {
      return 'Due today';
    }
    if (diffDays === 1) {
      return 'Due tomorrow';
    }
    return `Due in ${diffDays} days`;
  };

  const handleRepayPress = () => {
    const executeRepay = async () => {
      setIsUpdating(true);
      try {
        await onRepay(loan.id);
      } catch (err: any) {
        if (Platform.OS === 'web') {
          window.alert(err.message || 'Failed to settle loan');
        } else {
          Alert.alert('Error', err.message || 'Failed to settle loan');
        }
      } finally {
        setIsUpdating(false);
      }
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(
        `Mark as Repaid:\nHas ${loan.friendName} repaid ₹${loan.amount}?`
      );
      if (confirmed) {
        executeRepay();
      }
      return;
    }

    Alert.alert(
      'Mark as Repaid',
      `Has ${loan.friendName} repaid ₹${loan.amount}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Settled',
          style: 'default',
          onPress: executeRepay,
        },
      ]
    );
  };

  const isOverdue = loan.isOverdue && !loan.isRepaid;

  return (
    <View
      style={[
        styles.card,
        isOverdue && styles.overdueCard,
        loan.isRepaid && styles.repaidCard,
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.friendInfo}>
          <Text style={[styles.friendName, loan.isRepaid && styles.mutedText]}>
            {loan.friendName}
          </Text>
          <Text
            style={[
              styles.dateLabel,
              isOverdue ? styles.overdueDateText : styles.normalDateText,
            ]}
          >
            {getRelativeDateLabel()} · {formatDueDate(loan.dueDate)}
          </Text>
        </View>

        <View style={styles.amountContainer}>
          <Text style={[styles.amountText, loan.isRepaid && styles.repaidAmountText]}>
            ₹{loan.amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
          </Text>
          <StatusBadge isRepaid={loan.isRepaid} isOverdue={loan.isOverdue} />
        </View>
      </View>

      {Boolean(loan.notes) && (
        <View style={styles.notesContainer}>
          <Text style={styles.notesText}>{loan.notes}</Text>
        </View>
      )}

      {/* Action Footer */}
      {!loan.isRepaid && (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.repayButton}
            onPress={handleRepayPress}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.repayButtonText}>Mark as Repaid ✓</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  overdueCard: {
    backgroundColor: '#FFFBFB',
    borderColor: '#F87171',
    borderWidth: 1.5,
  },
  repaidCard: {
    backgroundColor: '#FAFAFA',
    borderColor: '#E2E8F0',
    opacity: 0.85,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  friendInfo: {
    flex: 1,
    paddingRight: 12,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  mutedText: {
    color: '#64748B',
    textDecorationLine: 'none',
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  normalDateText: {
    color: '#64748B',
  },
  overdueDateText: {
    color: '#DC2626',
    fontWeight: '700',
  },
  amountContainer: {
    alignItems: 'flex-end',
    gap: 4,
  },
  amountText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  repaidAmountText: {
    color: '#16A34A',
  },
  notesContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  notesText: {
    fontSize: 12,
    color: '#64748B',
    fontStyle: 'italic',
  },
  actionRow: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    alignItems: 'flex-end',
  },
  repayButton: {
    backgroundColor: '#0F172A',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  repayButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
