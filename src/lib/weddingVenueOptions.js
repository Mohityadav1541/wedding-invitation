/**
 * Heritage Royal Palaces and Wedding Venues in Rajasthan & India
 * with verified Google Maps links, cities, and addresses.
 * Also provides intelligent parsing to extract Palace Name & City from any Google Maps link.
 */

export const FAMOUS_ROYAL_PALACES = [
  // Udaipur
  {
    id: 'city-palace-udaipur',
    region: 'उदयपुर (Lake City Udaipur)',
    name: 'सिटी पैलेस (The City Palace)',
    city: 'उदयपुर, राजस्थान',
    address: 'ओल्ड सिटी, उदयपुर, राजस्थान ३१३००१',
    googleMapsQuery: 'https://maps.google.com/?q=The+City+Palace,+Old+City,+Udaipur,+Rajasthan+313001',
  },
  {
    id: 'jagmandir-udaipur',
    region: 'उदयपुर (Lake City Udaipur)',
    name: 'जगमंदिर आइलैंड पैलेस (Jagmandir Island Palace)',
    city: 'उदयपुर, राजस्थान',
    address: 'पिछोला झील, उदयपुर, राजस्थान ३१३००१',
    googleMapsQuery: 'https://maps.google.com/?q=Jagmandir+Island+Palace,+Lake+Pichola,+Udaipur,+Rajasthan',
  },
  {
    id: 'taj-lake-palace-udaipur',
    region: 'उदयपुर (Lake City Udaipur)',
    name: 'ताज लेक पैलेस (Taj Lake Palace)',
    city: 'उदयपुर, राजस्थान',
    address: 'पिछोला झील के मध्य, उदयपुर, राजस्थान ३१३००१',
    googleMapsQuery: 'https://maps.google.com/?q=Taj+Lake+Palace,+Pichola,+Udaipur,+Rajasthan',
  },
  {
    id: 'leela-palace-udaipur',
    region: 'उदयपुर (Lake City Udaipur)',
    name: 'द लीला पैलेस (The Leela Palace)',
    city: 'उदयपुर, राजस्थान',
    address: 'झील पिछोला के किनारे, उदयपुर, राजस्थान ३१३००१',
    googleMapsQuery: 'https://maps.google.com/?q=The+Leela+Palace+Udaipur,+Rajasthan',
  },
  {
    id: 'shiv-niwas-palace-udaipur',
    region: 'उदयपुर (Lake City Udaipur)',
    name: 'शिव निवास पैलेस (Shiv Niwas Palace)',
    city: 'उदयपुर, राजस्थान',
    address: 'द सिटी पैलेस कॉम्प्लेक्स, उदयपुर, राजस्थान ३१३००१',
    googleMapsQuery: 'https://maps.google.com/?q=Shiv+Niwas+Palace,+City+Palace+Complex,+Udaipur,+Rajasthan',
  },

  // Jaipur
  {
    id: 'rambagh-palace-jaipur',
    region: 'जयपुर (Pink City Jaipur)',
    name: 'रामबाग पैलेस (Rambagh Palace)',
    city: 'जयपुर, राजस्थान',
    address: 'भवानी सिंह रोड, जयपुर, राजस्थान ३०२००५',
    googleMapsQuery: 'https://maps.google.com/?q=Rambagh+Palace,+Bhawani+Singh+Rd,+Jaipur,+Rajasthan+302005',
  },
  {
    id: 'jai-mahal-palace-jaipur',
    region: 'जयपुर (Pink City Jaipur)',
    name: 'जय महल पैलेस (Jai Mahal Palace)',
    city: 'जयपुर, राजस्थान',
    address: 'जैकब रोड, सिविल लाइंस, जयपुर, राजस्थान ३०२००६',
    googleMapsQuery: 'https://maps.google.com/?q=Jai+Mahal+Palace,+Jacob+Rd,+Civil+Lines,+Jaipur,+Rajasthan',
  },
  {
    id: 'samode-palace-jaipur',
    region: 'जयपुर (Pink City Jaipur)',
    name: 'सामोद पैलेस (Samode Palace)',
    city: 'सामोद, जयपुर, राजस्थान',
    address: 'सामोद, तहसील चौमूं, जयपुर, राजस्थान ३०३८०६',
    googleMapsQuery: 'https://maps.google.com/?q=Samode+Palace,+Samode,+Rajasthan+303806',
  },
  {
    id: 'chomu-palace-jaipur',
    region: 'जयपुर (Pink City Jaipur)',
    name: 'चौमूं पैलेस (Chomu Palace Hotel)',
    city: 'चौमूं, जयपुर, राजस्थान',
    address: 'सर्किल, चौमूं, जयपुर, राजस्थान ३०३७०२',
    googleMapsQuery: 'https://maps.google.com/?q=Chomu+Palace+Hotel,+Chomu,+Rajasthan+303702',
  },
  {
    id: 'mundota-fort-palace-jaipur',
    region: 'जयपुर (Pink City Jaipur)',
    name: 'मुंडोता फोर्ट व पैलेस (Mundota Fort and Palace)',
    city: 'मुंडोता, जयपुर, राजस्थान',
    address: 'मुंडोता, कालवाड़ रोड, जयपुर, राजस्थान ३०३७०६',
    googleMapsQuery: 'https://maps.google.com/?q=Mundota+Fort+and+Palace,+Jaipur,+Rajasthan',
  },
  {
    id: 'alila-fort-bishangarh',
    region: 'जयपुर (Pink City Jaipur)',
    name: 'अलीला फोर्ट बिशनगढ़ (Alila Fort Bishangarh)',
    city: 'बिशनगढ़, जयपुर, राजस्थान',
    address: 'बिशनगढ़, मनोहरपुर, जयपुर, राजस्थान ३०३१०४',
    googleMapsQuery: 'https://maps.google.com/?q=Alila+Fort+Bishangarh,+Rajasthan',
  },
  {
    id: 'fairmont-jaipur',
    region: 'जयपुर (Pink City Jaipur)',
    name: 'फेयरमोंट पैलेस (Fairmont Jaipur)',
    city: 'कूकस, जयपुर, राजस्थान',
    address: '२ रीको कूकस, आमेर, जयपुर, राजस्थान ३०२८०१',
    googleMapsQuery: 'https://maps.google.com/?q=Fairmont+Jaipur,+Kukas,+Rajasthan',
  },

  // Jodhpur
  {
    id: 'umaid-bhawan-palace-jodhpur',
    region: 'जोधपुर (Sun City Jodhpur)',
    name: 'उम्मेद भवन पैलेस (Umaid Bhawan Palace)',
    city: 'जोधपुर, राजस्थान',
    address: 'सर्किट हाउस रोड, कैंट एरिया, जोधपुर, राजस्थान ३४२००६',
    googleMapsQuery: 'https://maps.google.com/?q=Umaid+Bhawan+Palace,+Circuit+House+Rd,+Jodhpur,+Rajasthan+342006',
  },
  {
    id: 'ajit-bhawan-jodhpur',
    region: 'जोधपुर (Sun City Jodhpur)',
    name: 'अजीत भवन पैलेस (Ajit Bhawan Palace)',
    city: 'जोधपुर, राजस्थान',
    address: 'सर्किट हाउस के पास, जोधपुर, राजस्थान ३४२००६',
    googleMapsQuery: 'https://maps.google.com/?q=Ajit+Bhawan,+Circuit+House+Rd,+Jodhpur,+Rajasthan',
  },
  {
    id: 'mehrangarh-view-jodhpur',
    region: 'जोधपुर (Sun City Jodhpur)',
    name: 'रास मेहरानगढ़ पैलेस (RAAS Jodhpur)',
    city: 'जोधपुर, राजस्थान',
    address: 'ट्यूनवर जी का झालरा, मकरान मोहल्ला, जोधपुर, राजस्थान ३४२००१',
    googleMapsQuery: 'https://maps.google.com/?q=RAAS+Jodhpur,+Makrana+Mohalla,+Jodhpur,+Rajasthan',
  },

  // Jaisalmer
  {
    id: 'suryagarh-jaisalmer',
    region: 'जैसलमेर (Golden City Jaisalmer)',
    name: 'सूर्यगढ़ पैलेस (Suryagarh Jaisalmer)',
    city: 'जैसलमेर, राजस्थान',
    address: 'सम रोड, काहला फांटा, जैसलमेर, राजस्थान ३४५००१',
    googleMapsQuery: 'https://maps.google.com/?q=Suryagarh+Jaisalmer,+Sam+Road,+Jaisalmer,+Rajasthan',
  },
  {
    id: 'gorbandh-palace-jaisalmer',
    region: 'जैसलमेर (Golden City Jaisalmer)',
    name: 'गोरबंध पैलेस (Gorbandh Palace)',
    city: 'जैसलमेर, राजस्थान',
    address: 'सम रोड, जैसलमेर, राजस्थान ३४५००१',
    googleMapsQuery: 'https://maps.google.com/?q=Gorbandh+Palace,+Sam+Road,+Jaisalmer,+Rajasthan',
  },

  // Bikaner
  {
    id: 'laxmi-niwas-palace-bikaner',
    region: 'बीकानेर (Royal Bikaner)',
    name: 'लक्ष्मी निवास पैलेस (Laxmi Niwas Palace)',
    city: 'बीकानेर, राजस्थान',
    address: 'लालगढ़ पैलेस कैंपस, बीकानेर, राजस्थान ३३४००१',
    googleMapsQuery: 'https://maps.google.com/?q=The+Laxmi+Niwas+Palace,+Lalgarh+Palace+Campus,+Bikaner,+Rajasthan',
  },
  {
    id: 'gajner-palace-bikaner',
    region: 'बीकानेर (Royal Bikaner)',
    name: 'गजनेर पैलेस (Gajner Palace Heritage)',
    city: 'गजनेर, बीकानेर, राजस्थान',
    address: 'गजनेर लेक, कोलायत, बीकानेर, राजस्थान ३३४३०१',
    googleMapsQuery: 'https://maps.google.com/?q=Gajner+Palace,+Kolayat,+Bikaner,+Rajasthan',
  },

  // Other Heritage Palaces
  {
    id: 'neemrana-fort-palace',
    region: 'अलवर व दिल्ली-एनसीआर (Heritage Forts)',
    name: 'नीमराना फोर्ट पैलेस (Neemrana Fort-Palace)',
    city: 'नीमराना, अलवर, राजस्थान',
    address: '१२२वां किलोमीटर दिल्ली-जयपुर हाइवे, नीमराना, राजस्थान ३०१७०५',
    googleMapsQuery: 'https://maps.google.com/?q=Neemrana+Fort-Palace,+Neemrana,+Rajasthan',
  },
  {
    id: 'pushkar-palace',
    region: 'पुष्कर / अजमेर (Spiritual Heritage)',
    name: 'पुष्कर पैलेस (The Pushkar Palace)',
    city: 'पुष्कर, राजस्थान',
    address: 'पुष्कर सरोवर के तट पर, पुष्कर, राजस्थान ३०५०२२',
    googleMapsQuery: 'https://maps.google.com/?q=The+Pushkar+Palace,+Pushkar+Lake,+Pushkar,+Rajasthan',
  },
]

