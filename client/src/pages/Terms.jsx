import { Link } from 'react-router-dom';
import PageHeader from '../components/site/PageHeader.jsx';
import { SITE_EMAIL, WHATSAPP_NUMBER } from '../config.js';

const TOC = ["ABOUT FLYTRAILS", "BOOKINGS & PAYMENTS", "CANCELLATIONS & REFUNDS", "TRAVEL REQUIREMENTS", "HEALTH & SAFETY", "CODE OF CONDUCT", "ITINERARY CHANGES", "THIRD-PARTY SERVICES", "MEDIA & CONTENT", "LIABILITY LIMITATION", "INTELLECTUAL PROPERTY", "PRIVACY", "GOVERNING LAW", "CONTACT"];

const phoneDisplay = `+${WHATSAPP_NUMBER}`;
const phoneHref = `tel:+${WHATSAPP_NUMBER}`;

/** "BOOKINGS & PAYMENTS" -> "Bookings & payments" */
const sentenceCase = (t) => t.charAt(0) + t.slice(1).toLowerCase().replace(/\bflytrails\b/g, 'Flytrails');
const slug = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

function Section({ n, title, children }) {
  return (
    <section id={slug(title)} className="scroll-mt-28 border-b border-brand-dark/10 pb-8 last:border-0 last:pb-0">
      <h2 className="text-xl font-semibold tracking-tight text-brand-dark md:text-2xl">
        {n}. {sentenceCase(title)}
      </h2>
      <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-brand-dark/80 md:text-base">
        {children}
      </div>
    </section>
  );
}

export default function Terms() {
  return (
    <div>
      <PageHeader
        eyebrow="Legal"
        title="Terms &"
        accent="conditions"
        description="By booking a trip, using our website or our services, you agree to the terms below."
      />

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 md:px-6 lg:grid-cols-[14rem_1fr]">
        <nav aria-label="On this page" className="hidden lg:sticky lg:top-28 lg:block lg:self-start">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-dark/45">On this page</p>
          <ol className="mt-3 space-y-2 text-sm">
            {TOC.map((t, i) => (
              <li key={t}>
                <a href={`#${slug(t)}`} className="text-brand-dark/65 hover:text-primary">
                  {i + 1}. {sentenceCase(t)}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <article className="max-w-3xl space-y-10">
          <Section n={1} title="ABOUT FLYTRAILS">
            <p>
              Flytrails organizes travel experiences including hiking trips, safaris, beach getaways, and international tours. Our goal is to
              connect people, explore destinations, and create meaningful travel experiences.
            </p>
          </Section>

          <Section n={2} title="BOOKINGS & PAYMENTS">
            <ul className="list-disc space-y-2 pl-5">
              <li>All bookings must be confirmed with a deposit or full payment as specified per trip.</li>
              <li>Payments are non-refundable unless stated otherwise.</li>
              <li>A booking is only confirmed once payment has been received.</li>
              <li>Prices may change due to external factors (fuel, park fees, exchange rates).</li>
            </ul>
          </Section>

          <Section n={3} title="CANCELLATIONS & REFUNDS">
            <ul className="list-disc space-y-2 pl-5">
              <li>Cancellations made by clients may be subject to cancellation fees.</li>
              <li>Deposits are generally non-refundable.</li>
              <li>
                If Flytrails cancels a trip, clients will be offered:
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>A full refund, or</li>
                  <li>Option to reschedule to another trip.</li>
                </ul>
              </li>
              <li>Refund timelines may vary depending on third-party providers.</li>
            </ul>
          </Section>

          <Section n={4} title="TRAVEL REQUIREMENTS">
            <p>Clients are responsible for:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Valid identification/passport</li>
              <li>Visas (if required)</li>
              <li>Vaccinations or health requirements</li>
            </ul>
            <p>Flytrails is not responsible for denied entry due to incomplete documentation.</p>
          </Section>

          <Section n={5} title="HEALTH & SAFETY">
            <ul className="list-disc space-y-2 pl-5">
              <li>Participation in activities (hiking, safaris, water sports, etc.) is at your own risk.</li>
              <li>Clients must disclose any medical conditions that may affect participation.</li>
              <li>Flytrails is not liable for injuries, accidents, or loss during trips.</li>
            </ul>
          </Section>

          <Section n={6} title="CODE OF CONDUCT">
            <p>All participants must behave respectfully toward:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Fellow travelers</li>
              <li>Local communities</li>
              <li>Guides and staff</li>
            </ul>
            <p>Flytrails reserves the right to remove any participant for misconduct without refund.</p>
          </Section>

          <Section n={7} title="ITINERARY CHANGES">
            <p>Trip itineraries may change due to:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Weather conditions</li>
              <li>Safety concerns</li>
              <li>Government regulations</li>
            </ul>
            <p>Flytrails will always aim to provide a similar or better experience.</p>
          </Section>

          <Section n={8} title="THIRD-PARTY SERVICES">
            <ul className="list-disc space-y-2 pl-5">
              <li>Flytrails works with hotels, transport providers, and activity operators.</li>
              <li>We are not liable for failures or issues caused by third-party providers.</li>
            </ul>
          </Section>

          <Section n={9} title="MEDIA & CONTENT">
            <ul className="list-disc space-y-2 pl-5">
              <li>
                By joining a Flytrails trip, you consent to photos/videos being taken. In case you are not comfortable, kindly alert the
                photographer in advance.
              </li>
              <li>These may be used for marketing purposes unless you request otherwise.</li>
            </ul>
          </Section>

          <Section n={10} title="LIABILITY LIMITATION">
            <p>Flytrails shall not be held liable for:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Loss of personal belongings</li>
              <li>Travel delays or cancellations</li>
              <li>Injuries, illness, or accidents</li>
              <li>Acts of nature or unforeseen events</li>
            </ul>
          </Section>

          <Section n={11} title="INTELLECTUAL PROPERTY">
            <p>
              All content on the Flytrails website (logos, images, text) belongs to Flytrails and may not be used without permission.
            </p>
          </Section>

          <Section n={12} title="PRIVACY">
            <p>
              Your personal information is collected and used only for booking and communication purposes. We do not sell or share your data
              with unauthorized parties.
            </p>
          </Section>

          <Section n={13} title="GOVERNING LAW">
            <p>These Terms & Conditions are governed by the laws of Kenya.</p>
          </Section>

          <Section n={14} title="CONTACT">
            <p>For any inquiries, contact:</p>
            <p className="font-medium text-brand-dark">Flytrails</p>
            <p>
              Email:{' '}
              <a href={`mailto:${SITE_EMAIL}`} className="text-primary underline transition hover:text-primary/80">
                {SITE_EMAIL}
              </a>
            </p>
            <p>
              Phone:{' '}
              <a href={phoneHref} className="text-primary underline transition hover:text-primary/80">
                {phoneDisplay}
              </a>
            </p>
          </Section>

          <p className="border-t border-brand-dark/10 pt-8 text-sm font-medium text-brand-dark/90 md:text-base">
            By using our services, you confirm that you have read, understood, and agreed to these Terms & Conditions.
          </p>
          <p className="text-sm text-brand-dark/60">
            Questions about these terms?{' '}
            <Link to="/contact" className="text-primary underline transition hover:text-primary/80">
              Contact us
            </Link>
            .
          </p>
        </article>
      </div>
    </div>
  );
}
