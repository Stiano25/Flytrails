import { Router } from 'express';
import { getSupabaseAdmin } from './supabaseAdmin.js';
import { initiateSTKPush, parseCallbackPayload, normalizePhone } from './mpesa.js';
import { sendBookingConfirmation, sendAdminBookingAlert } from './resendMail.js';

export const mpesaRouter = Router();

function generateTicketNumber() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `FLY-${yyyy}${mm}${dd}-${rand}`;
}

/**
 * POST /api/mpesa/pay
 * Initiates booking & triggers STK push to customer's phone
 */
mpesaRouter.post('/pay', async (req, res) => {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return res.status(503).json({ error: 'Database service is temporarily unavailable.' });
  }

  const { tripId, customerName, customerEmail, customerPhone, slots } = req.body || {};

  // Validation
  if (!tripId || !customerName || !customerEmail || !customerPhone) {
    return res.status(400).json({ error: 'All fields (trip, name, email, phone) are required.' });
  }

  const parsedSlots = parseInt(slots, 10) || 1;
  if (parsedSlots < 1 || parsedSlots > 20) {
    return res.status(400).json({ error: 'Please choose between 1 and 20 slots.' });
  }

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(customerEmail).trim());
  if (!emailOk) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }

  let validPhone;
  try {
    validPhone = normalizePhone(customerPhone);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  try {
    // 1. Fetch trip details
    const { data: trip, error: tripErr } = await supabase
      .from('trips')
      .select('id, title, price, spots_left, is_active, next_departure')
      .eq('id', tripId)
      .maybeSingle();

    if (tripErr || !trip) {
      return res.status(404).json({ error: 'Trip not found or no longer available.' });
    }

    if (!trip.is_active) {
      return res.status(400).json({ error: 'This trip is currently inactive.' });
    }

    if (trip.spots_left !== null && trip.spots_left < parsedSlots) {
      return res.status(400).json({
        error: trip.spots_left <= 0
          ? 'Sorry, this trip is completely sold out!'
          : `Only ${trip.spots_left} spot${trip.spots_left === 1 ? '' : 's'} remaining for this trip.`,
      });
    }

    const pricePerSlot = Number(trip.price) || 0;
    if (pricePerSlot <= 0) {
      return res.status(400).json({ error: 'Invalid trip price. Please contact support.' });
    }

    const totalAmount = pricePerSlot * parsedSlots;
    const ticketNumber = generateTicketNumber();

    // 2. Create pending booking record in DB
    const { data: booking, error: bookingErr } = await supabase
      .from('bookings')
      .insert({
        ticket_number: ticketNumber,
        trip_id: trip.id,
        trip_title: trip.title,
        trip_departure: trip.next_departure || null,
        customer_name: String(customerName).trim(),
        customer_email: String(customerEmail).trim().toLowerCase(),
        customer_phone: validPhone,
        slots: parsedSlots,
        amount: totalAmount,
        payment_status: 'pending',
      })
      .select()
      .single();

    if (bookingErr || !booking) {
      console.error('[mpesaRoutes] Error inserting booking:', bookingErr);
      return res.status(500).json({ error: 'Could not create booking reservation. Please try again.' });
    }

    // 3. Initiate M-Pesa STK Push
    let stkResult;
    try {
      stkResult = await initiateSTKPush({
        phone: validPhone,
        amount: totalAmount,
        accountRef: ticketNumber,
      });
    } catch (stkErr) {
      console.error('[mpesaRoutes] STK Push initiation failed:', stkErr.message);
      // Mark booking failed
      await supabase
        .from('bookings')
        .update({ payment_status: 'failed' })
        .eq('id', booking.id);

      return res.status(502).json({
        error: `M-Pesa error: ${stkErr.message || 'Could not prompt STK Push.'}`,
      });
    }

    // 4. Update booking with checkoutRequestId
    await supabase
      .from('bookings')
      .update({ mpesa_checkout_id: stkResult.checkoutRequestId })
      .eq('id', booking.id);

    return res.json({
      success: true,
      bookingId: booking.id,
      ticketNumber: booking.ticket_number,
      checkoutRequestId: stkResult.checkoutRequestId,
      message: 'STK push sent to your phone. Enter your M-Pesa PIN to complete payment.',
    });
  } catch (error) {
    console.error('[mpesaRoutes] Exception in /pay:', error);
    return res.status(500).json({ error: 'An unexpected error occurred. Please try again.' });
  }
});

