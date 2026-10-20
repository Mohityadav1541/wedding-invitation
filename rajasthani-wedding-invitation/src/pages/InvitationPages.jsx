import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowUpRight, CalendarDays, Clock3, Heart, MapPin, Share2, Sparkles, Users } from 'lucide-react'
import { useWeddingData, useCustomPages } from '../lib/weddingSettings.js'
import GaneshMantraPlayer from '../components/GaneshMantraPlayer.jsx'
import { RajPortrait } from '../components/RajPortrait.jsx'

function InvitationPageLayout({ eyebrow = 'शुभ विवाह', title, subtitle, children }) {
  const wedding = useWeddingData()
  const pages = useCustomPages().filter((page) => page.showInNav !== false)
  const names = `${wedding.brideName || 'दुल्हन का नाम'} एवं ${wedding.groomName || 'दूल्हे का नाम'}`
  return (
    <div className="invite-page-shell">
      <div className="invite-page-ribbon">॥ श्री गणेशाय नमः ॥ <span>पधारो म्हारे देश</span> ॥ शुभ मंगलम् ॥</div>
      <header className="invite-page-header">
        <Link className="invite-page-brand" to="/"><span className="brand-mark"><span>श्री</span><i /></span><span><strong>शुभ विवाह</strong><small>{names}</small></span></Link>
        <nav className="invite-page-nav" aria-label="विवाह पृष्ठ">
          <Link to="/ganesh">श्री गणेश वंदना</Link><Link to="/events">शुभ अवसर</Link><Link to="/story">हमारी कहानी</Link><Link to="/venue">शुभ स्थल</Link><Link to="/gallery">चित्रावली</Link><Link to="/rsvp">उपस्थिति</Link>
          {pages.map((page) => <Link key={page.id} to={`/${page.slug}`}>{page.title}</Link>)}
        </nav>
      </header>
      <main className="invite-page-main">
        <section className="invite-page-title">
          <div className="invite-page-ornament">✦　❀　✦</div>
          <p>{eyebrow}</p>
          <h1>{title}</h1>
          {subtitle && <div className="invite-page-subtitle">{subtitle}</div>}
          <div className="invite-page-names">{names}</div>
        </section>
        <div className="invite-page-content">{children}</div>
        <div className="invite-page-bottom-actions"><Link className="button button-outline" to="/"><ArrowLeft size={16} /> मुख्य आमंत्रण पर लौटें</Link><button type="button" className="button button-maroon" onClick={async () => { const url = window.location.href; try { if (navigator.share) await navigator.share({ title, text: names, url }); else { await navigator.clipboard.writeText(url); window.alert('लिंक कॉपी हो गया है।') } } catch { /* Share dismissed or unavailable. */ } }}><Share2 size={16} /> यह पृष्ठ साझा करें</button></div>
      </main>
      <footer className="invite-page-footer">आपका आगमन हमारे लिए सौभाग्य है · मंगलमय हो यह पावन बंधन <Link to="/admin">प्रशासन</Link></footer>
    </div>
  )
}


function GaneshPage() {
  const wedding = useWeddingData()
  return (
    <div className="ganesh-vandana-page">
      <div className="ganesh-vandana-topline">॥ श्री गणेशाय नमः ॥ <span>पधारो म्हारे देश</span> ॥ शुभ मंगलम् ॥</div>
      <header className="ganesh-vandana-header">
        <Link className="invite-page-brand" to="/"><span className="brand-mark"><span>श्री</span><i /></span><span><strong>शुभ विवाह</strong><small>राजसी राजस्थानी आमंत्रण</small></span></Link>
        <Link className="button button-outline" to="/">मुख्य आमंत्रण <ArrowLeft size={15} /></Link>
      </header>
      <main className="ganesh-vandana-main">
        <div className="ganesh-vandana-decor ganesh-vandana-left" aria-hidden="true">✿</div>
        <div className="ganesh-vandana-decor ganesh-vandana-right" aria-hidden="true">✿</div>
        <section className="ganesh-vandana-card">
          <div className="ganesh-vandana-kicker"><span>✦</span> मंगल आरंभ <span>✦</span></div>
          <div className="ganesh-page-image-frame"><div className="ganesh-page-image-aura"/><img src={wedding.ganeshPhoto || '/images/ganesh-ji-royal.jpg'} alt="भगवान श्री गणेश जी की राजसी सज्जा में भक्तिमय छवि" /></div>
          <p className="ganesh-vandana-mantra">॥ श्री गणेशाय नमः ॥</p>
          <h1>प्रथम निमंत्रण<br/><em>विघ्नहर्ता के श्रीचरणों में</em></h1>
          <p className="ganesh-vandana-copy">वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ।<br/>निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥</p>
          <div className="ganesh-vandana-divider"><span/>❀<span/></div>
          <p className="ganesh-vandana-note">नवजीवन के इस पावन मंगल अवसर का शुभारंभ<br/>प्रथम पूज्य भगवान श्री गणेश जी के आशीर्वाद से।</p>
          <p className="ganesh-vandana-couple">{wedding.brideName || 'दुल्हन का नाम'} <span>✦</span> {wedding.groomName || 'दूल्हे का नाम'}</p>
          <Link className="button button-gold" to="/">शुभ विवाह आमंत्रण में प्रवेश करें <ArrowUpRight size={16}/></Link>
        </section>
      </main>
      <GaneshMantraPlayer audioSrc={wedding.mantraAudioUrl || '/music/ganesh-mantra.mp3'} />
      <footer className="ganesh-vandana-footer">आपका आगमन हमारे लिए सौभाग्य है · मंगलमय हो यह पावन बंधन</footer>
    </div>
  )
}

