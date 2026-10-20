/**
 * Comprehensive list of traditional Hindu & Rajasthani Wedding Ceremony Presets
 * and helper functions to convert native calendar and clock selections
 * into elegant Hindi wedding invitation labels.
 */

export const STANDARD_WEDDING_EVENTS = [
  {
    id: 'ganesh-sthapana',
    category: 'मांगलिक शुभारंभ (Pre-Wedding Rituals)',
    title: 'गणेश स्थापना व विनायक पूजन',
    subtitle: 'मांगलिक कार्यों का शुभारंभ',
    description: 'प्रथम पूज्य श्री गणेश जी की स्थापना एवं कुल देवी-देवताओं का पावन आह्वान।',
    attire: 'पारंपरिक पीले व लाल परिधान',
    icon: 'sparkles',
    defaultTime: '09:30',
  },
  {
    id: 'bhaat-nyotana',
    category: 'मांगलिक शुभारंभ (Pre-Wedding Rituals)',
    title: 'भात न्योतना',
    subtitle: 'ननिहाल आमंत्रण रस्म',
    description: 'वर/वधू पक्ष द्वारा ननिहाल में भात का सप्रेम व आदरपूर्वक निमंत्रण।',
    attire: 'पारंपरिक उत्सवी परिधान',
    icon: 'heart',
    defaultTime: '11:00',
  },
  {
    id: 'mayra-chaak-bhaat',
    category: 'मांगलिक शुभारंभ (Pre-Wedding Rituals)',
    title: 'मायरा व चाक भात',
    subtitle: 'ननिहाल का स्नेह एवं उपहार',
    description: 'मामा पक्ष द्वारा मंगल गीतों व ढोल-नगाड़ों के साथ मायरा भरने की पारंपरिक रस्म।',
    attire: 'शाही चुनरी व बंधेज परिधान',
    icon: 'heart',
    defaultTime: '12:30',
  },
  {
    id: 'lagan-patrika',
    category: 'मांगलिक शुभारंभ (Pre-Wedding Rituals)',
    title: 'लगन पत्रिका वाचन',
    subtitle: 'शुभ लग्न मुहूर्त पूजा',
    description: 'कुल पुरोहित द्वारा शुभ लग्न पत्रिका का मंगल वाचन एवं श्रीफल अर्पण।',
    attire: 'पारंपरिक परिधान',
    icon: 'sparkles',
    defaultTime: '10:00',
  },
  {
    id: 'chaak-pujan',
    category: 'मांगलिक शुभारंभ (Pre-Wedding Rituals)',
    title: 'चाक पूजन',
    subtitle: 'मंगल कलश व चाक आराधना',
    description: 'कुल की सुहागिन महिलाओं द्वारा मंगल कलश एवं कुम्हार के चाक की पूजा।',
    attire: 'पारंपरिक लाल/पीला परिधान',
    icon: 'sparkles',
    defaultTime: '11:30',
  },
  {
    id: 'mandap-ropan',
    category: 'मांगलिक शुभारंभ (Pre-Wedding Rituals)',
    title: 'मण्डप रोपण व मातृका पूजन',
    subtitle: 'पवित्र वेदी प्रतिष्ठा',
    description: 'मांगलिक विवाह मण्डप की प्रतिष्ठा एवं मातृका देवियों का पावन पूजन।',
    attire: 'धार्मिक पारंपरिक परिधान',
    icon: 'sparkles',
    defaultTime: '08:30',
  },
  {
    id: 'haldi',
    category: 'उत्सव व रस्में (Celebrations)',
    title: 'मांगलिक हल्दी रस्म',
    subtitle: 'पीठी व उपटन की महक',
    description: 'परिवार एवं सगे-संबंधियों द्वारा नवयुगल को शुभ हल्दी व तेल-बान लगाने का उल्लास।',
    attire: 'पीला परिधान (Yellow Attire)',
    icon: 'sun',
    defaultTime: '10:30',
  },
  {
    id: 'mehendi',
    category: 'उत्सव व रस्में (Celebrations)',
    title: 'मेहंदी उत्सव',
    subtitle: 'सखियों संग सजेगी हिना',
    description: 'ढोलक की थाप, लोकगीतों की गूंज और हथेलियों पर रचने वाली प्रेम की गाढ़ी मेहंदी।',
    attire: 'हरा / फ्लोरल परिधान (Green/Floral)',
    icon: 'flower',
    defaultTime: '16:00',
  },
  {
    id: 'sangeet',
    category: 'उत्सव व रस्में (Celebrations)',
    title: 'शाही संगीत एवं नृत्य संध्या',
    subtitle: 'सुरों और खुशियों का संगम',
    description: 'परिवार व मित्रों द्वारा मनमोहक सांस्कृतिक प्रस्तुतियाँ, गीत-संगीत और नृत्य संध्या।',
    attire: 'ग्लैमरस एथनिक / इंडो-वेस्टर्न',
    icon: 'music',
    defaultTime: '19:00',
  },
  {
    id: 'mahila-sangeet',
    category: 'उत्सव व रस्में (Celebrations)',
    title: 'महिला संगीत एवं डीजे नाइट',
    subtitle: 'राजस्थानी घूमर व डीजे की धुन',
    description: 'पारंपरिक राजस्थानी घूमर, लोकनृत्य एवं डीजे की धुनों पर थिरकते आत्मीय जन।',
    attire: 'उत्सवी राजपूती वेशभूषा',
    icon: 'music',
    defaultTime: '19:30',
  },
  {
    id: 'nikasi',
    category: 'शाही विवाह मुख्य रस्में (Wedding Main Rituals)',
    title: 'निकासी व सेहराबंदी',
    subtitle: 'दूल्हे का शाही श्रृंगार',
    description: 'दूल्हे की शाही पगड़ी, सेहराबंदी, कलावा एवं घोड़ी पर सवार होकर निकासी।',
    attire: 'शाही शेरवानी व साफा',
    icon: 'sparkles',
    defaultTime: '17:30',
  },
  {
    id: 'baraat',
    category: 'शाही विवाह मुख्य रस्में (Wedding Main Rituals)',
    title: 'राजसी बारात प्रस्थान व सामेला',
    subtitle: 'आतिशबाजी संग भव्य अगवानी',
    description: 'ढोल-नगाड़ों, बैंड-बाजों एवं पुष्प वर्षा के साथ बारात का आगमन व सामेला स्वागत।',
    attire: 'शाही पारंपरिक परिधान',
    icon: 'sparkles',
    defaultTime: '18:30',
  },
  {
    id: 'jaimala',
    category: 'शाही विवाह मुख्य रस्में (Wedding Main Rituals)',
    title: 'तोरण व जयमाला (वरमाला)',
    subtitle: 'दो हृदयों का पावन मिलन',
    description: 'तोरण मारना एवं भव्य मंच पर वर-वधू द्वारा एक-दूसरे को वरमाला पहनाने का स्वर्णिम पल।',
    attire: 'शाही दूल्हा-दुल्हन वेशभूषा',
    icon: 'heart',
    defaultTime: '20:00',
  },
  {
    id: 'wedding',
    category: 'शाही विवाह मुख्य रस्में (Wedding Main Rituals)',
    title: 'शुभ विवाह — पावन सात फेरे',
    subtitle: 'अग्नि-साक्षी सात वचन',
    description: 'पवित्र अग्नि के समक्ष वैदिक मंत्रोच्चार, पाणिग्रहण और आजीवन साथ निभाने के सात फेरे।',
    attire: 'शाही पारंपरिक विवाह परिधान',
    icon: 'sparkles',
    defaultTime: '21:30',
  },
  {
    id: 'kanyadaan',
    category: 'शाही विवाह मुख्य रस्में (Wedding Main Rituals)',
    title: 'कन्यादान व सिंदूरदान',
    subtitle: 'अमर सुहाग का पावन संकल्प',
    description: 'माता-पिता द्वारा कन्यादान एवं मांगलिक सिंदूरदान व मंगलसूत्र की पावन रस्म।',
    attire: 'पारंपरिक विवाह परिधान',
    icon: 'heart',
    defaultTime: '22:30',
  },
  {
    id: 'bidaai',
    category: 'शाही विवाह मुख्य रस्में (Wedding Main Rituals)',
    title: 'विदाई समारोह',
    subtitle: 'बाबुल का प्यार व आशीर्वाद',
    description: 'सजल नयनों और अनंत शुभाशीष के साथ नववधू की ससुराल के लिए भावुक विदाई।',
    attire: 'पारंपरिक परिधान',
    icon: 'heart',
    defaultTime: '05:30',
  },
  {
    id: 'griha-pravesh',
    category: 'विवाहोपरांत रस्में (Post-Wedding Rituals)',
    title: 'गृह प्रवेश व वधू स्वागत',
    subtitle: 'गृहलक्ष्मी का मंगल आगमन',
    description: 'ससुराल में कुमकुम थाल, कलश ढुलकाने एवं आरती के साथ नववधू का भव्य स्वागत।',
    attire: 'सुहागिन परिधान',
    icon: 'sparkles',
    defaultTime: '11:00',
  },
  {
    id: 'reception',
    category: 'विवाहोपरांत रस्में (Post-Wedding Rituals)',
    title: 'आशीर्वाद समारोह व प्रीतिभोज (रिसेप्शन)',
    subtitle: 'स्नेह मिलन एवं शाही दावत',
    description: 'नवदंपति को शुभाशीष प्रदान करने एवं आत्मीय स्वजनों संग आनंदमयी प्रीतिभोज।',
    attire: 'शाही उत्सवी परिधान / फॉर्मल',
    icon: 'heart',
    defaultTime: '19:30',
  },
  {
    id: 'custom',
    category: 'अन्य कार्यक्रम (Custom)',
    title: 'विशेष मांगलिक कार्यक्रम',
    subtitle: 'पारिवारिक उत्सव',
    description: 'परिवार एवं मित्रों के संग विशेष उत्सव एवं रस्म।',
    attire: 'उत्सवी परिधान',
    icon: 'sparkles',
    defaultTime: '18:00',
  },
]