export const VENUE_REGIONS = Array.from(new Set(FAMOUS_ROYAL_PALACES.map((p) => p.region)))

/**
 * Generates a bulletproof Google Maps direct destination URL
 * Supports:
 * - Direct HTTP/HTTPS maps URLs (e.g., https://maps.app.goo.gl/..., https://www.google.com/maps/...)
 * - Search query fallback using Google Maps Universal Search API
 * - Automatic venue name + address + city synthesis
 */
export function getGoogleMapsDestinationUrl(venue) {
  if (!venue) return 'https://www.google.com/maps'

  const rawQuery = (venue.googleMapsQuery || '').trim()
  if (rawQuery) {
    if (/^https?:\/\//i.test(rawQuery)) {
      return rawQuery
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(rawQuery)}`
  }

  const combined = [venue.name, venue.address, venue.city].filter(Boolean).join(', ')
  if (combined) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(combined)}`
  }

  return 'https://www.google.com/maps'
}

/**
 * Intelligent extraction of Palace Name and City from any Google Maps link or query string.
 * Supports:
 * - google.com/maps/place/Name,+City/@lat,lng...
 * - google.com/maps/search/Name,+City...
 * - maps.google.com/?q=Name,+City...
 * - maps.app.goo.gl / goo.gl short links
 */
