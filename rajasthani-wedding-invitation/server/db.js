import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { hashPin, generateId } from './crypto.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DATA_DIR = path.join(__dirname, 'data')
const DB_FILE = path.join(DATA_DIR, 'store.json')

// Ensure directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

let cache = null

function loadDb() {
  if (cache) return cache
  if (fs.existsSync(DB_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'))
      cache = data
      return cache
    } catch (err) {
      console.error('Failed to read db file, initializing fresh:', err)
    }
  }

  cache = {
    weddings: [],
    credentials: [],
    rsvps: [],
    sessions: [],
    rateLimits: {},
    auditLogs: [],
    meta: {
      version: '1.0.0',
      initializedAt: new Date().toISOString(),
    },
  }
  seedInitialData(cache)
  saveDb()
  return cache
}

export function reloadDb() {
  cache = null
  return loadDb()
}

export function getDb() {
  return loadDb()
}

export function saveDb() {
  if (!cache) return
  const tempFile = `${DB_FILE}.tmp.${Date.now()}`
  fs.writeFileSync(tempFile, JSON.stringify(cache, null, 2), 'utf8')
  fs.renameSync(tempFile, DB_FILE)
}

function seedInitialData(db) {
  const defaultEvents = [
    {
      id: 'mehendi',
      title: 'मेहंदी',
      subtitle: 'रंग, हँसी और शुभ शुरुआत',
      date: '१२ फरवरी २०२७',
      time: 'शाम ५:०० बजे',
      description: 'सखियों की खिलखिलाहट और मेहंदी की खुशबू के बीच उत्सव की पहली शाम।',
      icon: 'flower',
      attire: 'पारंपरिक हरे और पीले रंग',
    },
    {
      id: 'haldi',
      title: 'हल्दी',
      subtitle: 'मंगल रंगों की रस्म',
      date: '१३ फरवरी २०२७',
      time: 'सुबह १०:०० बजे',
      description: 'परिवार और प्रियजनों के स्नेह के साथ हल्दी की पावन रस्म।',
      icon: 'sun',
      attire: 'पीले वस्त्र',
    },
    {
      id: 'sangeet',
      title: 'संगीत संध्या',
      subtitle: 'सुर, ताल और खुशियाँ',
      date: '१३ फरवरी २०२७',
      time: 'शाम ७:०० बजे',
      description: 'गीत-संगीत, नृत्य और यादगार पलों से सजी एक खूबसूरत शाम।',
      icon: 'music',
      attire: 'उत्सवी परिधान',
    },
    {
      id: 'wedding',
      title: 'शुभ विवाह',
      subtitle: 'सात वचनों का पावन बंधन',
      date: '१४ फरवरी २०२७',
      time: 'शाम ६:३० बजे',
      description: 'अग्नि, मंत्रों और अपनों के आशीर्वाद के साक्षी बनकर इस मंगल अवसर की शोभा बढ़ाएँ।',
      icon: 'sparkles',
      attire: 'शाही पारंपरिक परिधान',
    },
    {
      id: 'reception',
      title: 'आशीर्वाद एवं स्वागत',
      subtitle: 'स्नेह मिलन',
      date: '१५ फरवरी २०२७',
      time: 'शाम ७:३० बजे',
      description: 'नवयुगल को शुभकामनाएँ देने और परिवार के साथ आनंद बाँटने का अवसर।',
      icon: 'heart',
      attire: 'शाही उत्सवी परिधान',
    },
  ]

  const seedWeddings = [
    {
      id: 'w-rahul-priya',
      slug: 'rahul-weds-priya',
      brideName: 'प्रिया शर्मा',
      groomName: 'राहुल वर्मा',
      bridePhoto: '',
      groomPhoto: '',
      ganeshPhoto: '',
      ganeshGardenPhoto: '',
      familyLine: 'शर्मा एवं वर्मा परिवार के स्नेह और आशीर्वाद सहित',
      blessing: 'वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ।\nनिर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥',
      weddingDate: '2027-02-14T18:30:00+05:30',
      weddingDateLabel: 'रविवार, १४ फ़रवरी २०२७',
      weddingTimeLabel: 'सायं ६:३० बजे',
      venue: {
        name: 'सिटी पैलेस हेरिटेज रिज़ॉर्ट',
        address: 'जय महल रोड, रामबाग के निकट',
        city: 'जयपुर, राजस्थान',
        googleMapsQuery: 'City Palace, Jaipur, Rajasthan',
      },
      events: defaultEvents,
      story: [
        { year: '२०२२', title: 'पहली मुलाक़ात', description: 'कॉलेज फेस्ट के सांस्कृतिक कार्यक्रम में हमारी पहली बात हुई थी।' },
        { year: '२०२४', title: 'दोस्ती से प्यार', description: 'अनेक यात्राओं और हँसी-मज़ाक के बाद हमने एक साथ रहने का निर्णय लिया।' },
        { year: '२०२७', title: 'शुभ परिणय', description: 'अब अपने परिवारों और प्रियजनों के सम्मुख सात फेरे लेने जा रहे हैं।' },
      ],
      customPages: [
        {
          id: 'cp-1',
          title: 'मेहंदी एवं संगीत उत्सव',
          slug: 'sangeet-utsav',
          eyebrow: 'उत्सव विवरण',
          subtitle: 'सुरों और ताल का संगम',
          content: 'सभी मेहमानों से अनुरोध है कि वे पारंपरिक राजस्थानी परिधान में पधारकर इस उत्सव का हिस्सा बनें। नृत्य प्रतियोगिताओं और विशेष प्रस्तुतियों का आनंद लें।',
          eventDate: '१३ फरवरी २०२७',
          eventTime: 'सायं ७:०० बजे',
          mapUrl: 'https://maps.google.com/?q=City+Palace+Jaipur',
          image: '',
          showInNav: true,
        },
      ],
      published: true,
      archived: false,
      createdAt: '2026-01-15T10:00:00.000Z',
      updatedAt: '2026-01-15T10:00:00.000Z',
      // Seed PIN: 12345678
      initialPin: '12345678',
    },
    {
      id: 'w-amit-neha',
      slug: 'amit-weds-neha',
      brideName: 'नेहा राठौड़',
      groomName: 'अमित शेखावत',
      bridePhoto: '',
      groomPhoto: '',
      ganeshPhoto: '',
      ganeshGardenPhoto: '',
      familyLine: 'राठौड़ एवं शेखावत परिवार',
      blessing: 'ॐ श्री गणेशाय नमः। मंगलम् भगवान विष्णुः मंगलम् गरुड़ध्वजः॥',
      weddingDate: '2027-03-08T19:00:00+05:30',
      weddingDateLabel: 'सोमवार, ८ मार्च २०२७',
      weddingTimeLabel: 'सायं ७:०० बजे',
      venue: {
        name: 'उम्मेद भवन पैलेस गार्डन',
        address: 'सर्किट हाउस रोड',
        city: 'जोधपुर, राजस्थान',
        googleMapsQuery: 'Umaid Bhawan Palace, Jodhpur',
      },
      events: defaultEvents,
      story: [
        { year: '२०२३', title: 'पारिवारिक परिचय', description: 'परंपरा और संस्कारों के साथ दोनों परिवारों का मधुर मिलन हुआ।' },
        { year: '२०२७', title: 'सात फेरे', description: 'शाही अंदाज में जोधपुर की पावन धरा पर परिणय सूत्र।' },
      ],
      customPages: [],
      published: true,
      archived: false,
      createdAt: '2026-02-01T10:00:00.000Z',
      updatedAt: '2026-02-01T10:00:00.000Z',
      // Seed PIN: 87654321
      initialPin: '87654321',
    },
    {
      id: 'w-rohan-kavya',
      slug: 'rohan-weds-kavya',
      brideName: 'काव्या जोशी',
      groomName: 'रोहन मेहता',
      bridePhoto: '',
      groomPhoto: '',
      ganeshPhoto: '',
      ganeshGardenPhoto: '',
      familyLine: 'जोशी एवं मेहता परिवार का स्नेह आमंत्रण',
      blessing: 'सर्वमंगल मांगल्ये शिवे सर्वार्थ साधिके। शरण्ये त्र्यम्बके गौरी नारायणि नमोऽस्तु ते॥',
      weddingDate: '2027-04-18T18:00:00+05:30',
      weddingDateLabel: 'रविवार, १८ अप्रैल २०२७',
      weddingTimeLabel: 'सायं ६:०० बजे',
      venue: {
        name: 'जग मंदिर पैलेस आइलैंड',
        address: 'पिछोला झील',
        city: 'उदयपुर, राजस्थान',
        googleMapsQuery: 'Jagmandir, Udaipur',
      },
      events: defaultEvents,
      story: [
        { year: '२०२१', title: 'सपनों की शुरुआत', description: 'उदयपुर की झीलों के किनारे एक सुखद मुलाकात।' },
        { year: '२०२७', title: 'हमसफ़र', description: 'झील के बीच स्थित ऐतिहासिक जग मंदिर में मंगल विवाह।' },
      ],
      customPages: [],
      published: false, // Draft for testing draft/publish logic
      archived: false,
      createdAt: '2026-02-10T10:00:00.000Z',
      updatedAt: '2026-02-10T10:00:00.000Z',
      // Seed PIN: 99887766
      initialPin: '99887766',
    },
  ]

  for (const item of seedWeddings) {
    const { initialPin, ...wedding } = item
    db.weddings.push(wedding)
    const { salt, hash, algorithm } = hashPin(initialPin)
    db.credentials.push({
      id: generateId(),
      weddingId: wedding.id,
      pinHash: hash,
      salt,
      algorithm,
      pin: initialPin,
      active: true,
      createdAt: wedding.createdAt,
      updatedAt: wedding.updatedAt,
    })
  }

  // Seed sample RSVPs for Rahul & Priya
  db.rsvps.push(
    {
      id: generateId(),
      weddingId: 'w-rahul-priya',
      name: 'संजय माथुर',
      phone: '+91 98290 12345',
      attendance: 'yes',
      guests: 4,
      selectedEvents: ['mehendi', 'sangeet', 'wedding', 'reception'],
      message: 'वर-वधू को हमारी हार्दिक शुभकामनाएँ और अनंत आशीर्वाद!',
      submittedAt: '2026-02-15T14:30:00.000Z',
      updatedAt: '2026-02-15T14:30:00.000Z',
    },
    {
      id: generateId(),
      weddingId: 'w-rahul-priya',
      name: 'राजेश सिंघल',
      phone: '+91 94140 67890',
      attendance: 'yes',
      guests: 2,
      selectedEvents: ['wedding', 'reception'],
      message: 'शाही विवाह का निमंत्रण पाकर अत्यंत प्रसन्नता हुई। सपरिवार उपस्थित रहेंगे।',
      submittedAt: '2026-02-16T09:15:00.000Z',
      updatedAt: '2026-02-16T09:15:00.000Z',
    },
    {
      id: generateId(),
      weddingId: 'w-rahul-priya',
      name: 'अनिल कपूर',
      phone: '+91 98280 54321',
      attendance: 'no',
      guests: 0,
      selectedEvents: [],
      message: 'विदेश यात्रा के कारण प्रत्यक्ष उपस्थित नहीं हो पाएँगे, हमारा हार्दिक शुभाशीष नवदंपति के साथ है।',
      submittedAt: '2026-02-17T11:45:00.000Z',
      updatedAt: '2026-02-17T11:45:00.000Z',
    }
  )

  // Seed sample RSVP for Amit & Neha
  db.rsvps.push({
    id: generateId(),
    weddingId: 'w-amit-neha',
    name: 'करण राठौड़',
    phone: '+91 99280 11223',
    attendance: 'yes',
    guests: 3,
    selectedEvents: ['wedding', 'reception'],
    message: 'बधाई हो अमित और नेहा!',
    submittedAt: '2026-02-18T16:20:00.000Z',
    updatedAt: '2026-02-18T16:20:00.000Z',
  })
}
