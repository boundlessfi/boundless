export interface Country {
  id: number;
  name: string;
  iso2: string;
  iso3: string;
  latitude: number;
  longitude: number;
  region: string;
  subregion: string;
}

export interface State {
  id: number;
  name: string;
  country_id: number;
  country_code: string;
  country_name: string;
  state_code: string;
  latitude: number;
  longitude: number;
}

export interface City {
  id: number;
  name: string;
  state_id: number;
  state_code: string;
  state_name: string;
  country_id: number;
  country_code: string;
  country_name: string;
  latitude: number;
  longitude: number;
}

let countriesCache: Country[] | null = null;
let statesCache: State[] | null = null;
let citiesCache: City[] | null = null;

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

export async function loadCountries(): Promise<Country[]> {
  if (countriesCache) return countriesCache;

  try {
    const response = await fetch('/data/country/countries.csv');
    const csvText = await response.text();
    const lines = csvText.split('\n');
    const headers = parseCSVLine(lines[0]);

    const countries: Country[] = [];

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = parseCSVLine(lines[i]);
        if (values.length >= headers.length) {
          countries.push({
            id: parseInt(values[0]) || 0,
            name: values[1] || '',
            iso2: values[3] || '',
            iso3: values[2] || '',
            latitude: parseFloat(values[21]) || 0,
            longitude: parseFloat(values[22]) || 0,
            region: values[15] || '',
            subregion: values[17] || '',
          });
        }
      }
    }

    countriesCache = countries;
    return countries;
  } catch {
    return [
      {
        id: 1,
        name: 'Nigeria',
        iso2: 'NG',
        iso3: 'NGA',
        latitude: 9.082,
        longitude: 8.6753,
        region: 'Africa',
        subregion: 'Western Africa',
      },
      {
        id: 2,
        name: 'United States',
        iso2: 'US',
        iso3: 'USA',
        latitude: 39.8283,
        longitude: -98.5795,
        region: 'Americas',
        subregion: 'Northern America',
      },
      {
        id: 3,
        name: 'United Kingdom',
        iso2: 'GB',
        iso3: 'GBR',
        latitude: 55.3781,
        longitude: -3.436,
        region: 'Europe',
        subregion: 'Northern Europe',
      },
      {
        id: 4,
        name: 'Canada',
        iso2: 'CA',
        iso3: 'CAN',
        latitude: 56.1304,
        longitude: -106.3468,
        region: 'Americas',
        subregion: 'Northern America',
      },
      {
        id: 5,
        name: 'Germany',
        iso2: 'DE',
        iso3: 'DEU',
        latitude: 51.1657,
        longitude: 10.4515,
        region: 'Europe',
        subregion: 'Western Europe',
      },
      {
        id: 6,
        name: 'France',
        iso2: 'FR',
        iso3: 'FRA',
        latitude: 46.2276,
        longitude: 2.2137,
        region: 'Europe',
        subregion: 'Western Europe',
      },
      {
        id: 7,
        name: 'Singapore',
        iso2: 'SG',
        iso3: 'SGP',
        latitude: 1.3521,
        longitude: 103.8198,
        region: 'Asia',
        subregion: 'South-Eastern Asia',
      },
      {
        id: 8,
        name: 'Japan',
        iso2: 'JP',
        iso3: 'JPN',
        latitude: 36.2048,
        longitude: 138.2529,
        region: 'Asia',
        subregion: 'Eastern Asia',
      },
      {
        id: 9,
        name: 'South Korea',
        iso2: 'KR',
        iso3: 'KOR',
        latitude: 35.9078,
        longitude: 127.7669,
        region: 'Asia',
        subregion: 'Eastern Asia',
      },
      {
        id: 10,
        name: 'Australia',
        iso2: 'AU',
        iso3: 'AUS',
        latitude: -25.2744,
        longitude: 133.7751,
        region: 'Oceania',
        subregion: 'Australia and New Zealand',
      },
      {
        id: 11,
        name: 'Brazil',
        iso2: 'BR',
        iso3: 'BRA',
        latitude: -14.235,
        longitude: -51.9253,
        region: 'Americas',
        subregion: 'South America',
      },
      {
        id: 12,
        name: 'India',
        iso2: 'IN',
        iso3: 'IND',
        latitude: 20.5937,
        longitude: 78.9629,
        region: 'Asia',
        subregion: 'Southern Asia',
      },
      {
        id: 13,
        name: 'China',
        iso2: 'CN',
        iso3: 'CHN',
        latitude: 35.8617,
        longitude: 104.1954,
        region: 'Asia',
        subregion: 'Eastern Asia',
      },
    ];
  }
}

