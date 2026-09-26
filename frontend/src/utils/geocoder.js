/**
 * Utility for geocoding address strings using OpenStreetMap Nominatim API
 */
export async function geocodeAddress(query) {
  if (!query || !query.trim()) return null;

  const cleanQuery = query.trim();

  // Common quick match for Mumbai landmarks if offline or fast path
  const lower = cleanQuery.toLowerCase();
  if (lower.includes('byculla')) {
    return { latitude: 18.9790, longitude: 72.8333, displayName: 'Byculla, Mumbai, Maharashtra, India' };
  }
  if (lower.includes('bkc') || lower.includes('bandra kurla')) {
    return { latitude: 19.0657, longitude: 72.8686, displayName: 'Bandra Kurla Complex, Mumbai, Maharashtra, India' };
  }
  if (lower.includes('wankhede')) {
    return { latitude: 18.9389, longitude: 72.8258, displayName: 'Wankhede Stadium, Churchgate, Mumbai, India' };
  }
  if (lower.includes('bandra') && (lower.includes('west') || lower.includes('station'))) {
    return { latitude: 19.0544, longitude: 72.8402, displayName: 'Bandra West Station, Mumbai, India' };
  }
  if (lower.includes('cst') || lower.includes('csmt') || lower.includes('chhatrapati shivaji')) {
    return { latitude: 18.9401, longitude: 72.8350, displayName: 'Chhatrapati Shivaji Maharaj Terminus, Mumbai, India' };
  }
  if (lower.includes('juhu')) {
    return { latitude: 19.0988, longitude: 72.8264, displayName: 'Juhu Beach, Mumbai, India' };
  }
  if (lower.includes('colaba')) {
    return { latitude: 18.9067, longitude: 72.8147, displayName: 'Colaba, Mumbai, India' };
  }
  if (lower.includes('thane')) {
    return { latitude: 19.2183, longitude: 72.9781, displayName: 'Thane, Maharashtra, India' };
  }
  if (lower.includes('dadar')) {
    return { latitude: 19.0178, longitude: 72.8478, displayName: 'Dadar, Mumbai, India' };
  }
  if (lower.includes('andheri')) {
    return { latitude: 19.1197, longitude: 72.8464, displayName: 'Andheri, Mumbai, India' };
  }
  if (lower.includes('chembur')) {
    return { latitude: 19.0623, longitude: 72.8995, displayName: 'Chembur, Mumbai, India' };
  }
  if (lower.includes('kurla')) {
    return { latitude: 19.0650, longitude: 72.8790, displayName: 'Kurla, Mumbai, India' };
  }
  if (lower.includes('marine drive')) {
    return { latitude: 18.9438, longitude: 72.8233, displayName: 'Marine Drive, Mumbai, India' };
  }

  // OpenStreetMap Nominatim Live Geocoding API
  try {
    let searchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleanQuery)}`;
    
    // Append Mumbai / India if not mentioned to prioritize local results
    if (!lower.includes('mumbai') && !lower.includes('india') && !lower.includes('maharashtra')) {
      searchUrl += `%2C+Mumbai`;
    }

    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'EventFlowAI/1.0',
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        const first = data[0];
        return {
          latitude: Number(parseFloat(first.lat).toFixed(6)),
          longitude: Number(parseFloat(first.lon).toFixed(6)),
          displayName: first.display_name,
        };
      }
    }
  } catch (err) {
    console.warn('Geocode API request failed, fallbacking...', err);
  }

  return null;
}
