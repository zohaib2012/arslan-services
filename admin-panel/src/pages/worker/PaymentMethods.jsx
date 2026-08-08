import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';
import { ChevronLeft, Wallet, Plus, X, Loader2, CreditCard, Landmark } from 'lucide-react';

const methods = ['EASYPAISA', 'JAZZCASH', 'SADAPAY', 'NAYAPAY', 'BANK_ACCOUNT'];

export default function PaymentMethods() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [methodType, setMethodType] = useState('EASYPAISA');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountTitle, setAccountTitle] = useState('');
  const [bankName, setBankName] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const load = async () => {
    try {
      const res = await api.get('/workers/me');
      setItems(res.data?.paymentMethods || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const add = async () => {
    if (!accountNumber.trim() || !accountTitle.trim()) {
      toast.error('Please fill account number and title.');
      return;
    }
    setAdding(true);
    try {
      await api.post('/workers/me/payment-methods', {
        methodType,
        accountNumber: accountNumber.trim(),
        accountTitle: accountTitle.trim(),
        bankName: methodType === 'BANK_ACCOUNT' && bankName.trim() ? bankName.trim() : undefined,
        isDefault,
      });
      toast.success('Payment method added.');
      setAccountNumber('');
      setAccountTitle('');
      setBankName('');
      setIsDefault(false);
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add method.');
    } finally {
      setAdding(false);
    }
  };

  const remove = async (id) => {
    try {
      await api.delete(`/workers/me/payment-methods/${id}`);
      toast.success('Payment method removed.');
      setItems((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove method.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-brand-600" size={28} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <Link to="/worker/profile" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-brand-700 mb-5">
        <ChevronLeft size={15} /> Back to profile
      </Link>
      <h1 className="font-display text-2xl font-bold text-ink-900 mb-2 flex items-center gap-2">
        <Wallet size={22} className="text-brand-600" /> Payment Methods
      </h1>
      <p className="text-sm text-gray-500 mb-6">Add the payment methods where you want to receive payments.</p>

      <div className="card-premium p-5 mb-6 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <select
            value={methodType}
            onChange={(e) => setMethodType(e.target.value)}
            className="px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {methods.map((m) => (
              <option key={m} value={m}>{m.replace(/_/g, ' ')}</option>
            ))}
          </select>
          <input
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            placeholder="Account / wallet number"
            className="px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <input
            value={accountTitle}
            onChange={(e) => setAccountTitle(e.target.value)}
            placeholder="Account title"
            className="px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          {methodType === 'BANK_ACCOUNT' && (
            <input
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="Bank name"
              className="px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          )}
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} className="w-4 h-4 accent-brand-600" />
          Set as default payment method
        </label>
        <button
          onClick={add}
          disabled={adding}
          className="w-full inline-flex items-center justify-center gap-2 py-3 btn-primary text-sm font-semibold rounded-xl disabled:opacity-50"
        >
          <Plus size={15} /> {adding ? 'Adding...' : 'Add Payment Method'}
        </button>
      </div>

      <div className="card-premium p-5">
        <h2 className="font-semibold text-ink-900 mb-3">Saved Methods ({items.length})</h2>
        {items.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">No payment methods added.</p>
        ) : (
          <div className="space-y-2">
            {items.map((p) => (
              <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
                  {p.methodType === 'BANK_ACCOUNT' ? <Landmark size={16} /> : <CreditCard size={16} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">{p.methodType.replace(/_/g, ' ')}</p>
                  <p className="text-xs text-gray-400 truncate">{p.accountTitle} · {p.accountNumber}</p>
                </div>
                {p.isDefault && <span className="text-[10px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full shrink-0">Default</span>}
                <button onClick={() => remove(p.id)} className="text-gray-400 hover:text-red-500 shrink-0">
                  <X size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
