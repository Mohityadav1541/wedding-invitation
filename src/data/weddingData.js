// Personalize this file before sharing the invitation.
// Keep missing information as an empty string; the website will show a tasteful placeholder.

export const weddingData = {
  brideName: '',
  groomName: '',
  bridePhoto: '', // Base64 data URL or path to bride portrait
  groomPhoto: '', // Base64 data URL or path to groom portrait
  ganeshPhoto: '', // Optional custom Ganesh portrait
  ganeshGardenPhoto: '', // Optional custom garden hero backdrop
  familyLine: 'दो परिवारों के स्नेह और आशीर्वाद सहित',
  blessing: 'वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ।\nनिर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥',
  weddingDate: '', // Example format: '2027-02-14T18:30:00+05:30'
  weddingDateLabel: '', // Example: 'रविवार, १४ फ़रवरी २०२७'
  weddingTimeLabel: '', // Example: 'शाम ६:३० बजे'
  venue: {
    name: '',
    address: '',
    city: '',
    googleMapsQuery: '', // Paste a real address or Google Maps URL here.
  },
  musicUrl: '/music/ambient-drone.wav', // Ambient site music.
  mantraAudioUrl: '/music/ganesh-mantra.mp3', // User-provided devotional audio, trimmed at the opening and optimized for web.
  events: [
    {
      id: 'mehendi',
      title: 'मेहंदी',
      subtitle: 'रंग, हँसी और शुभ शुरुआत',
      date: '',
      time: '',
      description: 'सखियों की खिलखिलाहट और मेहंदी की खुशबू के बीच उत्सव की पहली शाम।',
      icon: 'flower',
      attire: 'पारंपरिक रंग',
    },
    {
      id: 'haldi',
      title: 'हल्दी',
      subtitle: 'मंगल रंगों की रस्म',
      date: '',
      time: '',
      description: 'परिवार और प्रियजनों के स्नेह के साथ हल्दी की पावन रस्म।',
      icon: 'sun',
      attire: 'पीले और हल्के रंग',
    },
    {
      id: 'sangeet',
      title: 'संगीत संध्या',
      subtitle: 'सुर, ताल और खुशियाँ',
      date: '',
      time: '',
      description: 'गीत-संगीत, नृत्य और यादगार पलों से सजी एक खूबसूरत शाम।',
      icon: 'music',
      attire: 'उत्सवी परिधान',
    },
    {
      id: 'wedding',
      title: 'शुभ विवाह',
      subtitle: 'सात वचनों का पावन बंधन',
      date: '',
      time: '',
      description: 'अग्नि, मंत्रों और अपनों के आशीर्वाद के साक्षी बनकर इस मंगल अवसर की शोभा बढ़ाएँ।',
      icon: 'sparkles',
      attire: 'पारंपरिक / एथनिक',
    },
    {
      id: 'reception',
      title: 'आशीर्वाद एवं स्वागत',
      subtitle: 'स्नेह मिलन',
      date: '',
      time: '',
      description: 'नवयुगल को शुभकामनाएँ देने और परिवार के साथ आनंद बाँटने का अवसर।',
      icon: 'heart',
      attire: 'शाही उत्सवी परिधान',
    },
  ],
  story: [
    { year: 'एक सुंदर शुरुआत', title: 'पहली मुलाक़ात', description: 'यहाँ अपनी पहली मुलाक़ात की प्यारी कहानी लिखें।' },
    { year: 'एक नया अध्याय', title: 'साथ के यादगार पल', description: 'यहाँ अपनी यादगार यात्रा के कुछ पल जोड़ें।' },
    { year: 'हमेशा के लिए', title: 'शुभ विवाह', description: 'दो दिल, दो परिवार और साथ निभाने का एक सुंदर वचन।' },
  ],
}