export async function loadStatesByCountry(
  countryCode: string
): Promise<State[]> {
  if (!statesCache) {
    try {
      const response = await fetch('/data/country/states.csv');
      const csvText = await response.text();
      const lines = csvText.split('\n');
      const headers = parseCSVLine(lines[0]);

      const states: State[] = [];

      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          const values = parseCSVLine(lines[i]);
          if (values.length >= headers.length) {
            states.push({
              id: parseInt(values[0]) || 0,
              name: values[1] || '',
              country_id: parseInt(values[2]) || 0,
              country_code: values[3] || '',
              country_name: values[4] || '',
              state_code: values[5] || '',
              latitude: parseFloat(values[12]) || 0,
              longitude: parseFloat(values[13]) || 0,
            });
          }
        }
      }

      statesCache = states;
    } catch {
      return [];
    }
  }

  return statesCache.filter(state => state.country_code === countryCode);
}

export async function loadCitiesByState(
  countryCode: string,
  stateCode: string
): Promise<City[]> {
  if (!citiesCache) {
    try {
      const response = await fetch('/data/country/cities.csv');
      const csvText = await response.text();
      const lines = csvText.split('\n');
      const headers = parseCSVLine(lines[0]);

      const cities: City[] = [];

      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          const values = parseCSVLine(lines[i]);
          if (values.length >= headers.length) {
            cities.push({
              id: parseInt(values[0]) || 0,
              name: values[1] || '',
              state_id: parseInt(values[2]) || 0,
              state_code: values[3] || '',
              state_name: values[4] || '',
              country_id: parseInt(values[5]) || 0,
              country_code: values[6] || '',
              country_name: values[7] || '',
              latitude: parseFloat(values[8]) || 0,
              longitude: parseFloat(values[9]) || 0,
            });
          }
        }
      }

      citiesCache = cities;
    } catch {
      const fallbackCities: Record<string, City[]> = {
        NG: [
          {
            id: 1,
            name: 'Lagos',
            state_id: 1,
            state_code: 'LA',
            state_name: 'Lagos',
            country_id: 1,
            country_code: 'NG',
            country_name: 'Nigeria',
            latitude: 6.5244,
            longitude: 3.3792,
          },
          {
            id: 2,
            name: 'Abuja',
            state_id: 2,
            state_code: 'FC',
            state_name: 'Federal Capital Territory',
            country_id: 1,
            country_code: 'NG',
            country_name: 'Nigeria',
            latitude: 9.0765,
            longitude: 7.3986,
          },
          {
            id: 3,
            name: 'Port Harcourt',
            state_id: 3,
            state_code: 'RI',
            state_name: 'Rivers',
            country_id: 1,
            country_code: 'NG',
            country_name: 'Nigeria',
            latitude: 4.8156,
            longitude: 7.0498,
          },
          {
            id: 4,
            name: 'Kano',
            state_id: 4,
            state_code: 'KN',
            state_name: 'Kano',
            country_id: 1,
            country_code: 'NG',
            country_name: 'Nigeria',
            latitude: 12.0022,
            longitude: 8.592,
          },
          {
            id: 5,
            name: 'Ibadan',
            state_id: 5,
            state_code: 'OY',
            state_name: 'Oyo',
            country_id: 1,
            country_code: 'NG',
            country_name: 'Nigeria',
            latitude: 7.3776,
            longitude: 3.947,
          },
          {
            id: 6,
            name: 'Enugu',
            state_id: 6,
            state_code: 'EN',
            state_name: 'Enugu',
            country_id: 1,
            country_code: 'NG',
            country_name: 'Nigeria',
            latitude: 6.4413,
            longitude: 7.4988,
          },
        ],
        US: [
          {
            id: 7,
            name: 'New York',
            state_id: 7,
            state_code: 'NY',
            state_name: 'New York',
            country_id: 2,
            country_code: 'US',
            country_name: 'United States',
            latitude: 40.7128,
            longitude: -74.006,
          },
          {
            id: 8,
            name: 'Los Angeles',
            state_id: 8,
            state_code: 'CA',
            state_name: 'California',
            country_id: 2,
            country_code: 'US',
            country_name: 'United States',
            latitude: 34.0522,
            longitude: -118.2437,
          },
          {
            id: 9,
            name: 'Chicago',
            state_id: 9,
            state_code: 'IL',
            state_name: 'Illinois',
            country_id: 2,
            country_code: 'US',
            country_name: 'United States',
            latitude: 41.8781,
            longitude: -87.6298,
          },
          {
            id: 10,
            name: 'Houston',
            state_id: 10,
            state_code: 'TX',
            state_name: 'Texas',
            country_id: 2,
            country_code: 'US',
            country_name: 'United States',
            latitude: 29.7604,
            longitude: -95.3698,
          },
          {
            id: 11,
            name: 'Phoenix',
            state_id: 11,
            state_code: 'AZ',
            state_name: 'Arizona',
            country_id: 2,
            country_code: 'US',
            country_name: 'United States',
            latitude: 33.4484,
            longitude: -112.074,
          },
          {
            id: 12,
            name: 'Philadelphia',
            state_id: 12,
            state_code: 'PA',
            state_name: 'Pennsylvania',
            country_id: 2,
            country_code: 'US',
            country_name: 'United States',
            latitude: 39.9526,
            longitude: -75.1652,
          },
        ],
        GB: [
          {
            id: 13,
            name: 'London',
            state_id: 13,
            state_code: 'ENG',
            state_name: 'England',
            country_id: 3,
            country_code: 'GB',
            country_name: 'United Kingdom',
            latitude: 51.5074,
            longitude: -0.1278,
          },
          {
            id: 14,
            name: 'Manchester',
            state_id: 14,
            state_code: 'ENG',
            state_name: 'England',
            country_id: 3,
            country_code: 'GB',
            country_name: 'United Kingdom',
            latitude: 53.4808,
            longitude: -2.2426,
          },
          {
            id: 15,
            name: 'Birmingham',
            state_id: 15,
            state_code: 'ENG',
            state_name: 'England',
            country_id: 3,
            country_code: 'GB',
            country_name: 'United Kingdom',
            latitude: 52.4862,
            longitude: -1.8904,
          },
          {
            id: 16,
            name: 'Liverpool',
            state_id: 16,
            state_code: 'ENG',
            state_name: 'England',
            country_id: 3,
            country_code: 'GB',
            country_name: 'United Kingdom',
            latitude: 53.4084,
            longitude: -2.9916,
          },
          {
            id: 17,
            name: 'Leeds',
            state_id: 17,
            state_code: 'ENG',
            state_name: 'England',
            country_id: 3,
            country_code: 'GB',
            country_name: 'United Kingdom',
            latitude: 53.8008,
            longitude: -1.5491,
          },
          {
            id: 18,
            name: 'Sheffield',
            state_id: 18,
            state_code: 'ENG',
            state_name: 'England',
            country_id: 3,
            country_code: 'GB',
            country_name: 'United Kingdom',
            latitude: 53.3811,
            longitude: -1.4701,
          },
        ],
      };
      return fallbackCities[countryCode] || [];
    }
  }

  return citiesCache.filter(
    city => city.country_code === countryCode && city.state_code === stateCode
  );
}