export function extractPalaceAndCityFromMapUrl(input) {
  if (!input || typeof input !== 'string') {
    return { name: '', city: '', address: '', rawUrl: '', hasDetails: false, isShortUrl: false }
  }

  const rawUrl = input.trim()
  const isShortUrl = /maps\.app\.goo\.gl|goo\.gl\/maps/i.test(rawUrl)

  // First check if it matches any of our predefined famous palaces
  const matchedPreset = FAMOUS_ROYAL_PALACES.find(
    (p) =>
      rawUrl.toLowerCase().includes(p.id) ||
      (rawUrl.toLowerCase().includes(p.name.toLowerCase().split(' ')[0]) &&
        rawUrl.toLowerCase().includes(p.city.toLowerCase().split(' ')[0]))
  )
  if (matchedPreset) {
    return {
      name: matchedPreset.name,
      city: matchedPreset.city,
      address: matchedPreset.address,
      rawUrl: matchedPreset.googleMapsQuery,
      hasDetails: true,
      isShortUrl: false,
    }
  }

  // For short URLs, we preserve rawUrl without wiping user fields
  if (isShortUrl) {
    return {
      name: '',
      city: '',
      address: '',
      rawUrl,
      hasDetails: false,
      isShortUrl: true,
    }
  }

  let extractedQuery = ''

  try {
    // 1. Check for URL path /place/Venue+Name,+City/
    const placeMatch = rawUrl.match(/\/maps\/place\/([^/@?#]+)/i)
    if (placeMatch && placeMatch[1]) {
      extractedQuery = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '))
    }

    // 2. Check for URL path /maps/search/Venue+Name...
    if (!extractedQuery) {
      const searchMatch = rawUrl.match(/\/maps\/search\/([^/@?#]+)/i)
      if (searchMatch && searchMatch[1]) {
        extractedQuery = decodeURIComponent(searchMatch[1].replace(/\+/g, ' '))
      }
    }

    // 3. Check for query parameter q= or query=
    if (!extractedQuery && rawUrl.includes('?')) {
      const urlObj = new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`)
      const q = urlObj.searchParams.get('q') || urlObj.searchParams.get('query')
      if (q) {
        extractedQuery = decodeURIComponent(q.replace(/\+/g, ' '))
      }
    }
  } catch {
    // If not a standard URL, treat raw text as query
    if (!rawUrl.startsWith('http')) {
      extractedQuery = rawUrl
    }
  }

  // If input was a simple text query or name (e.g. "City Palace, Udaipur")
  if (!extractedQuery && !rawUrl.startsWith('http')) {
    extractedQuery = rawUrl
  }

  if (!extractedQuery) {
    return { name: '', city: '', address: '', rawUrl, hasDetails: false, isShortUrl }
  }

  // Split query parts by comma or dash
  const parts = extractedQuery
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  let name = ''
  let city = ''
  let address = extractedQuery

  if (parts.length >= 2) {
    name = parts[0]
    // Filter out pin codes and generic words from city
    const candidateCity = parts[1]
    const statePart = parts[2] ? `, ${parts[2]}` : ''
    city = `${candidateCity}${statePart}`.replace(/\b\d{6}\b/g, '').trim()
  } else if (parts.length === 1) {
    name = parts[0]
  }

  // Clean up unwanted parameters or coords (e.g., "24.5764, 73.6835")
  if (/^[-+]?\d+(\.\d+)?\s*,\s*[-+]?\d+(\.\d+)?$/.test(extractedQuery.trim())) {
    name = 'विवाह स्थल (Geo Coordinates)'
    city = ''
  }

  return {
    name: name || '',
    city: city || '',
    address: address !== rawUrl ? address : '',
    rawUrl,
    hasDetails: Boolean(name || city),
    isShortUrl,
  }
}
