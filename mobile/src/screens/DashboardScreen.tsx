import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  SafeAreaView,
  
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AddLoanModal } from '../components/AddLoanModal';
import { LoanCard } from '../components/LoanCard';
import { SummaryCard } from '../components/SummaryCard';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { CreateLoanPayload, LedgerSummary, Loan } from '../types';

export const DashboardScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [summary, setSummary] = useState<LedgerSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'settled' | 'overdue'>('all');

  const loadData = useCallback(async () => {
    try {
      const [summaryRes, loansRes] = await Promise.all([
        api.getSummary(),
        api.getLoans(),
      ]);

      setSummary(summaryRes.summary);
      setLoans(loansRes.loans);
    } catch (err: any) {
      console.warn('Dashboard fetch error', err);
      Alert.alert('Data Sync Error', err.message || 'Failed to fetch ledger data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  const handleCreateLoan = async (payload: CreateLoanPayload) => {
    await api.createLoan(payload);
    await loadData();
  };

  const handleRepayLoan = async (id: string) => {
    await api.repayLoan(id);
    await loadData();
  };

  // Filtered loans
  const filteredLoans = loans.filter((loan) => {
    if (filter === 'active') return !loan.isRepaid;
    if (filter === 'settled') return loan.isRepaid;
    if (filter === 'overdue') return loan.isOverdue && !loan.isRepaid;
    return true;
  });

  return (
    <SafeAreaView style={styles.container}>
      

      {/* Top App Bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.brandTitle}>MiniLedger</Text>
          <Text style={styles.userPhone}>+91 {user?.phone}</Text>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
      </View>

      {/* Main List */}
      <FlatList
        data={filteredLoans}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={['#2563EB']} />
        }
        ListHeaderComponent={
          <>
            <SummaryCard summary={summary} isLoading={isLoading} />

            {/* Filter Pills */}
            <View style={styles.filterSection}>
              <View style={styles.filterRow}>
                <TouchableOpacity
                  style={[styles.filterPill, filter === 'all' && styles.activeFilterPill]}
                  onPress={() => setFilter('all')}
                >
                  <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>
                    All ({loans.length})
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.filterPill, filter === 'active' && styles.activeFilterPill]}
                  onPress={() => setFilter('active')}
                >
                  <Text style={[styles.filterText, filter === 'active' && styles.activeFilterText]}>
                    Active ({loans.filter((l) => !l.isRepaid).length})
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.filterPill, filter === 'overdue' && styles.activeFilterPill]}
                  onPress={() => setFilter('overdue')}
                >
                  <Text style={[styles.filterText, filter === 'overdue' && styles.activeFilterText]}>
                    Overdue ({loans.filter((l) => l.isOverdue && !l.isRepaid).length})
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.filterPill, filter === 'settled' && styles.activeFilterPill]}
                  onPress={() => setFilter('settled')}
                >
                  <Text style={[styles.filterText, filter === 'settled' && styles.activeFilterText]}>
                    Settled ({loans.filter((l) => l.isRepaid).length})
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.sectionHeader}>ENTRIES ({filteredLoans.length})</Text>
            </View>
          </>
        }
        renderItem={({ item }) => <LoanCard loan={item} onRepay={handleRepayLoan} />}
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.emptyContainer}>
              <ActivityIndicator size="large" color="#2563EB" />
              <Text style={styles.loadingText}>Syncing ledger with server...</Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyTitle}>No Loan Entries Found</Text>
              <Text style={styles.emptyDesc}>
                {filter !== 'all'
                  ? `No ${filter} loans at this time.`
                  : "You haven't added any loan entries yet. Tap below to record your first loan!"}
              </Text>
            </View>
          )
        }
        contentContainerStyle={styles.listContent}
      />

      {/* Floating Add Button */}
      <View style={styles.floatingActionContainer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsModalOpen(true)}
          activeOpacity={0.85}
        >
          <Text style={styles.addButtonIcon}>+</Text>
          <Text style={styles.addButtonText}>Record New Loan</Text>
        </TouchableOpacity>
      </View>

      {/* Add Loan Modal */}
      <AddLoanModal
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateLoan}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topBar: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  userPhone: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  logoutButton: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  logoutButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  listContent: {
    paddingBottom: 100,
  },
  filterSection: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  filterPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activeFilterPill: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  emptyDesc: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: '#64748B',
  },
  floatingActionContainer: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#2563EB',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  addButtonIcon: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 22,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