export async function loadCitiesByCountry(
  countryCode: string
): Promise<City[]> {
  if (!citiesCache) {
    try {
      const response = await fetch('/data/country/cities.csv');
      const csvText = await response.text();
      const lines = csvText.split('\n');
      const headers = parseCSVLine(lines[0]);

      const cities: City[] = [];

      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          const values = parseCSVLine(lines[i]);
          if (values.length >= headers.length) {
            cities.push({
              id: parseInt(values[0]) || 0,
              name: values[1] || '',
              state_id: parseInt(values[2]) || 0,
              state_code: values[3] || '',
              state_name: values[4] || '',
              country_id: parseInt(values[5]) || 0,
              country_code: values[6] || '',
              country_name: values[7] || '',
              latitude: parseFloat(values[8]) || 0,
              longitude: parseFloat(values[9]) || 0,
            });
          }
        }
      }

      citiesCache = cities;
    } catch {
      const fallbackCities: Record<string, City[]> = {
        NG: [
          {
            id: 1,
            name: 'Lagos',
            state_id: 1,
            state_code: 'LA',
            state_name: 'Lagos',
            country_id: 1,
            country_code: 'NG',
            country_name: 'Nigeria',
            latitude: 6.5244,
            longitude: 3.3792,
          },
          {
            id: 2,
            name: 'Abuja',
            state_id: 2,
            state_code: 'FC',
            state_name: 'Federal Capital Territory',
            country_id: 1,
            country_code: 'NG',
            country_name: 'Nigeria',
            latitude: 9.0765,
            longitude: 7.3986,
          },
          {
            id: 3,
            name: 'Port Harcourt',
            state_id: 3,
            state_code: 'RI',
            state_name: 'Rivers',
            country_id: 1,
            country_code: 'NG',
            country_name: 'Nigeria',
            latitude: 4.8156,
            longitude: 7.0498,
          },
          {
            id: 4,
            name: 'Kano',
            state_id: 4,
            state_code: 'KN',
            state_name: 'Kano',
            country_id: 1,
            country_code: 'NG',
            country_name: 'Nigeria',
            latitude: 12.0022,
            longitude: 8.592,
          },
          {
            id: 5,
            name: 'Ibadan',
            state_id: 5,
            state_code: 'OY',
            state_name: 'Oyo',
            country_id: 1,
            country_code: 'NG',
            country_name: 'Nigeria',
            latitude: 7.3776,
            longitude: 3.947,
          },
          {
            id: 6,
            name: 'Enugu',
            state_id: 6,
            state_code: 'EN',
            state_name: 'Enugu',
            country_id: 1,
            country_code: 'NG',
            country_name: 'Nigeria',
            latitude: 6.4413,
            longitude: 7.4988,
          },
        ],
        US: [
          {
            id: 7,
            name: 'New York',
            state_id: 7,
            state_code: 'NY',
            state_name: 'New York',
            country_id: 2,
            country_code: 'US',
            country_name: 'United States',
            latitude: 40.7128,
            longitude: -74.006,
          },
          {
            id: 8,
            name: 'Los Angeles',
            state_id: 8,
            state_code: 'CA',
            state_name: 'California',
            country_id: 2,
            country_code: 'US',
            country_name: 'United States',
            latitude: 34.0522,
            longitude: -118.2437,
          },
          {
            id: 9,
            name: 'Chicago',
            state_id: 9,
            state_code: 'IL',
            state_name: 'Illinois',
            country_id: 2,
            country_code: 'US',
            country_name: 'United States',
            latitude: 41.8781,
            longitude: -87.6298,
          },
          {
            id: 10,
            name: 'Houston',
            state_id: 10,
            state_code: 'TX',
            state_name: 'Texas',
            country_id: 2,
            country_code: 'US',
            country_name: 'United States',
            latitude: 29.7604,
            longitude: -95.3698,
          },
          {
            id: 11,
            name: 'Phoenix',
            state_id: 11,
            state_code: 'AZ',
            state_name: 'Arizona',
            country_id: 2,
            country_code: 'US',
            country_name: 'United States',
            latitude: 33.4484,
            longitude: -112.074,
          },
          {
            id: 12,
            name: 'Philadelphia',
            state_id: 12,
            state_code: 'PA',
            state_name: 'Pennsylvania',
            country_id: 2,
            country_code: 'US',
            country_name: 'United States',
            latitude: 39.9526,
            longitude: -75.1652,
          },
        ],
        GB: [
          {
            id: 13,
            name: 'London',
            state_id: 13,
            state_code: 'ENG',
            state_name: 'England',
            country_id: 3,
            country_code: 'GB',
            country_name: 'United Kingdom',
            latitude: 51.5074,
            longitude: -0.1278,
          },
          {
            id: 14,
            name: 'Manchester',
            state_id: 14,
            state_code: 'ENG',
            state_name: 'England',
            country_id: 3,
            country_code: 'GB',
            country_name: 'United Kingdom',
            latitude: 53.4808,
            longitude: -2.2426,
          },
          {
            id: 15,
            name: 'Birmingham',
            state_id: 15,
            state_code: 'ENG',
            state_name: 'England',
            country_id: 3,
            country_code: 'GB',
            country_name: 'United Kingdom',
            latitude: 52.4862,
            longitude: -1.8904,
          },
          {
            id: 16,
            name: 'Liverpool',
            state_id: 16,
            state_code: 'ENG',
            state_name: 'England',
            country_id: 3,
            country_code: 'GB',
            country_name: 'United Kingdom',
            latitude: 53.4084,
            longitude: -2.9916,
          },
          {
            id: 17,
            name: 'Leeds',
            state_id: 17,
            state_code: 'ENG',
            state_name: 'England',
            country_id: 3,
            country_code: 'GB',
            country_name: 'United Kingdom',
            latitude: 53.8008,
            longitude: -1.5491,
          },
          {
            id: 18,
            name: 'Sheffield',
            state_id: 18,
            state_code: 'ENG',
            state_name: 'England',
            country_id: 3,
            country_code: 'GB',
            country_name: 'United Kingdom',
            latitude: 53.3811,
            longitude: -1.4701,
          },
        ],
      };
      return fallbackCities[countryCode] || [];
    }
  }

  return citiesCache.filter(city => city.country_code === countryCode);
}

export async function searchCities(
  query: string,
  countryCode?: string
): Promise<City[]> {
  const cities = countryCode
    ? await loadCitiesByCountry(countryCode)
    : citiesCache || [];

  if (!query.trim()) return cities.slice(0, 50);

  const searchTerm = query.toLowerCase();
  return cities
    .filter(city => city.name.toLowerCase().includes(searchTerm))
    .slice(0, 50);
}

export async function geocodeAddress(
  address: string
): Promise<{ lat: number; lng: number; address: string } | null> {
  if (!address.trim()) return null;

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
    );
    const data = await response.json();

    if (data.length > 0) {
      const result = data[0];
      return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        address: result.display_name,
      };
    }
  } catch {}

  return null;
}