export const EVENT_CATEGORIES = Array.from(new Set(STANDARD_WEDDING_EVENTS.map((e) => e.category)))

const HINDI_MONTHS = [
  'जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून',
  'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'
]

const HINDI_DAYS = [
  'रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'
]

const HINDI_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९']

export function toHindiDigits(num) {
  if (num === undefined || num === null || num === '') return ''
  return String(num).replace(/\d/g, (d) => HINDI_DIGITS[Number(d)])
}

/**
 * Converts a date string (YYYY-MM-DD or ISO) into formatted Hindi label.
 * Example: '2027-02-14' -> 'रविवार, १४ फ़रवरी २०२७'
 */
export function formatCalendarDateToHindi(dateStr, includeDay = true) {
  if (!dateStr) return ''
  const clean = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr
  const parts = clean.split('-')
  if (parts.length !== 3) return dateStr

  const year = parseInt(parts[0], 10)
  const monthIdx = parseInt(parts[1], 10) - 1
  const day = parseInt(parts[2], 10)

  if (isNaN(year) || isNaN(monthIdx) || isNaN(day) || monthIdx < 0 || monthIdx > 11) {
    return dateStr
  }

  const dateObj = new Date(year, monthIdx, day)
  const dayName = HINDI_DAYS[dateObj.getDay()]
  const monthName = HINDI_MONTHS[monthIdx]
  const dayHindi = toHindiDigits(day)
  const yearHindi = toHindiDigits(year)

  if (includeDay) {
    return `${dayName}, ${dayHindi} ${monthName} ${yearHindi}`
  }
  return `${dayHindi} ${monthName} ${yearHindi}`
}

