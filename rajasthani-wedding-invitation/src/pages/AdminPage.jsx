import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Check, Eye, FilePlus2, ImagePlus, LayoutDashboard, LogOut, Save, Trash2, Upload, Users, X } from 'lucide-react'
import { compressImageFile, getCustomPages, getWeddingData, reservedSlugs, saveCustomPages, saveWeddingSettings, toSlug, useCustomPages, useWeddingData } from '../lib/weddingSettings.js'
import { RajPortrait } from '../components/RajPortrait.jsx'

const DEMO_PIN = 'SHAADI2026'
const emptyPage = { id: '', title: '', slug: '', eyebrow: 'शुभ विवाह', subtitle: '', content: '', image: '', eventDate: '', eventTime: '', mapUrl: '', showInNav: true }

function ImageField({ label, image, onChange, onRemove }) {
  return <div className="admin-image-field"><div className="admin-image-preview">{image ? <img src={image} alt={`${label} का पूर्वावलोकन`} /> : <div><ImagePlus size={25} /><span>चित्र जोड़ें</span></div>}</div><div className="admin-image-copy"><strong>{label}</strong><p>JPG, PNG या WebP · अधिकतम 12 MB</p><label className="admin-button admin-button-quiet"><Upload size={15} /> {image ? 'चित्र बदलें' : 'चित्र अपलोड करें'}<input type="file" accept="image/*" onChange={async (event) => { const file = event.target.files?.[0]; if (!file) return; try { onChange(await compressImageFile(file)) } catch (error) { window.alert(error.message || 'चित्र अपलोड नहीं हुआ।') } event.target.value = '' }} /></label>{image && <button className="admin-text-danger" type="button" onClick={onRemove}><Trash2 size={14} /> हटाएँ</button>}</div></div>
}