/**
 * POST /api/mpesa/callback
 * Safaricom Daraja webhook callback endpoint
 */
mpesaRouter.post('/callback', async (req, res) => {
  const supabase = getSupabaseAdmin();
  const parsed = parseCallbackPayload(req.body);

  console.log('[mpesaRoutes] Callback received:', JSON.stringify(parsed));

  if (!parsed || !parsed.checkoutRequestId) {
    console.warn('[mpesaRoutes] Unrecognized callback format:', req.body);
    return res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  }

  if (!supabase) {
    console.error('[mpesaRoutes] Supabase admin not configured in callback handler!');
    return res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  }

  try {
    // 1. Find matching booking
    const { data: booking, error: findErr } = await supabase
      .from('bookings')
      .select('*')
      .eq('mpesa_checkout_id', parsed.checkoutRequestId)
      .maybeSingle();

    if (findErr || !booking) {
      console.warn(`[mpesaRoutes] No booking found for CheckoutRequestID: ${parsed.checkoutRequestId}`);
      return res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }

    if (parsed.isSuccess) {
      // 2. Mark completed
      const { data: updatedBooking, error: updErr } = await supabase
        .from('bookings')
        .update({
          payment_status: 'completed',
          mpesa_receipt: parsed.mpesaReceipt,
          paid_at: new Date().toISOString(),
        })
        .eq('id', booking.id)
        .select()
        .single();

      if (updErr) {
        console.error('[mpesaRoutes] Failed to update booking to completed:', updErr);
      } else {
        // 3. Decrement spots_left on the trip
        const { data: tripData } = await supabase
          .from('trips')
          .select('id, spots_left')
          .eq('id', booking.trip_id)
          .maybeSingle();

        if (tripData && tripData.spots_left !== null) {
          const newSpots = Math.max(0, tripData.spots_left - booking.slots);
          await supabase
            .from('trips')
            .update({ spots_left: newSpots })
            .eq('id', booking.trip_id);
        }

        // 4. Send emails via Resend (async, do not await blocking response)
        const bookingForEmail = updatedBooking || booking;
        sendBookingConfirmation(bookingForEmail).catch((e) => console.error('[mpesaRoutes] Customer email failed:', e));
        sendAdminBookingAlert(bookingForEmail).catch((e) => console.error('[mpesaRoutes] Admin email alert failed:', e));
      }
    } else {
      // Payment failed or cancelled
      console.warn(`[mpesaRoutes] Payment failed for booking ${booking.ticket_number}: ${parsed.resultDesc} (code ${parsed.resultCode})`);
      await supabase
        .from('bookings')
        .update({ payment_status: 'failed' })
        .eq('id', booking.id);
    }
  } catch (error) {
    console.error('[mpesaRoutes] Error processing callback:', error);
  }

  // Always return 200 / standard acknowledgment to Safaricom
  return res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
});

/**
 * GET /api/mpesa/status/:bookingId
 * Polling endpoint for frontend checkout modal
 */
mpesaRouter.get('/status/:bookingId', async (req, res) => {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return res.status(503).json({ error: 'Database service is temporarily unavailable.' });
  }

  const { bookingId } = req.params;

  try {
    const { data: booking, error } = await supabase
      .from('bookings')
      .select('id, ticket_number, trip_id, trip_title, trip_departure, customer_name, customer_email, customer_phone, slots, amount, payment_status, mpesa_receipt, paid_at, created_at')
      .eq('id', bookingId)
      .maybeSingle();

    if (error || !booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    return res.json({
      id: booking.id,
      ticketNumber: booking.ticket_number,
      tripId: booking.trip_id,
      tripTitle: booking.trip_title,
      tripDeparture: booking.trip_departure,
      customerName: booking.customer_name,
      customerEmail: booking.customer_email,
      customerPhone: booking.customer_phone,
      slots: booking.slots,
      amount: booking.amount,
      status: booking.payment_status,
      mpesaReceipt: booking.mpesa_receipt,
      paidAt: booking.paid_at,
      createdAt: booking.created_at,
    });
  } catch (error) {
    console.error('[mpesaRoutes] Error checking booking status:', error);
    return res.status(500).json({ error: 'Could not fetch booking status.' });
  }
});