/**
 * Converts HH:MM 24-hr time to traditional Hindi time phrase.
 * Example: '18:30' -> 'सायं ६:३० बजे'
 * Example: '10:00' -> 'प्रातः १०:०० बजे'
 */
export function formatTimeToHindi(timeStr) {
  if (!timeStr) return ''
  const parts = timeStr.trim().split(':')
  if (parts.length < 2) return timeStr

  const hour = parseInt(parts[0], 10)
  const minute = parseInt(parts[1], 10)
  if (isNaN(hour) || isNaN(minute)) return timeStr

  let period = 'सायं'
  if (hour < 4) period = 'रात्रि'
  else if (hour < 12) period = 'प्रातः'
  else if (hour === 12) period = 'दोपहर'
  else if (hour < 16) period = 'दोपहर'
  else if (hour < 20) period = 'सायं'
  else period = 'रात्रि'

  const displayHour = hour % 12 === 0 ? 12 : hour % 12
  const minutePad = minute < 10 ? `0${minute}` : `${minute}`

  const hourHindi = toHindiDigits(displayHour)
  const minHindi = toHindiDigits(minutePad)

  return `${period} ${hourHindi}:${minHindi} बजे`
}

/**
 * Extracts YYYY-MM-DD from any date string or ISO format for HTML <input type="date">
 */
export function extractDateInputVal(dateStr) {
  if (!dateStr) return ''
  // If already YYYY-MM-DD
  const m = String(dateStr).match(/\b(\d{4}-\d{2}-\d{2})\b/)
  if (m) return m[1]
  return ''
}

/**
 * Extracts HH:MM from any time string or ISO format for HTML <input type="time">
 */
export function extractTimeInputVal(timeStr) {
  if (!timeStr) return ''
  const m = String(timeStr).match(/\b(\d{1,2}:\d{2})\b/)
  if (m) {
    const [h, min] = m[1].split(':')
    return `${h.padStart(2, '0')}:${min}`
  }
  return ''
}