function EventsPage() {
  const wedding = useWeddingData()
  return <InvitationPageLayout eyebrow="उत्सवों की रौनक" title="शुभ अवसर एवं रस्में" subtitle="हर रस्म में प्रेम, परंपरा और अपनों का स्नेह">
    <div className="route-event-grid">{wedding.events.map((event, index) => <article className="route-event-card" key={event.id}><span className="route-card-number">०{index + 1}</span><Sparkles size={24} /><p>{event.subtitle}</p><h2>{event.title}</h2><div className="route-event-meta"><span><CalendarDays size={15} />{event.date || 'तिथि शीघ्र घोषित होगी'}</span><span><Clock3 size={15} />{event.time || 'समय शीघ्र घोषित होगा'}</span></div><p className="route-event-description">{event.description}</p><div className="route-attire"><small>वेशभूषा</small>{event.attire || 'पारंपरिक परिधान'}</div></article>)}</div>
  </InvitationPageLayout>
}

function StoryPage() {
  const wedding = useWeddingData()
  return <InvitationPageLayout eyebrow="एक रिश्ता · एक सफ़र" title="हमारी प्रेम कहानी" subtitle="दो जीवन, दो परिवार और साथ निभाने का सुंदर वचन">
    <div className="route-story-list">{wedding.story.map((item, index) => <article className="route-story-item" key={`${item.title}-${index}`}><span>{String(index + 1).padStart(2, '0')}</span><div><small>{item.year}</small><h2>{item.title}</h2><p>{item.description}</p></div><Heart size={22} /></article>)}</div>
  </InvitationPageLayout>
}

