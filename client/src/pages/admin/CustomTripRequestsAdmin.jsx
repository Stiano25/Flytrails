import { useCallback, useEffect, useMemo, useState } from 'react';
import { FileDown, MessageCircle, Plus, RefreshCw, Search, X } from 'lucide-react';
import { adminApi } from '../../data/api.js';
import { normalizeWhatsAppNumber } from '../../lib/phone.js';
import { whatsappHrefForNumber } from '../../lib/whatsapp.js';

const statuses = ['new', 'under_review', 'quote_draft', 'quote_sent', 'customer_confirmed', 'customer_declined', 'closed'];
const money = (value) => new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(Number(value) || 0);
const emptyItem = () => ({ description: '', quantity: 1, unitPrice: 0 });

function printQuote(request, quote, items) {
  const rows = items.map((item) => `<tr><td>${escapeHtml(item.description)}</td><td>${item.quantity}</td><td>${money(item.unitPrice)}</td><td>${money(item.quantity * item.unitPrice)}</td></tr>`).join('');
  const popup = window.open('', '_blank');
  if (!popup) throw new Error('Please allow pop-ups to generate the quote PDF.');
  popup.document.write(`<!doctype html><html><head><title>${request.referenceNumber} - Flytrails Custom Trip</title><style>body{font-family:Arial,sans-serif;color:#142536;max-width:850px;margin:40px auto;line-height:1.45}h1{color:#e77b18;margin-bottom:4px}h2{border-bottom:1px solid #ddd;padding-bottom:6px;margin-top:28px}table{width:100%;border-collapse:collapse;margin-top:12px}th,td{text-align:left;padding:9px;border-bottom:1px solid #ddd}th{background:#f7f1e9}.total{text-align:right;font-size:20px;font-weight:bold;margin-top:16px}.muted{color:#667085;white-space:pre-line}.header{display:flex;justify-content:space-between;border-bottom:3px solid #e77b18;padding-bottom:16px}@media print{body{margin:0}.no-print{display:none}}</style></head><body><div class="header"><div><h1>FLYTRAILS</h1><div>Custom Trip Quotation</div></div><div><strong>${request.referenceNumber}</strong><br>${new Date().toLocaleDateString('en-KE')}</div></div><h2>For ${escapeHtml(request.customerName)}</h2><p>${escapeHtml(request.customerEmail)} · ${escapeHtml(request.customerPhone)}<br>${escapeHtml(request.destination)} · ${escapeHtml(request.travelDates)}<br>${request.adults} adult(s), ${request.children} child(ren)</p><h2>Itinerary</h2><p class="muted">${escapeHtml(quote.itinerary || 'To be confirmed')}</p><h2>Pricing (KES)</h2><table><thead><tr><th>Description</th><th>Qty</th><th>Unit price</th><th>Total</th></tr></thead><tbody>${rows}</tbody></table><div class="total">Total: ${money(quote.total)}</div><h2>Included</h2><p class="muted">${escapeHtml(quote.inclusions || 'As specified in the itinerary.')}</p><h2>Not included</h2><p class="muted">${escapeHtml(quote.exclusions || 'Anything not listed above.')}</p><h2>Terms</h2><p class="muted">${escapeHtml(quote.terms || 'Availability and pricing are subject to confirmation. Prices are in KES and taxes are included.')}</p><p class="no-print">Use your browser print dialog and choose “Save as PDF”.</p></body></html>`);
  popup.document.close();
  popup.focus();
  popup.print();
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
}

