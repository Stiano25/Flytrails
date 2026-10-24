import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  X,
  MessageCircle,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Printer,
  Calendar,
  Users,
  ShieldCheck,
  ArrowLeft,
  Ticket,
} from 'lucide-react';
import { useFocusTrap } from '../hooks/useFocusTrap.js';
import { useWhatsappLink } from '../hooks/useWhatsappLink.js';
import { api } from '../data/api.js';

function formatKES(val) {
  const num = Number(val) || 0;
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
  }).format(num);
}

export default function ReserveModal({ open, onClose, trip, tripTitle: fallbackTitle }) {
  const focusTrapRef = useFocusTrap(open);
  const whatsappHref = useWhatsappLink();

  const title = trip?.title || fallbackTitle || 'Trip';
  const price = Number(trip?.price) || 0;
  const departure = trip?.nextDeparture || 'Upcoming';
  const maxSpots = trip?.spotsLeft != null ? Math.min(Math.max(1, trip.spotsLeft), 10) : 10;

  // Flow states: 'form' | 'waiting' | 'success' | 'failed'
  const [step, setStep] = useState('form');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [slots, setSlots] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Booking & payment result
  const [bookingId, setBookingId] = useState(null);
  const [bookingData, setBookingData] = useState(null);
  const pollTimerRef = useRef(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (open) {
      setStep('form');
      setErrorMsg('');
      setLoading(false);
      setBookingId(null);
      setBookingData(null);
    } else {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    }
  }, [open]);

  // Handle escape key
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape' && step !== 'waiting') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose, step]);

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, []);

  if (!open) return null;

  const totalAmount = price * slots;

  // Start polling booking status
  const startPolling = (id) => {
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);

    let attempts = 0;
    const maxAttempts = 36; // 36 * 2.5s = 90 seconds timeout

    pollTimerRef.current = setInterval(async () => {
      attempts += 1;
      try {
        const statusData = await api.getBookingStatus(id);

        if (statusData.status === 'completed') {
          clearInterval(pollTimerRef.current);
          setBookingData(statusData);
          setStep('success');
        } else if (statusData.status === 'failed' || statusData.status === 'cancelled') {
          clearInterval(pollTimerRef.current);
          setErrorMsg('Payment was not completed or was cancelled on your phone.');
          setStep('failed');
        } else if (attempts >= maxAttempts) {
          clearInterval(pollTimerRef.current);
          setErrorMsg('Payment timed out waiting for PIN. If you were deducted, please contact support with your M-Pesa receipt.');
          setStep('failed');
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 2500);
  };

  const handleMpesaPay = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!trip?.id) {
      setErrorMsg('This trip cannot be booked online directly. Please contact us via WhatsApp.');
      return;
    }

    if (!name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (!phone.trim()) {
      setErrorMsg('Please enter your M-Pesa phone number.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.initiateMpesaBooking({
        tripId: trip.id,
        customerName: name.trim(),
        customerEmail: email.trim(),
        customerPhone: phone.trim(),
        slots,
      });

      setBookingId(res.bookingId);
      setStep('waiting');
      startPolling(res.bookingId);
    } catch (err) {
      setErrorMsg(err.message || 'Could not initiate M-Pesa payment.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCancelWaiting = () => {
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    setStep('form');
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-brand-dark/70 p-4 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reserve-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && step !== 'waiting') {
          onClose();
        }
      }}
    >
      <div
        ref={focusTrapRef}
        className="picker-fade relative w-full max-w-lg my-8 rounded-[24px] bg-white p-6 sm:p-7 shadow-2xl border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        {step !== 'waiting' && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        {/* ── STEP 1: FORM ─────────────────────────────────────────── */}
        {step === 'form' && (
          <div>
            <div className="mb-4 pr-8">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 mb-2">
                <Ticket className="w-3.5 h-3.5" /> Direct Booking
              </span>
              <h2 id="reserve-title" className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                Reserve your spot
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                {title} &bull; Departure: <strong className="text-slate-700">{departure}</strong>
              </p>
            </div>

            {/* Price Pill */}
            {price > 0 && (
              <div className="mb-5 flex items-center justify-between rounded-xl bg-orange-50/70 border border-orange-200/60 p-3.5">
                <div>
                  <div className="text-xs text-orange-800 font-medium">Rate per person</div>
                  <div className="text-lg font-bold text-orange-600">{formatKES(price)}</div>
                </div>
                {trip?.spotsLeft != null && (
                  <div className="text-right">
                    <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded bg-white text-slate-700 border border-orange-200">
                      {trip.spotsLeft} spot{trip.spotsLeft === 1 ? '' : 's'} left
                    </span>
                  </div>
                )}
              </div>
            )}

            {errorMsg && (
              <div className="mb-4 flex items-start gap-2.5 rounded-xl bg-red-50 p-3 text-sm text-red-700 border border-red-200">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleMpesaPay} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Mwangi"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="sarah@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    M-Pesa Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="0712345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
              </div>

              {/* Number of slots */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Number of Slots / Travelers
                  </label>
                  <span className="text-xs text-slate-500">Max {maxSpots} slots</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
                    <button
                      type="button"
                      disabled={slots <= 1}
                      onClick={() => setSlots(Math.max(1, slots - 1))}
                      className="h-8 w-8 rounded-lg bg-white text-slate-700 font-bold shadow-sm hover:bg-slate-100 disabled:opacity-40"
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-bold text-slate-900 text-sm">{slots}</span>
                    <button
                      type="button"
                      disabled={slots >= maxSpots}
                      onClick={() => setSlots(Math.min(maxSpots, slots + 1))}
                      className="h-8 w-8 rounded-lg bg-white text-slate-700 font-bold shadow-sm hover:bg-slate-100 disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>

                  {price > 0 && (
                    <div className="flex-1 text-right">
                      <span className="text-xs text-slate-400 block">Total Due</span>
                      <span className="text-lg font-extrabold text-slate-900">{formatKES(totalAmount)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 space-y-2.5">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3.5 px-4 shadow-lg shadow-emerald-600/20 transition focus:outline-none focus:ring-2 focus:ring-emerald-500/40 disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Requesting M-Pesa STK Push...</span>
                    </>
                  ) : (
                    <>
                      <Smartphone className="w-5 h-5" />
                      <span>Pay {price > 0 ? formatKES(totalAmount) : ''} with M-Pesa</span>
                    </>
                  )}
                </button>

                {/* WhatsApp alternative */}
                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink mx-3 text-xs text-slate-400 font-medium uppercase">Or book manually</span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>

                <a
                  href={`${whatsappHref.split('?')[0]}?text=${encodeURIComponent(
                    `Hi Flytrails, I'd like to reserve ${slots} spot(s) for "${title}" (${formatKES(totalAmount)}). Name: ${name || 'Traveler'}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium py-2.5 px-4 text-sm transition"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>Reserve via WhatsApp instead</span>
                </a>
              </div>
            </form>

            <p className="mt-4 text-center text-xs text-slate-400">
              By reserving, you agree to Flytrails{' '}
              <Link to="/terms" className="underline hover:text-slate-600" onClick={onClose}>
                Terms & Conditions
              </Link>
              .
            </p>
          </div>
        )}

        {/* ── STEP 2: WAITING FOR PIN ──────────────────────────────── */}
        {step === 'waiting' && (
          <div className="py-6 text-center">
            <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-25"></span>
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-inner">
                <Smartphone className="h-8 w-8 animate-bounce" />
              </div>
            </div>

            <h3 className="text-xl font-bold text-slate-900">Check Your Phone!</h3>
            <p className="mt-2 text-sm text-slate-600 max-w-sm mx-auto">
              An M-Pesa prompt has been sent to <strong className="text-slate-900">{phone}</strong> for{' '}
              <strong className="text-emerald-700">{formatKES(totalAmount)}</strong>.
            </p>

            <div className="mt-5 mx-auto max-w-xs rounded-xl bg-slate-50 border border-slate-200 p-3.5 text-xs text-slate-500 space-y-1 text-left">
              <div className="flex items-center gap-2 font-medium text-slate-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Safe & Secure Daraja STK
              </div>
              <p>1. Unlock your phone screen.</p>
              <p>2. Enter your M-Pesa PIN to complete payment.</p>
              <p>3. Wait here — your ticket will be issued immediately.</p>
            </div>

            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
              <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
              <span>Listening for payment confirmation...</span>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={handleCancelWaiting}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-700"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Made a mistake? Cancel & edit details
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: SUCCESS / TICKET PRINT ───────────────────────── */}
        {step === 'success' && bookingData && (
          <div>
            <div className="text-center mb-4">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Payment Successful!</h3>
              <p className="text-xs text-slate-500 mt-1">
                Your ticket is confirmed. A copy has been emailed to <strong>{bookingData.customerEmail}</strong>.
              </p>
            </div>

            {/* Ticket Card (Printable) */}
            <div
              id="printable-ticket"
              className="my-4 rounded-2xl border-2 border-dashed border-orange-300 bg-gradient-to-br from-orange-50/40 via-white to-amber-50/30 p-5 shadow-sm"
            >
              <div className="flex items-start justify-between border-b border-orange-100 pb-3 mb-3">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-orange-600">Flytrails Boarding Pass</div>
                  <h4 className="text-base font-bold text-slate-900 leading-tight">{bookingData.tripTitle}</h4>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Ticket #</div>
                  <span className="font-mono text-sm font-extrabold text-slate-900">{bookingData.ticketNumber}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block">Passenger</span>
                  <span className="font-semibold text-slate-800">{bookingData.customerName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Phone</span>
                  <span className="font-semibold text-slate-800">{bookingData.customerPhone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Departure</span>
                  <span className="font-semibold text-slate-800">{bookingData.tripDeparture || 'TBC'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Slots Booked</span>
                  <span className="font-semibold text-slate-800">{bookingData.slots} traveler(s)</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Amount Paid</span>
                  <span className="font-bold text-emerald-700">{formatKES(bookingData.amount)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">M-Pesa Receipt</span>
                  <span className="font-mono font-semibold text-slate-800">{bookingData.mpesaReceipt || 'CONFIRMED'}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-orange-100/80 flex items-center justify-between text-[11px] text-slate-400">
                <span>Show this ticket at departure point</span>
                <span className="font-semibold text-orange-600">flytrailstravels.com</span>
              </div>
            </div>

            <div className="mt-5 flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={handlePrint}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 px-4 text-sm transition"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Save Ticket</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium py-3 px-5 text-sm transition"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4: FAILED ───────────────────────────────────────── */}
        {step === 'failed' && (
          <div className="py-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
              <AlertCircle className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Payment Incomplete</h3>
            <p className="mt-2 text-sm text-slate-600 max-w-sm mx-auto">
              {errorMsg || 'We could not verify your M-Pesa transaction.'}
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={() => setStep('form')}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2.5 px-5 text-sm transition"
              >
                Try Again
              </button>
              <a
                href={`${whatsappHref.split('?')[0]}?text=${encodeURIComponent(
                  `Hi Flytrails, I had an issue paying for "${title}" via M-Pesa. Can you assist me?`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium py-2.5 px-5 text-sm transition"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
