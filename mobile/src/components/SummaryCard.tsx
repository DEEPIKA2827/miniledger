import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LedgerSummary } from '../types';

interface SummaryCardProps {
  summary: LedgerSummary | null;
  isLoading: boolean;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ summary, isLoading }) => {
  const totalLent = summary?.totalLent ?? 0;
  const totalRepaid = summary?.totalRepaid ?? 0;
  const totalOverdue = summary?.totalOverdue ?? 0;
  const activeCount = summary?.activeLoanCount ?? 0;
  const settledCount = summary?.settledLoanCount ?? 0;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>LEDGER SUMMARY</Text>
        <Text style={styles.subtitle}>
          {activeCount} active · {settledCount} settled
        </Text>
      </View>

      <View style={styles.metricsRow}>
        {/* Total Lent */}
        <View style={[styles.metricBox, styles.lentBox]}>
          <Text style={styles.metricLabel}>Total Lent</Text>
          <Text style={[styles.metricValue, styles.lentValue]}>
            ₹{totalLent.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
          </Text>
        </View>

        {/* Total Repaid */}
        <View style={[styles.metricBox, styles.repaidBox]}>
          <Text style={styles.metricLabel}>Total Repaid</Text>
          <Text style={[styles.metricValue, styles.repaidValue]}>
            ₹{totalRepaid.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
          </Text>
        </View>

        {/* Overdue */}
        <View style={[styles.metricBox, totalOverdue > 0 ? styles.overdueBoxUrgent : styles.overdueBoxClean]}>
          <Text style={styles.metricLabel}>Overdue</Text>
          <Text
            style={[
              styles.metricValue,
              totalOverdue > 0 ? styles.overdueValueUrgent : styles.overdueValueClean,
            ]}
          >
            ₹{totalOverdue.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  metricBox: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '800',
  },
  lentBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  lentValue: {
    color: '#0F172A',
  },
  repaidBox: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  repaidValue: {
    color: '#16A34A',
  },
  overdueBoxClean: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  overdueValueClean: {
    color: '#64748B',
  },
  overdueBoxUrgent: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  overdueValueUrgent: {
    color: '#DC2626',
  },
});
