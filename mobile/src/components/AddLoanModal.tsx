import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { CreateLoanPayload } from '../types';

interface AddLoanModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateLoanPayload) => Promise<void>;
}

export const AddLoanModal: React.FC<AddLoanModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const [friendName, setFriendName] = useState('');
  const [amount, setAmount] = useState('');
  const [daysFromNow, setDaysFromNow] = useState(7);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const calculateDueDate = (days: number): Date => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d;
  };

  const handleCreate = async () => {
    const trimmedName = friendName.trim();
    const parsedAmount = parseFloat(amount.trim());

    if (!trimmedName || trimmedName.length < 2) {
      Alert.alert('Validation Error', 'Friend name must be at least 2 characters');
      return;
    }

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid loan amount greater than 0');
      return;
    }

    const dueDateObj = calculateDueDate(daysFromNow);

    setIsSubmitting(true);
    try {
      await onSubmit({
        friendName: trimmedName,
        amount: parsedAmount,
        dueDate: dueDateObj.toISOString(),
        notes: notes.trim() || undefined,
      });

      // Reset form
      setFriendName('');
      setAmount('');
      setDaysFromNow(7);
      setNotes('');
      onClose();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to add loan entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  const dueDateFormatted = calculateDueDate(daysFromNow).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Add New Loan Entry</Text>
            <TouchableOpacity onPress={onClose} disabled={isSubmitting}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Friend Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Friend's Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Rahul Sharma"
                placeholderTextColor="#94A3B8"
                value={friendName}
                onChangeText={setFriendName}
                autoFocus={true}
              />
            </View>

            {/* Amount */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Amount (₹) *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 1500"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
            </View>

            {/* Quick Due Date Selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Repayment Due Date: {dueDateFormatted}</Text>
              <View style={styles.quickDayRow}>
                {[
                  { label: 'Yesterday (Test Overdue)', days: -1 },
                  { label: '3 Days', days: 3 },
                  { label: '7 Days', days: 7 },
                  { label: '14 Days', days: 14 },
                  { label: '30 Days', days: 30 },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.days}
                    style={[
                      styles.dayPill,
                      daysFromNow === item.days && styles.activeDayPill,
                    ]}
                    onPress={() => setDaysFromNow(item.days)}
                  >
                    <Text
                      style={[
                        styles.dayPillText,
                        daysFromNow === item.days && styles.activeDayPillText,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Optional Notes */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Notes (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="e.g. Lunch bill at Taj, will repay after salary"
                placeholderTextColor="#94A3B8"
                multiline={true}
                numberOfLines={2}
                value={notes}
                onChangeText={setNotes}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleCreate}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Save Loan Entry</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeButton: {
    fontSize: 20,
    fontWeight: '700',
    color: '#64748B',
    padding: 4,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0F172A',
  },
  textArea: {
    height: 64,
    textAlignVertical: 'top',
  },
  quickDayRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  dayPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activeDayPill: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  dayPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  activeDayPillText: {
    color: '#FFFFFF',
  },
  submitButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