export default function AdminPage() {
  const wedding = useWeddingData()
  const pages = useCustomPages()
  const [authorized, setAuthorized] = useState(() => sessionStorage.getItem('rajasthani-wedding-admin-demo') === 'yes')
  const [pin, setPin] = useState('')
  const [activeTab, setActiveTab] = useState('details')
  const [notice, setNotice] = useState('')
  const [settings, setSettings] = useState(() => getWeddingData())
  const [pageDraft, setPageDraft] = useState(emptyPage)
  const [rsvpList, setRsvpList] = useState([])
  const [busyImage, setBusyImage] = useState(false)

  useEffect(() => setSettings(wedding), [wedding])
  useEffect(() => {
    try { setRsvpList(JSON.parse(localStorage.getItem('rajasthani-wedding-rsvp') || '[]')) } catch { setRsvpList([]) }
  }, [activeTab])

  const showNotice = (message) => {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 3500)
  }
  const update = (key, value) => setSettings((current) => ({ ...current, [key]: value }))
  const updateVenue = (key, value) => setSettings((current) => ({ ...current, venue: { ...current.venue, [key]: value } }))

  const signIn = (event) => {
    event.preventDefault()
    if (pin !== DEMO_PIN) { showNotice('डेमो PIN सही नहीं है। README में दिया गया PIN आज़माएँ।'); return }
    sessionStorage.setItem('rajasthani-wedding-admin-demo', 'yes')
    setAuthorized(true)
  }

  const saveDetails = (event) => {
    event.preventDefault()
    try {
      saveWeddingSettings({
        brideName: settings.brideName,
        groomName: settings.groomName,
        bridePhoto: settings.bridePhoto || '',
        groomPhoto: settings.groomPhoto || '',
        ganeshPhoto: settings.ganeshPhoto || '',
        ganeshGardenPhoto: settings.ganeshGardenPhoto || '',
        familyLine: settings.familyLine,
        blessing: settings.blessing,
        weddingDate: settings.weddingDate,
        weddingDateLabel: settings.weddingDateLabel,
        weddingTimeLabel: settings.weddingTimeLabel,
        venue: settings.venue,
        events: settings.events,
        story: settings.story,
        musicUrl: settings.musicUrl,
      })
      showNotice('विवाह विवरण इस ब्राउज़र में सुरक्षित हो गए।')
    } catch {
      showNotice('सेटिंग्स सेव नहीं हो सकीं। छोटे चित्र चुनें या ब्राउज़र स्टोरेज खाली करें।')
    }
  }

  const acceptPageImage = async (file) => {
    if (!file) return
    setBusyImage(true)
    try { const compressed = await compressImageFile(file); setPageDraft((current) => ({ ...current, image: compressed })) } catch (error) { showNotice(error.message || 'चित्र जोड़ नहीं पाए।') } finally { setBusyImage(false) }
  }

  const editPage = (page) => {
    setPageDraft({ ...emptyPage, ...page })
    setActiveTab('pages')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const savePage = (event) => {
    event.preventDefault()
    const slug = toSlug(pageDraft.slug || pageDraft.title)
    if (!pageDraft.title.trim()) { showNotice('पृष्ठ का शीर्षक भरें।'); return }
    if (!slug) { showNotice('URL स्लग अंग्रेज़ी अक्षरों में भरें, जैसे mehndi।'); return }
    if (reservedSlugs.has(slug)) { showNotice(`/${slug} पहले से वेबसाइट के लिए आरक्षित है। दूसरा स्लग चुनें।`); return }
    if (pages.some((page) => page.slug === slug && page.id !== pageDraft.id)) { showNotice('यह URL स्लग पहले से मौजूद है।'); return }
    const record = { ...pageDraft, id: pageDraft.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`), slug, title: pageDraft.title.trim() }
    try {
      saveCustomPages(pageDraft.id ? pages.map((page) => page.id === pageDraft.id ? record : page) : [...pages, record])
      setPageDraft(emptyPage)
      showNotice(`पृष्ठ सुरक्षित हो गया: /${slug}`)
    } catch {
      showNotice('पृष्ठ सेव नहीं हुआ। चित्र छोटा करके पुनः प्रयास करें।')
    }
  }

  const deletePage = (page) => {
    if (!window.confirm(`क्या आप “${page.title}” पृष्ठ हटाना चाहते हैं?`)) return
    saveCustomPages(pages.filter((item) => item.id !== page.id))
    if (pageDraft.id === page.id) setPageDraft(emptyPage)
    showNotice('पृष्ठ हटा दिया गया।')
  }

  if (!authorized) return <div className="admin-login-shell"><div className="admin-login-card"><Link to="/" className="admin-back-link"><ArrowLeft size={15} /> आमंत्रण पर लौटें</Link><div className="admin-login-seal">श्री</div><p className="admin-eyebrow">शुभ विवाह · प्रशासन</p><h1>व्यवस्थापक प्रवेश</h1><p>यह केवल स्थानीय डेमो प्रवेश है। साझा वेबसाइट की सुरक्षा के लिए सर्वर-आधारित लॉगिन जोड़ना होगा।</p><form onSubmit={signIn}><label>डेमो PIN<input type="password" value={pin} onChange={(event) => setPin(event.target.value)} placeholder="README में दिया गया PIN" autoComplete="current-password" /></label><button className="admin-button admin-button-primary" type="submit">प्रवेश करें <ArrowLeft className="admin-arrow-flip" size={16} /></button></form>{notice && <div className="admin-notice">{notice}</div>}</div></div>

  return <div className="admin-shell">
    <header className="admin-header"><Link className="admin-brand" to="/"><span className="brand-mark"><span>श्री</span><i /></span><span><strong>शुभ विवाह</strong><small>विवाह व्यवस्थापक</small></span></Link><div className="admin-header-actions"><Link to="/" className="admin-button admin-button-quiet"><Eye size={16} /> आमंत्रण देखें</Link><button className="admin-button admin-button-quiet" type="button" onClick={() => { sessionStorage.removeItem('rajasthani-wedding-admin-demo'); setAuthorized(false) }}><LogOut size={16} /> बाहर जाएँ</button></div></header>
    <div className="admin-main"><aside className="admin-sidebar"><div className="admin-sidebar-heading"><span>प्रशासन पटल</span><small>विवाह वेबसाइट का प्रबंधन</small></div><button className={activeTab === 'details' ? 'active' : ''} type="button" onClick={() => setActiveTab('details')}><LayoutDashboard size={17} /> विवरण व फ़ोटो</button><button className={activeTab === 'pages' ? 'active' : ''} type="button" onClick={() => setActiveTab('pages')}><FilePlus2 size={17} /> पृष्ठ प्रबंधक <span className="admin-side-count">{pages.length}</span></button><button className={activeTab === 'rsvp' ? 'active' : ''} type="button" onClick={() => setActiveTab('rsvp')}><Users size={17} /> RSVP उत्तर <span className="admin-side-count">{rsvpList.length}</span></button><div className="admin-side-note"><strong>ध्यान दें</strong><p>यह डेमो बदलाव इसी ब्राउज़र में सहेजता है। सभी मेहमानों के लिए बदलाव साझा करने हेतु डेटाबेस और इमेज स्टोरेज जोड़ें।</p></div></aside>
      <main className="admin-content"><div className="admin-page-heading"><div><p className="admin-eyebrow">राजसी राजस्थानी आमंत्रण</p><h1>{activeTab === 'details' ? 'विवाह विवरण संपादित करें' : activeTab === 'pages' ? 'अलग-अलग पृष्ठ और URL बनाएँ' : 'मेहमानों के उत्तर'}</h1><p>{activeTab === 'details' ? 'नाम, चित्र, तिथि और स्थल बदलें।' : activeTab === 'pages' ? 'मेहंदी, हल्दी, संगीत या किसी विशेष रस्म के लिए अलग URL बनाएँ।' : 'इस ब्राउज़र में संग्रहीत डेमो RSVP सूची।'}</p></div><Link to="/" className="admin-live-link"><Eye size={15} /> लाइव आमंत्रण <ArrowLeft className="admin-arrow-flip" size={14} /></Link></div>
      {notice && <div className="admin-notice" role="status"><Check size={16} />{notice}<button onClick={() => setNotice('')} aria-label="सूचना बंद करें" type="button"><X size={15} /></button></div>}

      {activeTab === 'details' && <form className="admin-panel" onSubmit={saveDetails}>
        <section className="admin-form-section"><div className="admin-section-title"><span>०१</span><div><h2>दूल्हा और दुल्हन</h2><p>नाम तथा आमंत्रण में दिखाई देने वाले चित्र</p></div></div><div className="admin-two-cols"><label className="admin-field">दुल्हन का नाम<input value={settings.brideName || ''} onChange={(e) => update('brideName', e.target.value)} placeholder="दुल्हन का पूरा नाम" /></label><label className="admin-field">दूल्हे का नाम<input value={settings.groomName || ''} onChange={(e) => update('groomName', e.target.value)} placeholder="दूल्हे का पूरा नाम" /></label></div><div className="admin-two-cols admin-image-cols"><ImageField label="दुल्हन की तस्वीर" image={settings.bridePhoto || ''} onChange={(value) => update('bridePhoto', value)} onRemove={() => update('bridePhoto', '')} /><ImageField label="दूल्हे की तस्वीर" image={settings.groomPhoto || ''} onChange={(value) => update('groomPhoto', value)} onRemove={() => update('groomPhoto', '')} /><ImageField label="श्री गणेश जी का स्वतंत्र चित्र" image={settings.ganeshPhoto || ''} onChange={(value) => update('ganeshPhoto', value)} onRemove={() => update('ganeshPhoto', '')} /><ImageField label="मुखपृष्ठ का गणेश-उद्यान दृश्य" image={settings.ganeshGardenPhoto || ''} onChange={(value) => update('ganeshGardenPhoto', value)} onRemove={() => update('ganeshGardenPhoto', '')} /></div>{(settings.bridePhoto || settings.groomPhoto) && (
            <div className="admin-couple-preview-block">
              <p className="admin-inline-help" style={{ marginBottom: 8, fontWeight: 600, color: '#8a5c38' }}>
                राजसी पारंपरिक फ़्रेम में पूर्वावलोकन (लाइव आमंत्रण में इसी रूप में दिखेगा):
              </p>
              <div className="admin-couple-preview-row">
                {settings.bridePhoto && (
                  <div className="admin-couple-preview-item">
                    <p className="admin-couple-preview-label">दुल्हन</p>
                    <RajPortrait src={settings.bridePhoto} alt={settings.brideName || 'दुल्हन'} placeholder="दुल्हन" />
                    <small style={{ color: '#8a5c38', fontSize: 12, fontWeight: 600 }}>{settings.brideName || 'दुल्हन'}</small>
                  </div>
                )}
                {settings.groomPhoto && (
                  <div className="admin-couple-preview-item">
                    <p className="admin-couple-preview-label">दूल्हा</p>
                    <RajPortrait src={settings.groomPhoto} alt={settings.groomName || 'दूल्हा'} placeholder="दूल्हा" />
                    <small style={{ color: '#8a5c38', fontSize: 12, fontWeight: 600 }}>{settings.groomName || 'दूल्हा'}</small>
                  </div>
                )}
              </div>
            </div>
          )}
          <p className="admin-inline-help">दुल्हन, दूल्हे, श्री गणेश जी के स्वतंत्र चित्र और मुखपृष्ठ के उद्यान-दृश्य को अलग-अलग बदल सकते हैं। किसी चित्र को खाली करने पर डिफ़ॉल्ट दृश्य उपयोग होगा।</p></section>
        <section className="admin-form-section"><div className="admin-section-title"><span>०२</span><div><h2>तिथि और पारिवारिक संदेश</h2><p>शादी की जानकारी अपने अनुसार अपडेट करें</p></div></div><div className="admin-two-cols"><label className="admin-field">तिथि / तारीख का प्रदर्शन<input value={settings.weddingDateLabel || ''} onChange={(e) => update('weddingDateLabel', e.target.value)} placeholder="जैसे, रविवार, १४ फ़रवरी २०२७" /></label><label className="admin-field">समय / शुभ मुहूर्त<input value={settings.weddingTimeLabel || ''} onChange={(e) => update('weddingTimeLabel', e.target.value)} placeholder="जैसे, सायं ६:३० बजे" /></label><label className="admin-field">Countdown की तारीख और समय<input type="datetime-local" value={settings.weddingDate ? String(settings.weddingDate).slice(0, 16) : ''} onChange={(e) => update('weddingDate', e.target.value ? `${e.target.value}:00+05:30` : '')} /></label><label className="admin-field">परिवार का संदेश<input value={settings.familyLine || ''} onChange={(e) => update('familyLine', e.target.value)} placeholder="दो परिवारों के स्नेह और आशीर्वाद सहित" /></label></div><label className="admin-field">शुभाशीष / मंगल पाठ<textarea rows="3" value={settings.blessing || ''} onChange={(e) => update('blessing', e.target.value)} /></label></section>
        <section className="admin-form-section"><div className="admin-section-title"><span>०३</span><div><h2>विवाह स्थल</h2><p>वेन्यू और दिशा लिंक</p></div></div><div className="admin-two-cols"><label className="admin-field">स्थल का नाम<input value={settings.venue?.name || ''} onChange={(e) => updateVenue('name', e.target.value)} placeholder="विवाह स्थल / पैलेस" /></label><label className="admin-field">शहर<input value={settings.venue?.city || ''} onChange={(e) => updateVenue('city', e.target.value)} placeholder="शहर" /></label></div><label className="admin-field">पूरा पता<input value={settings.venue?.address || ''} onChange={(e) => updateVenue('address', e.target.value)} placeholder="स्थल का पूरा पता" /></label><label className="admin-field">Google Maps URL या खोज पाठ<input value={settings.venue?.googleMapsQuery || ''} onChange={(e) => updateVenue('googleMapsQuery', e.target.value)} placeholder="Maps लिंक या स्थल का पता" /></label></section>
        <div className="admin-form-actions"><button type="submit" className="admin-button admin-button-primary"><Save size={16} /> बदलाव सुरक्षित करें</button><button type="button" className="admin-button admin-button-quiet" onClick={() => setSettings(getWeddingData())}>बदलाव रद्द करें</button></div>
      </form>}

      {activeTab === 'pages' && <div className="admin-page-manager"><form className="admin-panel" onSubmit={savePage}><div className="admin-section-title"><span>✦</span><div><h2>{pageDraft.id ? 'पृष्ठ संपादित करें' : 'नया पृष्ठ बनाएँ'}</h2><p>हर पृष्ठ का अपना लिंक होगा, जैसे /mehndi या /haldi</p></div></div><div className="admin-two-cols"><label className="admin-field">पृष्ठ का नाम / शीर्षक<input required value={pageDraft.title} onChange={(e) => setPageDraft((v) => ({ ...v, title: e.target.value, slug: v.id ? v.slug : (toSlug(e.target.value) || v.slug) }))} placeholder="जैसे, मेहंदी की शाम" /></label><label className="admin-field">URL स्लग (अंग्रेज़ी में)<div className="admin-slug-input"><span>/</span><input required value={pageDraft.slug} onChange={(e) => setPageDraft((v) => ({ ...v, slug: toSlug(e.target.value) }))} placeholder="mehndi" /></div></label></div><label className="admin-field">छोटा परिचय<input value={pageDraft.subtitle} onChange={(e) => setPageDraft((v) => ({ ...v, subtitle: e.target.value }))} placeholder="रंग, हँसी और शुभ शुरुआत" /></label><div className="admin-two-cols"><label className="admin-field">तिथि (वैकल्पिक)<input value={pageDraft.eventDate} onChange={(e) => setPageDraft((v) => ({ ...v, eventDate: e.target.value }))} placeholder="शनिवार, १२ फरवरी" /></label><label className="admin-field">समय (वैकल्पिक)<input value={pageDraft.eventTime} onChange={(e) => setPageDraft((v) => ({ ...v, eventTime: e.target.value }))} placeholder="सायं ५ बजे" /></label></div><label className="admin-field">पृष्ठ का विवरण<textarea rows="6" value={pageDraft.content} onChange={(e) => setPageDraft((v) => ({ ...v, content: e.target.value }))} placeholder={'रस्म या कार्यक्रम के बारे में लिखें।\n\nअलग-अलग पैराग्राफ के लिए एक खाली पंक्ति छोड़ें।'} /></label><label className="admin-field">मानचित्र URL (वैकल्पिक)<input value={pageDraft.mapUrl} onChange={(e) => setPageDraft((v) => ({ ...v, mapUrl: e.target.value }))} placeholder="https://maps.google.com/..." /></label><div className="admin-page-upload"><div className="admin-page-image-preview">{pageDraft.image ? <img src={pageDraft.image} alt="पृष्ठ कवर" /> : <ImagePlus size={25} />}</div><div><strong>पृष्ठ का कवर चित्र</strong><p>वैकल्पिक — फोटो या रस्म की तस्वीर</p><label className="admin-button admin-button-quiet"><Upload size={15} /> {busyImage ? 'प्रोसेस हो रहा है…' : 'चित्र चुनें'}<input type="file" accept="image/*" disabled={busyImage} onChange={(e) => { acceptPageImage(e.target.files?.[0]); e.target.value = '' }} /></label>{pageDraft.image && <button type="button" className="admin-text-danger" onClick={() => setPageDraft((v) => ({ ...v, image: '' }))}><Trash2 size={14} /> चित्र हटाएँ</button>}</div></div><label className="admin-checkbox"><input type="checkbox" checked={pageDraft.showInNav} onChange={(e) => setPageDraft((v) => ({ ...v, showInNav: e.target.checked }))} /> वेबसाइट के नेविगेशन में यह पृष्ठ दिखाएँ</label><div className="admin-form-actions"><button disabled={busyImage} type="submit" className="admin-button admin-button-primary"><Save size={16} /> {pageDraft.id ? 'पृष्ठ अपडेट करें' : 'पृष्ठ बनाएँ'}</button><button type="button" className="admin-button admin-button-quiet" onClick={() => setPageDraft(emptyPage)}>फ़ॉर्म साफ़ करें</button></div></form>
        <div className="admin-existing-pages"><div className="admin-existing-heading"><div><h2>बनाए गए पृष्ठ</h2><p>इन लिंक को मेहमान सीधे खोल सकते हैं।</p></div><span>{pages.length} पृष्ठ</span></div>{pages.length === 0 ? <div className="admin-empty"><FilePlus2 size={28} /><strong>अभी कोई अतिरिक्त पृष्ठ नहीं है</strong><p>पहला पृष्ठ बनाएँ, जैसे मेहंदी, हल्दी या संगीत।</p></div> : <div className="admin-existing-list">{pages.map((page) => <article className="admin-existing-page" key={page.id}><div className="admin-existing-thumbnail">{page.image ? <img src={page.image} alt="" /> : <span>✦</span>}</div><div className="admin-existing-copy"><strong>{page.title}</strong><code>/{page.slug}</code><small>{page.subtitle || 'उपशीर्षक नहीं है'}</small></div><div className="admin-existing-actions"><Link to={`/${page.slug}`} target="_blank" rel="noreferrer" className="admin-icon-button" aria-label={`${page.title} देखें`}><Eye size={16} /></Link><button type="button" className="admin-icon-button" onClick={() => editPage(page)} aria-label={`${page.title} संपादित करें`}>✎</button><button type="button" className="admin-icon-button danger" onClick={() => deletePage(page)} aria-label={`${page.title} हटाएँ`}><Trash2 size={16} /></button></div></article>)}</div>}</div>
      </div>}

      {activeTab === 'rsvp' && <section className="admin-panel"><div className="admin-existing-heading"><div><h2>RSVP सूची</h2><p>सिर्फ़ इसी डिवाइस के ब्राउज़र में रखे गए उत्तर यहाँ दिखते हैं।</p></div><button className="admin-button admin-button-quiet" type="button" onClick={() => { try { setRsvpList(JSON.parse(localStorage.getItem('rajasthani-wedding-rsvp') || '[]')) } catch { setRsvpList([]) } }}><Users size={15} /> रीफ़्रेश</button></div>{rsvpList.length === 0 ? <div className="admin-empty"><Users size={28} /><strong>अभी कोई उत्तर नहीं</strong><p>डेमो RSVP उत्तर इसी ब्राउज़र में सहेजे जाते हैं।</p></div> : <div className="admin-rsvp-table"><div className="admin-rsvp-row admin-rsvp-head"><span>नाम / संपर्क</span><span>स्थिति</span><span>अतिथि</span><span>संदेश</span></div>{rsvpList.slice().reverse().map((rsvp, index) => <div className="admin-rsvp-row" key={`${rsvp.submittedAt}-${index}`}><span><strong>{rsvp.name}</strong><small>{rsvp.phone || 'फ़ोन साझा नहीं किया'}</small></span><span>{rsvp.attendance === 'yes' ? 'आएँगे' : 'नहीं आ पाएँगे'}</span><span>{rsvp.guests || '—'}</span><span>{rsvp.message || '—'}</span></div>)}</div>}</section>}
      </main>
    </div>
    <footer className="admin-footer">राजसी राजस्थानी आमंत्रण <span>✦</span> डेमो एडमिन पैनल</footer>
  </div>
}