export default function CustomTripRequestsAdmin() {
  const [requests, setRequests] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [quote, setQuote] = useState({ validityDate: '', itinerary: '', inclusions: '', exclusions: '', terms: '' });
  const [items, setItems] = useState([emptyItem()]);

  const load = useCallback(async () => {
    setLoading(true);
    try { setRequests(await adminApi.getCustomTripRequests()); } catch (error) { alert(error.message); } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => requests.filter((request) => {
    const query = search.trim().toLowerCase();
    return !query || [request.referenceNumber, request.customerName, request.customerEmail, request.customerPhone, request.destination].some((value) => String(value || '').toLowerCase().includes(query));
  }), [requests, search]);

  function openRequest(request) {
    const latest = request.quotes?.[request.quotes.length - 1];
    setSelected(request);
    setQuote(latest ? { validityDate: latest.validityDate || '', itinerary: latest.itinerary, inclusions: latest.inclusions, exclusions: latest.exclusions, terms: latest.terms } : { validityDate: '', itinerary: '', inclusions: '', exclusions: '', terms: '' });
    setItems(latest?.items?.length ? latest.items : [emptyItem()]);
  }

  function updateItem(index, field, value) { setItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: field === 'description' ? value : Number(value) } : item)); }
  const total = items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.unitPrice || 0), 0);

  async function saveQuote() {
    if (!selected || items.some((item) => !item.description.trim())) return;
    setSaving(true);
    try {
      await adminApi.saveCustomTripQuote(selected.id, quote, items);
      const updated = await adminApi.updateCustomTripRequest(selected.id, { status: 'quote_draft' });
      setRequests((current) => current.map((request) => request.id === selected.id ? updated : request));
      setSelected(updated);
      alert('Quote saved. Use Generate PDF to download it.');
    } catch (error) { alert(error.message); } finally { setSaving(false); }
  }

  async function changeStatus(status) {
    try {
      const updated = await adminApi.updateCustomTripRequest(selected.id, { status });
      setRequests((current) => current.map((request) => request.id === selected.id ? updated : request));
      setSelected(updated);
    } catch (error) { alert(error.message); }
  }

  const latestQuote = selected?.quotes?.[selected.quotes.length - 1];
  const whatsappMessage = selected ? `Hi ${selected.customerName}, your Flytrails Custom Trip quotation is ready. Reference: ${selected.referenceNumber}.` : '';
  const whatsappHref = selected ? whatsappHrefForNumber(normalizeWhatsAppNumber(selected.customerPhone), whatsappMessage) : '';

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h1 className="text-2xl font-bold text-slate-900">Custom Trip Requests</h1><p className="mt-1 text-sm text-slate-600">Review requests, build quotations, and share them with the right customer.</p></div><button onClick={load} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />Refresh</button></div>
      <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search reference, customer, phone, destination..." className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm" /></div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Request</th><th className="px-5 py-3">Customer</th><th className="px-5 py-3">Trip</th><th className="px-5 py-3">Status</th></tr></thead><tbody>{filtered.map((request) => <tr key={request.id} onClick={() => openRequest(request)} className="cursor-pointer border-t border-slate-100 hover:bg-orange-50/40"><td className="px-5 py-4 font-mono font-semibold">{request.referenceNumber}</td><td className="px-5 py-4"><div className="font-semibold">{request.customerName}</div><div className="text-xs text-slate-500">{request.customerPhone}</div></td><td className="px-5 py-4"><div>{request.destination || 'Destination TBC'}</div><div className="text-xs text-slate-500">{request.travelDates || 'Dates flexible'}</div></td><td className="px-5 py-4"><span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold capitalize text-orange-800">{request.status.replaceAll('_', ' ')}</span></td></tr>)}{!filtered.length && <tr><td colSpan="4" className="px-5 py-12 text-center text-slate-500">{loading ? 'Loading requests…' : 'No custom trip requests yet.'}</td></tr>}</tbody></table></div>

      {selected && <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 p-4"><div className="mx-auto max-w-5xl rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-start justify-between"><div><h2 className="text-xl font-bold text-slate-900">{selected.referenceNumber}</h2><p className="text-sm text-slate-500">{selected.customerName} · {selected.customerEmail} · {selected.customerPhone}</p></div><button onClick={() => setSelected(null)} className="rounded-lg p-2 hover:bg-slate-100"><X className="h-5 w-5" /></button></div>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.2fr]"><section className="space-y-4 rounded-xl bg-slate-50 p-4 text-sm"><h3 className="font-bold">Submitted request</h3><p><strong>Trip:</strong> {selected.tripType || 'Not specified'}</p><p><strong>Destination:</strong> {selected.destination || 'Not specified'}</p><p><strong>Dates:</strong> {selected.travelDates || 'Flexible'}</p><p><strong>Travelers:</strong> {selected.adults} adult(s), {selected.children} child(ren)</p><p><strong>Budget:</strong> {selected.budget || 'Not specified'}</p><p><strong>Special requests:</strong><br />{selected.specialRequests || 'None'}</p><label className="block font-semibold">Status<select value={selected.status} onChange={(event) => changeStatus(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-normal">{statuses.map((status) => <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>)}</select></label></section>
          <section><h3 className="font-bold text-slate-900">Build quotation</h3><div className="mt-3 space-y-2">{items.map((item, index) => <div key={index} className="grid grid-cols-[1fr_5rem_7rem_auto] gap-2"><input placeholder="Line item description" value={item.description} onChange={(event) => updateItem(index, 'description', event.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm" /><input type="number" min="1" value={item.quantity} onChange={(event) => updateItem(index, 'quantity', event.target.value)} className="rounded-lg border border-slate-200 px-2 py-2 text-sm" /><input type="number" min="0" value={item.unitPrice} onChange={(event) => updateItem(index, 'unitPrice', event.target.value)} className="rounded-lg border border-slate-200 px-2 py-2 text-sm" /><button onClick={() => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="px-2 text-slate-400 hover:text-red-600" aria-label="Remove line item"><X className="h-4 w-4" /></button></div>)}</div><button onClick={() => setItems((current) => [...current, emptyItem()])} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-orange-700"><Plus className="h-4 w-4" />Add line</button><div className="mt-4 text-right text-lg font-bold">Total: {money(total)}</div><div className="mt-4 grid gap-3"><input type="date" value={quote.validityDate} onChange={(event) => setQuote({ ...quote, validityDate: event.target.value })} className="rounded-lg border border-slate-200 px-3 py-2 text-sm" /><textarea placeholder="Itinerary" value={quote.itinerary} onChange={(event) => setQuote({ ...quote, itinerary: event.target.value })} rows="3" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" /><textarea placeholder="Included" value={quote.inclusions} onChange={(event) => setQuote({ ...quote, inclusions: event.target.value })} rows="2" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" /><textarea placeholder="Not included" value={quote.exclusions} onChange={(event) => setQuote({ ...quote, exclusions: event.target.value })} rows="2" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" /><textarea placeholder="Terms and payment/deposit instructions" value={quote.terms} onChange={(event) => setQuote({ ...quote, terms: event.target.value })} rows="2" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" /></div><div className="mt-4 flex flex-wrap gap-2"><button disabled={saving} onClick={saveQuote} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Save quote</button><button disabled={!latestQuote} onClick={() => printQuote(selected, latestQuote, latestQuote.items)} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold disabled:opacity-50"><FileDown className="h-4 w-4" />Generate PDF</button><a href={whatsappHref} target="_blank" rel="noopener noreferrer" onClick={() => changeStatus('quote_sent')} className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white"><MessageCircle className="h-4 w-4" />Open WhatsApp for {selected.customerName}</a></div></section></div></div></div>}
    </div>
  );
}