function VenuePage() {
  const wedding = useWeddingData()
  const venue = wedding.venue
  const query = venue.googleMapsQuery || venue.address || venue.name
  return <InvitationPageLayout eyebrow="मिलन का शुभ स्थल" title={venue.name || 'विवाह स्थल'} subtitle="आपके स्नेह और आशीर्वाद से ही यह उत्सव पूर्ण होगा।">
    <div className="route-venue-card"><div className="route-venue-icon"><MapPin size={34} /></div><h2>{venue.name || 'विवाह स्थल का नाम'}</h2><p>{venue.address || 'पूरा पता शीघ्र साझा किया जाएगा'}</p><p>{venue.city}</p><div className="route-venue-date"><CalendarDays size={18} />{wedding.weddingDateLabel || 'शुभ तिथि शीघ्र घोषित होगी'} <span>·</span> {wedding.weddingTimeLabel || 'शुभ मुहूर्त'}</div>{query && <a className="button button-maroon" href={/^https?:\/\//i.test(query) ? query : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`} target="_blank" rel="noreferrer">Google Maps में दिशा देखें <MapPin size={16} /></a>}</div>
  </InvitationPageLayout>
}

function GalleryPage() {
  const wedding = useWeddingData()
  const people = [
    { name: wedding.brideName || 'दुल्हन का नाम', role: 'दुल्हन', image: wedding.bridePhoto },
    { name: wedding.groomName || 'दूल्हे का नाम', role: 'दूल्हा', image: wedding.groomPhoto },
  ]
  return (
    <InvitationPageLayout eyebrow="यादों की पोटली" title="चित्रावली" subtitle="दोनों परिवारों के लिए प्रेम से सजे कुछ खास पल">
      <div className="raj-gallery-section">
        <div className="raj-gallery-grid">
          {people.map((person) => (
            <div className="couple-portrait-unit" key={person.role}>
              <RajPortrait src={person.image} alt={person.name} placeholder={`${person.role} का चित्र`} />
              <p className="couple-portrait-label">{person.name}</p>
              <p className="couple-portrait-role">{person.role}</p>
            </div>
          ))}
        </div>
        {!wedding.bridePhoto && !wedding.groomPhoto && (
          <p className="raj-gallery-empty">दुल्हन और दूल्हे के चित्र व्यवस्थापक पृष्ठ से जोड़ें।</p>
        )}
      </div>
    </InvitationPageLayout>
  )
}

function RsvpPage() {
  const wedding = useWeddingData()
  const [form, setForm] = useState({ name: '', phone: '', attendance: 'yes', guests: '2', message: '' })
  const [sent, setSent] = useState(false)
  const submit = (event) => {
    event.preventDefault()
    const record = { ...form, name: form.name.trim(), submittedAt: new Date().toISOString(), couple: { bride: wedding.brideName, groom: wedding.groomName } }
    try {
      const old = JSON.parse(localStorage.getItem('rajasthani-wedding-rsvp') || '[]')
      localStorage.setItem('rajasthani-wedding-rsvp', JSON.stringify([...old, record]))
    } catch { /* Local demo RSVP does not block guest confirmation. */ }
    setSent(true)
  }
  return <InvitationPageLayout eyebrow="आपका स्नेह अनमोल है" title="अपनी उपस्थिति बताएँ" subtitle="कृपया अपने आने की जानकारी देकर हमारे स्वागत को आसान बनाएँ।">
    {sent ? <div className="route-rsvp-success"><Heart size={35} /><h2>आपके स्नेह के लिए आभार!</h2><p>आपका उत्तर इस ब्राउज़र में सुरक्षित हुआ है। असली साझा अतिथि-सूची के लिए सर्वर कनेक्शन आवश्यक है।</p></div> : <form className="route-rsvp-form" onSubmit={submit}><label>आपका पूरा नाम *<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="अपना नाम लिखें" /></label><label>मोबाइल नंबर<input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="वैकल्पिक" /></label><label>क्या आप पधारेंगे?<select value={form.attendance} onChange={(e) => setForm({ ...form, attendance: e.target.value })}><option value="yes">हाँ, सादर उपस्थित रहूँगा/रहूँगी</option><option value="no">क्षमा करें, उपस्थित नहीं हो पाऊँगा/पाऊँगी</option></select></label><label>कितने अतिथि आएँगे?<select disabled={form.attendance === 'no'} value={form.guests} onChange={(e) => setForm({ ...form, guests: e.target.value })}><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5+">5 या अधिक</option></select></label><label>शुभकामना संदेश<textarea rows="4" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="नवयुगल के लिए संदेश लिखें" /></label><button className="button button-maroon" type="submit"><Users size={16} /> उत्तर भेजें</button><p>नमूना फॉर्म उत्तर को केवल इसी ब्राउज़र में सुरक्षित रखता है।</p></form>}
  </InvitationPageLayout>
}

export function FixedInvitationPage({ fixedSlug }) {
  const { slug } = useParams()
  const currentSlug = fixedSlug || slug
  if (currentSlug === 'ganesh') return <GaneshPage />
  if (currentSlug === 'events') return <EventsPage />
  if (currentSlug === 'story') return <StoryPage />
  if (currentSlug === 'venue') return <VenuePage />
  if (currentSlug === 'gallery') return <GalleryPage />
  if (currentSlug === 'rsvp') return <RsvpPage />
  return null
}

export function CustomWeddingPage() {
  const { slug } = useParams()
  const pages = useCustomPages()
  const page = pages.find((item) => item.slug === slug)
  if (!page) return <InvitationPageLayout eyebrow="पृष्ठ उपलब्ध नहीं" title="यह पृष्ठ नहीं मिला" subtitle="आमंत्रण के मुख्य पृष्ठ पर वापस जाएँ।"><Link className="button button-maroon" to="/">मुख्य आमंत्रण</Link></InvitationPageLayout>
  return <InvitationPageLayout eyebrow={page.eyebrow || 'शुभ विवाह'} title={page.title} subtitle={page.subtitle}>
    {page.image && <div className="custom-page-cover"><img src={page.image} alt={page.title} /></div>}
    <article className="custom-page-body">{(page.content || '').split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</article>
    {page.eventDate || page.eventTime ? <div className="route-event-meta custom-page-meta"><span><CalendarDays size={15} />{page.eventDate || 'तिथि शीघ्र घोषित होगी'}</span><span><Clock3 size={15} />{page.eventTime || 'समय शीघ्र घोषित होगा'}</span></div> : null}
    {page.mapUrl && <a className="button button-maroon" href={page.mapUrl} target="_blank" rel="noreferrer">मानचित्र में देखें <MapPin size={16} /></a>}
  </InvitationPageLayout>
}
