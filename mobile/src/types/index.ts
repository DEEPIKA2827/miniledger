export interface User {
  id: string;
  phone: string;
}

export interface Loan {
  id: string;
  friendName: string;
  amount: number;
  dueDate: string;
  isRepaid: boolean;
  repaidAt: string | null;
  notes: string | null;
  receiptUrl?: string | null;
  isOverdue: boolean;
  createdAt: string;
}

export interface LedgerSummary {
  totalLent: number;
  totalRepaid: number;
  totalOverdue: number;
  activeLoanCount: number;
  settledLoanCount: number;
}

export interface CreateLoanPayload {
  friendName: string;
  amount: number;
  dueDate: string;
  notes?: string;
}
