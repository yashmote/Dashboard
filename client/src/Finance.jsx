// client/src/Finance.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getBalance, updateBalance, getTransactions, addTransaction, deleteTransaction } from './api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { format, parseISO } from 'date-fns';
import './Finance.css';

export default function Finance() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  // Form State
  const [type, setType] = useState('expense'); // 'income' or 'expense'
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [desc, setDesc] = useState('');
  
  // Balance Edit State
  const [isEditingBalance, setIsEditingBalance] = useState(false);
  const [newBalanceInput, setNewBalanceInput] = useState('');

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF5252'];

  useEffect(() => {
    loadData();
  }, []);

  // When switching types, reset category to a sensible default
  useEffect(() => {
    setCategory(type === 'expense' ? 'Food' : 'Pocket Money');
  }, [type]);

  const loadData = async () => {
    const balRes = await getBalance();
    setBalance(balRes.data.balance);
    const transRes = await getTransactions();
    setTransactions(transRes.data);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!amount) return;

    await addTransaction({
      type,
      amount: parseFloat(amount),
      category,
      description: desc,
      date: new Date().toISOString().split('T')[0]
    });

    setAmount('');
    setDesc('');
    loadData();
  };

  const handleDelete = async (id) => {
    if(window.confirm("Delete this transaction? Balance will be adjusted.")) {
      await deleteTransaction(id);
      loadData();
    }
  };

  const handleUpdateBalance = async () => {
    await updateBalance(parseFloat(newBalanceInput));
    setIsEditingBalance(false);
    loadData();
  };

  // --- FILTERING ---
  const getAvailableMonths = () => {
    const months = new Set(transactions.map(t => t.date.slice(0, 7)));
    months.add(new Date().toISOString().slice(0, 7));
    return Array.from(months).sort().reverse();
  };

  const filteredTrans = transactions.filter(t => t.date.startsWith(selectedMonth));

  // Chart Data: ONLY visualize Expenses (Income graphs are usually boring)
  const processChartData = () => {
    const totals = {};
    filteredTrans
      .filter(t => t.type === 'expense') // Only graph expenses
      .forEach(t => {
        const val = parseFloat(t.amount);
        totals[t.category] = (totals[t.category] || 0) + val;
      });

    return Object.keys(totals).map((cat, index) => ({
      name: cat,
      value: totals[cat],
      color: COLORS[index % COLORS.length]
    }));
  };

  const chartData = processChartData();
  
  // Stats
  const totalIncome = filteredTrans
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);
    
  const totalExpense = filteredTrans
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="finance-container">
      <div className="finance-header">
        <div className="header-left">
            {/* The class 'back-link' now makes it a button */}
            <Link to="/" className="back-link">
            <span>←</span> Dashboard
            </Link>
            <h1>My Wallet</h1>
        </div>
        
        <div className="month-selector">
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
            {getAvailableMonths().map(month => (
              <option key={month} value={month}>
                {format(parseISO(`${month}-01`), 'MMMM yyyy')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* BALANCE CARD */}
      <div className="balance-card">
        <h3>Current Balance</h3>
        
        {isEditingBalance ? (
          <div className="edit-balance-box">
             {/* Big Input */}
             <input 
              type="number" 
              value={newBalanceInput} 
              onChange={e => setNewBalanceInput(e.target.value)}
              autoFocus
            />
            
            {/* Buttons Row */}
            <div className="edit-actions">
              <button className="save-btn" onClick={handleUpdateBalance}>
                Save Balance
              </button>
              <button className="cancel-btn" onClick={() => setIsEditingBalance(false)}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="balance-display" onClick={() => {
            setNewBalanceInput(balance);
            setIsEditingBalance(true);
          }}>
            <span className="currency-symbol">₹</span>
            <span className="balance-amount">{balance.toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* STATS ROW */}
      <div className="stats-row">
      <div className="stat-box expense">
          <span>Spent ({format(parseISO(`${selectedMonth}-01`), 'MMM')})</span>
          <h3>-₹{totalExpense.toLocaleString()}</h3>
        </div>
        <div className="stat-box income">
          <span>Income ({format(parseISO(`${selectedMonth}-01`), 'MMM')})</span>
          <h3>+₹{totalIncome.toLocaleString()}</h3>
        </div>
      </div>

      <div className="finance-grid">
        {/* ADD TRANSACTION FORM */}
        <div className="expense-form-card">
          
          {/* TYPE TOGGLE */}
          <div className="type-toggle">
            <button 
              className={type === 'expense' ? 'active expense' : ''} 
              onClick={() => setType('expense')}
            >
              Expense 💸
            </button>
            <button 
              className={type === 'income' ? 'active income' : ''} 
              onClick={() => setType('income')}
            >
              Income 💰
            </button>
          </div>

          <form onSubmit={handleAdd}>
            <div className="input-group">
              <label>Amount</label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" autoFocus/>
            </div>
            
            <div className="input-group">
              <label>Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)}>
                {type === 'expense' ? (
                  <>
                    <option>Food</option>
                    <option>Travel</option>
                    <option>Shopping</option>
                    <option>Fruits</option>
                    <option>Entertainment</option>
                    <option>Other</option>
                  </>
                ) : (
                  <>
                    <option>Pocket Money</option>
                    <option>Salary</option>
                    <option>Gift</option>
                    <option>Freelance</option>
                    <option>Other</option>
                  </>
                )}
              </select>
            </div>

            <div className="input-group">
              <label>Note</label>
              <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Description" />
            </div>

            <button type="submit" className={`pay-btn ${type}`}>
              {type === 'income' ? 'Add Income' : 'Add Expense'}
            </button>
          </form>
        </div>

        {/* CHART */}
        <div className="chart-card">
          <div className="chart-header">
             <h3>Spending Breakdown</h3>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="#888" hide />
                <YAxis dataKey="name" type="category" stroke="#fff" width={80} tick={{fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ backgroundColor: '#1e1e1e', borderColor: '#333' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value) => `₹${value}`} 
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data-box"><p>No spending yet.</p></div>
          )}
        </div>
      </div>

      {/* TRANSACTIONS LIST */}
      <div className="transactions-section">
        <h3>History</h3>
        <div className="transactions-list">
          {filteredTrans.map(t => (
            <div key={t.id} className="transaction-item">
              <div className="trans-left">
                <span className="trans-cat">{t.category}</span>
                <span className="trans-desc">{t.description}</span>
                <span className="trans-date">{t.date}</span>
              </div>
              <div className="trans-right">
                <span className={`trans-amount ${t.type}`}>
                  {t.type === 'income' ? '+' : '-'}₹{t.amount}
                </span>
                <button className="del-btn" onClick={() => handleDelete(t.id)}>✕</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}