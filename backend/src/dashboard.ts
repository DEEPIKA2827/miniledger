export const dashboardHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>MiniLedger — Personal Debt Tracking</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
          },
          colors: {
            brand: {
              50: '#eef2ff',
              100: '#e0e7ff',
              500: '#6366f1',
              600: '#4f46e5',
              700: '#4338ca',
            }
          }
        }
      }
    }
  </script>
  <style>
    body { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
    .badge-overdue { background: #fee2e2; color: #dc2626; border: 1px solid #fca5a5; }
    .badge-repaid { background: #dcfce7; color: #16a34a; border: 1px solid #86efac; }
    .badge-active { background: #e0e7ff; color: #4338ca; border: 1px solid #a5b4fc; }
  </style>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen flex flex-col antialiased selection:bg-indigo-500 selection:text-white">

  <!-- Navigation -->
  <header class="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-40">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center font-extrabold text-white shadow-lg shadow-indigo-500/20 text-lg">
          ML
        </div>
        <div>
          <div class="flex items-center space-x-2">
            <h1 class="font-bold text-lg text-white tracking-tight">MiniLedger</h1>
            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span> Live on AWS EC2
            </span>
          </div>
          <p class="text-xs text-slate-400 hidden sm:block">CredSetu Internship Assignment · Fastify + PostgreSQL</p>
        </div>
      </div>

      <div class="flex items-center space-x-3 text-sm">
        <a href="https://drive.google.com/file/d/1SWgzR_Q7Q_cQk7c-pcBunu_RfIqN-UAb/view?usp=drivesdk" target="_blank" rel="noreferrer"
           class="inline-flex items-center px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 border border-indigo-500/30 font-medium transition">
          <svg class="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          <span class="hidden md:inline">Watch Demo Video</span>
          <span class="md:hidden">Demo</span>
        </a>
        <a href="https://github.com/DEEPIKA2827/miniledger" target="_blank" rel="noreferrer"
           class="inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-medium transition">
          <svg class="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
          GitHub
        </a>
      </div>
    </div>
  </header>

  <!-- Main Content Container -->
  <main class="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">

    <!-- Auth View (Shown if not logged in) -->
    <div id="authView" class="max-w-md mx-auto mt-6 bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur">
      <div class="text-center mb-6">
        <div class="inline-flex p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 mb-3 border border-indigo-500/20">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
        </div>
        <h2 class="text-2xl font-bold text-white tracking-tight">MiniLedger Sign In</h2>
        <p class="text-sm text-slate-400 mt-1">Authenticate via Phone Number & Mock OTP</p>
      </div>

      <!-- Quick Fill Demo Button -->
      <button onclick="fillDemoPhone()" type="button" class="w-full mb-5 py-2 px-3 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-500/40 text-xs font-semibold flex items-center justify-center transition">
        ⚡ Quick Fill Demo Number (9876543210)
      </button>

      <form id="phoneForm" onsubmit="handleSendOtp(event)">
        <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">10-Digit Mobile Number</label>
        <div class="flex items-center space-x-2 mb-4">
          <span class="px-3 py-2.5 rounded-xl bg-slate-700/50 border border-slate-600 text-slate-300 font-mono text-sm">+91</span>
          <input id="phoneInput" type="tel" maxlength="10" required placeholder="9876543210"
                 class="flex-1 bg-slate-900/80 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-2.5 text-white font-mono text-sm outline-none transition" />
        </div>
        <button id="sendOtpBtn" type="submit"
                class="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-indigo-600/30 flex items-center justify-center">
          Send Verification Code
        </button>
      </form>

      <!-- OTP Input Area (Hidden initially) -->
      <div id="otpSection" class="hidden mt-6 pt-6 border-t border-slate-700">
        <!-- Live OTP Notice Banner -->
        <div id="otpBanner" class="p-3 mb-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start space-x-2">
          <svg class="w-4 h-4 text-amber-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          <div class="flex-1">
            <span class="font-bold">Mock SMS Gateway:</span> Your OTP code is <span id="mockOtpDisplay" class="font-mono font-bold text-amber-300 text-sm underline cursor-pointer" onclick="useMockOtp()">----</span>
            <div class="text-[11px] text-amber-400/80 mt-0.5">Click the number above to auto-fill.</div>
          </div>
        </div>

        <form onsubmit="handleVerifyOtp(event)">
          <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">4-Digit Verification Code</label>
          <input id="otpInput" type="text" maxlength="4" required placeholder="1234"
                 class="w-full text-center tracking-widest text-xl font-mono bg-slate-900/80 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-2.5 text-white outline-none mb-4 transition" />
          <button id="verifyOtpBtn" type="submit"
                  class="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-emerald-600/30">
            Verify & Enter Dashboard
          </button>
        </form>
      </div>

      <div id="authError" class="hidden mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs"></div>
    </div>

    <!-- Dashboard View (Shown once logged in) -->
    <div id="dashboardView" class="hidden space-y-6">

      <!-- Header Profile & Logout -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 sm:px-6">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-slate-200">
            📱
          </div>
          <div>
            <div class="text-xs text-slate-400">Authenticated Ledger</div>
            <div id="userPhone" class="font-mono font-bold text-white text-sm">+91 ----------</div>
          </div>
        </div>
        <div class="flex items-center space-x-3">
          <button onclick="openAddModal()" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition flex items-center">
            <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            Record New Loan
          </button>
          <button onclick="logout()" class="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 border border-slate-700 text-xs font-semibold transition">
            Sign Out
          </button>
        </div>
      </div>

      <!-- Financial Metrics Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <!-- Total Lent -->
        <div class="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div class="absolute -right-4 -bottom-4 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl"></div>
          <div class="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1 flex items-center">
            <span class="w-2 h-2 rounded-full bg-indigo-400 mr-2"></span> Total Lent
          </div>
          <div id="totalLent" class="text-3xl font-extrabold text-white font-mono tracking-tight mt-1">₹0</div>
          <div id="totalLoansCount" class="text-xs text-slate-400 mt-2">0 loans recorded</div>
        </div>

        <!-- Total Repaid -->
        <div class="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div class="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl"></div>
          <div class="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1 flex items-center">
            <span class="w-2 h-2 rounded-full bg-emerald-400 mr-2"></span> Total Repaid
          </div>
          <div id="totalRepaid" class="text-3xl font-extrabold text-emerald-400 font-mono tracking-tight mt-1">₹0</div>
          <div id="repaidLoansCount" class="text-xs text-slate-400 mt-2">0 settled loans</div>
        </div>

        <!-- Total Overdue -->
        <div class="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div class="absolute -right-4 -bottom-4 w-24 h-24 bg-rose-500/5 rounded-full blur-xl"></div>
          <div class="text-xs font-bold text-rose-400 uppercase tracking-wider mb-1 flex items-center">
            <span class="w-2 h-2 rounded-full bg-rose-400 mr-2"></span> Total Overdue
          </div>
          <div id="totalOverdue" class="text-3xl font-extrabold text-rose-400 font-mono tracking-tight mt-1">₹0</div>
          <div id="overdueLoansCount" class="text-xs text-slate-400 mt-2">0 overdue debts</div>
        </div>
      </div>

      <!-- Filter Controls & Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4">
        <h3 class="text-lg font-bold text-white tracking-tight flex items-center">
          Loan Ledger Entries
          <span id="entriesCount" class="ml-2 px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-xs font-medium border border-slate-700">0</span>
        </h3>
        <div class="inline-flex p-1 bg-slate-800/90 rounded-xl border border-slate-700/80 text-xs font-medium">
          <button onclick="setFilter('all')" id="filter-all" class="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-semibold transition">All</button>
          <button onclick="setFilter('active')" id="filter-active" class="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition">Active</button>
          <button onclick="setFilter('overdue')" id="filter-overdue" class="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition">Overdue</button>
          <button onclick="setFilter('repaid')" id="filter-repaid" class="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition">Repaid</button>
        </div>
      </div>

      <!-- Loans Grid -->
      <div id="loansList" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Rendered dynamically via JS -->
      </div>

      <div id="emptyState" class="hidden text-center py-12 border-2 border-dashed border-slate-800 rounded-2xl">
        <div class="text-4xl mb-3">📋</div>
        <div class="text-slate-300 font-semibold">No loans found</div>
        <p class="text-xs text-slate-500 mt-1 max-w-sm mx-auto">Click "Record New Loan" above to add your first peer loan entry with real-time overdue tracking.</p>
      </div>

    </div>

    <!-- Live API Status Bar -->
    <footer class="mt-16 pt-6 border-t border-slate-800 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
      <div class="flex items-center space-x-2">
        <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
        <span>PostgreSQL & Fastify API Operational</span>
      </div>
      <div class="flex items-center space-x-4">
        <a href="/health" target="_blank" class="hover:text-indigo-400 underline">API /health</a>
        <span>·</span>
        <a href="https://github.com/DEEPIKA2827/miniledger" target="_blank" class="hover:text-indigo-400 underline">Documentation</a>
        <span>·</span>
        <span>CredSetu Assignment 2026</span>
      </div>
    </footer>

  </main>

  <!-- Add Loan Modal -->
  <div id="addModal" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
    <div class="bg-slate-900 border border-slate-700 max-w-md w-full rounded-2xl p-6 shadow-2xl relative">
      <div class="flex items-center justify-between mb-5">
        <h4 class="font-bold text-lg text-white">Record New Loan</h4>
        <button onclick="closeAddModal()" class="text-slate-400 hover:text-white text-xl leading-none">&times;</button>
      </div>

      <form onsubmit="handleCreateLoan(event)" class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Borrower / Friend Name</label>
          <input id="loanFriendName" type="text" required placeholder="e.g. Rahul Sharma"
                 class="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-white text-sm outline-none" />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Principal Amount (₹)</label>
          <input id="loanAmount" type="number" step="0.01" min="1" required placeholder="1500"
                 class="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-white font-mono text-sm outline-none" />
        </div>

        <div>
          <div class="flex items-center justify-between mb-1">
            <label class="text-xs font-semibold text-slate-300 uppercase tracking-wider">Repayment Due Date</label>
            <div class="space-x-1">
              <button type="button" onclick="setDueDatePreset('yesterday')" class="text-[10px] text-rose-400 hover:underline">⚡ Overdue Test</button>
              <button type="button" onclick="setDueDatePreset('week')" class="text-[10px] text-indigo-400 hover:underline">⚡ +7 Days</button>
            </div>
          </div>
          <input id="loanDueDate" type="date" required
                 class="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-white text-sm outline-none" />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Notes / Description (Optional)</label>
          <input id="loanNotes" type="text" placeholder="e.g. Dinner bill split"
                 class="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-white text-sm outline-none" />
        </div>

        <div class="pt-2 flex items-center space-x-3">
          <button type="button" onclick="closeAddModal()" class="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold">Cancel</button>
          <button type="submit" id="createLoanBtn" class="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30">Save Loan</button>
        </div>
      </form>
    </div>
  </div>

  <script>
    const API_BASE = window.location.origin;
    let currentFilter = 'all';
    let cachedLoans = [];

    // Check token on page load
    window.addEventListener('DOMContentLoaded', () => {
      const token = localStorage.getItem('ml_token');
      const phone = localStorage.getItem('ml_phone');
      if (token && phone) {
        showDashboard(phone);
      } else {
        showAuth();
      }
    });

    function showAuth() {
      document.getElementById('authView').classList.remove('hidden');
      document.getElementById('dashboardView').classList.add('hidden');
    }

    function showDashboard(phone) {
      document.getElementById('authView').classList.add('hidden');
      document.getElementById('dashboardView').classList.remove('hidden');
      document.getElementById('userPhone').innerText = '+91 ' + phone;
      refreshDashboard();
    }

    function fillDemoPhone() {
      document.getElementById('phoneInput').value = '9876543210';
    }

    async function handleSendOtp(e) {
      e.preventDefault();
      const phone = document.getElementById('phoneInput').value.trim();
      const btn = document.getElementById('sendOtpBtn');
      const errBox = document.getElementById('authError');
      errBox.classList.add('hidden');

      btn.disabled = true;
      btn.innerText = 'Generating Code...';

      try {
        const res = await fetch(\`\${API_BASE}/api/auth/send-otp\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to send OTP');

        document.getElementById('otpSection').classList.remove('hidden');
        if (data.devOtp) {
          document.getElementById('mockOtpDisplay').innerText = data.devOtp;
        }
        btn.innerText = 'Code Sent!';
      } catch (err) {
        errBox.innerText = err.message;
        errBox.classList.remove('hidden');
        btn.disabled = false;
        btn.innerText = 'Send Verification Code';
      }
    }

    function useMockOtp() {
      const code = document.getElementById('mockOtpDisplay').innerText;
      if (code && code !== '----') {
        document.getElementById('otpInput').value = code;
      }
    }

    async function handleVerifyOtp(e) {
      e.preventDefault();
      const phone = document.getElementById('phoneInput').value.trim();
      const otp = document.getElementById('otpInput').value.trim();
      const btn = document.getElementById('verifyOtpBtn');
      const errBox = document.getElementById('authError');
      errBox.classList.add('hidden');

      btn.disabled = true;
      btn.innerText = 'Verifying...';

      try {
        const res = await fetch(\`\${API_BASE}/api/auth/verify-otp\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, otp })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Invalid OTP');

        localStorage.setItem('ml_token', data.token);
        localStorage.setItem('ml_phone', phone);
        showDashboard(phone);
      } catch (err) {
        errBox.innerText = err.message;
        errBox.classList.remove('hidden');
        btn.disabled = false;
        btn.innerText = 'Verify & Enter Dashboard';
      }
    }

    function logout() {
      localStorage.removeItem('ml_token');
      localStorage.removeItem('ml_phone');
      showAuth();
    }

    async function refreshDashboard() {
      const token = localStorage.getItem('ml_token');
      if (!token) return logout();

      try {
        // 1. Fetch summary
        const summaryRes = await fetch(\`\${API_BASE}/api/loans/summary\`, {
          headers: { 'Authorization': \`Bearer \${token}\` }
        });
        if (summaryRes.status === 401) return logout();
        const summaryData = await summaryRes.json();
        const summary = summaryData.summary || summaryData;

        const totalLent = Number(summary.totalLent || 0);
        const totalRepaid = Number(summary.totalRepaid || 0);
        const totalOverdue = Number(summary.totalOverdue || 0);
        const activeCount = Number(summary.activeLoanCount || 0);
        const settledCount = Number(summary.settledLoanCount || 0);
        const totalCount = activeCount + settledCount;

        document.getElementById('totalLent').innerText = '₹' + totalLent.toLocaleString('en-IN');
        document.getElementById('totalRepaid').innerText = '₹' + totalRepaid.toLocaleString('en-IN');
        document.getElementById('totalOverdue').innerText = '₹' + totalOverdue.toLocaleString('en-IN');
        document.getElementById('totalLoansCount').innerText = \`\${totalCount} loans recorded\`;
        document.getElementById('repaidLoansCount').innerText = \`\${settledCount} settled loans\`;
        document.getElementById('overdueLoansCount').innerText = \`\${activeCount} active loans\`;

        // 2. Fetch loans list
        const loansRes = await fetch(\`\${API_BASE}/api/loans\`, {
          headers: { 'Authorization': \`Bearer \${token}\` }
        });
        const loansData = await loansRes.json();
        cachedLoans = Array.isArray(loansData) ? loansData : (loansData.loans || []);
        renderLoans();
      } catch (err) {
        console.error('Failed to refresh dashboard', err);
      }
    }

    function setFilter(filter) {
      currentFilter = filter;
      ['all', 'active', 'overdue', 'repaid'].forEach(f => {
        const btn = document.getElementById('filter-' + f);
        if (f === filter) {
          btn.className = 'px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-semibold transition';
        } else {
          btn.className = 'px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition';
        }
      });
      renderLoans();
    }

    function renderLoans() {
      const container = document.getElementById('loansList');
      const empty = document.getElementById('emptyState');
      container.innerHTML = '';

      let filtered = cachedLoans;
      if (currentFilter === 'active') filtered = cachedLoans.filter(l => !l.isRepaid);
      else if (currentFilter === 'overdue') filtered = cachedLoans.filter(l => l.isOverdue);
      else if (currentFilter === 'repaid') filtered = cachedLoans.filter(l => l.isRepaid);

      document.getElementById('entriesCount').innerText = filtered.length;

      if (filtered.length === 0) {
        empty.classList.remove('hidden');
        return;
      }
      empty.classList.add('hidden');

      filtered.forEach(loan => {
        const card = document.createElement('div');
        const isOverdue = loan.isOverdue;
        const isRepaid = loan.isRepaid;

        let badgeHtml = '';
        if (isRepaid) {
          badgeHtml = \`<span class="badge-repaid px-2.5 py-0.5 rounded-full text-xs font-semibold inline-flex items-center">✓ Repaid</span>\`;
        } else if (isOverdue) {
          badgeHtml = \`<span class="badge-overdue px-2.5 py-0.5 rounded-full text-xs font-semibold inline-flex items-center animate-pulse">⚠ OVERDUE</span>\`;
        } else {
          badgeHtml = \`<span class="badge-active px-2.5 py-0.5 rounded-full text-xs font-semibold inline-flex items-center">Active</span>\`;
        }

        const borderClass = isOverdue ? 'border-rose-500/50 bg-rose-950/10' : 'border-slate-700/80 bg-slate-800/80';

        card.className = \`\${borderClass} border rounded-2xl p-5 shadow-lg flex flex-col justify-between transition hover:border-slate-600\`;
        card.innerHTML = \`
          <div>
            <div class="flex items-start justify-between mb-2">
              <div>
                <h4 class="font-bold text-white text-base">\${loan.friendName}</h4>
                <div class="text-xs text-slate-400">Due: \${new Date(loan.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
              </div>
              <div>\${badgeHtml}</div>
            </div>
            <div class="text-2xl font-extrabold text-white font-mono my-2 tracking-tight">₹\${Number(loan.amount).toLocaleString('en-IN')}</div>
            \${loan.notes ? \`<p class="text-xs text-slate-400 bg-slate-900/50 p-2 rounded-lg mt-2 border border-slate-800">\${loan.notes}</p>\` : ''}
          </div>
          <div class="mt-4 pt-3 border-t border-slate-700/50 flex items-center justify-between">
            <span class="text-[11px] text-slate-500">ID: \${loan.id.slice(-6)}</span>
            \${!isRepaid ? \`
              <button onclick="handleMarkRepaid('\${loan.id}')" class="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 rounded-lg text-xs font-semibold transition">
                Mark Repaid
              </button>
            \` : \`
              <span class="text-xs text-emerald-400 font-medium">Settled \${loan.repaidAt ? new Date(loan.repaidAt).toLocaleDateString('en-IN') : ''}</span>
            \`}
          </div>
        \`;
        container.appendChild(card);
      });
    }

    async function handleMarkRepaid(id) {
      const token = localStorage.getItem('ml_token');
      try {
        const res = await fetch(\`\${API_BASE}/api/loans/\${id}/repay\`, {
          method: 'PATCH',
          headers: {
            'Authorization': \`Bearer \${token}\`,
            'Content-Type': 'application/json'
          }
        });
        if (!res.ok) throw new Error('Failed to settle loan');
        refreshDashboard();
      } catch (err) {
        alert(err.message);
      }
    }

    function openAddModal() {
      document.getElementById('addModal').classList.remove('hidden');
      setDueDatePreset('week');
    }

    function closeAddModal() {
      document.getElementById('addModal').classList.add('hidden');
    }

    function setDueDatePreset(preset) {
      const dateInput = document.getElementById('loanDueDate');
      const d = new Date();
      if (preset === 'yesterday') {
        d.setDate(d.getDate() - 2); // Overdue guaranteed
      } else if (preset === 'week') {
        d.setDate(d.getDate() + 7);
      }
      dateInput.value = d.toISOString().split('T')[0];
    }

    async function handleCreateLoan(e) {
      e.preventDefault();
      const token = localStorage.getItem('ml_token');
      const friendName = document.getElementById('loanFriendName').value.trim();
      const amount = parseFloat(document.getElementById('loanAmount').value);
      const dueDate = new Date(document.getElementById('loanDueDate').value).toISOString();
      const notes = document.getElementById('loanNotes').value.trim() || undefined;

      const btn = document.getElementById('createLoanBtn');
      btn.disabled = true;
      btn.innerText = 'Saving...';

      try {
        const res = await fetch(\`\${API_BASE}/api/loans\`, {
          method: 'POST',
          headers: {
            'Authorization': \`Bearer \${token}\`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ friendName, amount, dueDate, notes })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to create loan');

        closeAddModal();
        document.getElementById('loanFriendName').value = '';
        document.getElementById('loanAmount').value = '';
        document.getElementById('loanNotes').value = '';
        refreshDashboard();
      } catch (err) {
        alert(err.message);
      } finally {
        btn.disabled = false;
        btn.innerText = 'Save Loan';
      }
    }
  </script>
</body>
</html>
`;

