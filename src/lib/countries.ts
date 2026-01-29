// Country data with search terms for PubMed affiliation matching

export interface Country {
  code: string;
  name: string;
  flag: string;
  searchTerms: string[]; // Cities, states, institutions, variations
}

export const COUNTRIES: Country[] = [
  {
    code: 'AU',
    name: 'Australia',
    flag: '🇦🇺',
    searchTerms: [
      'Australia',
      'Sydney',
      'Melbourne',
      'Brisbane',
      'Perth',
      'Adelaide',
      'Canberra',
      'Queensland',
      'Victoria',
      'New South Wales',
      'UNSW',
      'University of Sydney',
      'Monash',
      'University of Melbourne',
    ],
  },
  {
    code: 'UK',
    name: 'United Kingdom',
    flag: '🇬🇧',
    searchTerms: [
      'United Kingdom',
      'UK',
      'England',
      'Scotland',
      'Wales',
      'London',
      'Manchester',
      'Birmingham',
      'Edinburgh',
      'Glasgow',
      'Oxford',
      'Cambridge',
      'Imperial College',
      'UCL',
      'Kings College',
      'NHS',
    ],
  },
  {
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    searchTerms: [
      'United States',
      'USA',
      'U.S.A',
      'America',
      'New York',
      'Los Angeles',
      'Chicago',
      'Boston',
      'San Francisco',
      'Houston',
      'Philadelphia',
      'California',
      'Texas',
      'Massachusetts',
      'Harvard',
      'Stanford',
      'MIT',
      'Johns Hopkins',
      'Mayo Clinic',
      'Yale',
      'Columbia',
      'UCLA',
      'NIH',
      'CDC',
    ],
  },
  {
    code: 'CA',
    name: 'Canada',
    flag: '🇨🇦',
    searchTerms: [
      'Canada',
      'Toronto',
      'Vancouver',
      'Montreal',
      'Ottawa',
      'Calgary',
      'Edmonton',
      'Ontario',
      'Quebec',
      'British Columbia',
      'Alberta',
      'McGill',
      'University of Toronto',
      'UBC',
    ],
  },
  {
    code: 'DE',
    name: 'Germany',
    flag: '🇩🇪',
    searchTerms: [
      'Germany',
      'Deutschland',
      'Berlin',
      'Munich',
      'Hamburg',
      'Frankfurt',
      'Cologne',
      'Heidelberg',
      'Charite',
      'Max Planck',
      'Ludwig Maximilian',
      'Humboldt',
    ],
  },
  {
    code: 'FR',
    name: 'France',
    flag: '🇫🇷',
    searchTerms: [
      'France',
      'Paris',
      'Lyon',
      'Marseille',
      'Toulouse',
      'Bordeaux',
      'Sorbonne',
      'INSERM',
      'Institut Pasteur',
      'AP-HP',
    ],
  },
  {
    code: 'IT',
    name: 'Italy',
    flag: '🇮🇹',
    searchTerms: [
      'Italy',
      'Italia',
      'Rome',
      'Milan',
      'Florence',
      'Naples',
      'Turin',
      'Bologna',
      'Sapienza',
      'San Raffaele',
    ],
  },
  {
    code: 'ES',
    name: 'Spain',
    flag: '🇪🇸',
    searchTerms: [
      'Spain',
      'España',
      'Madrid',
      'Barcelona',
      'Valencia',
      'Seville',
      'Hospital Clinic',
      'CIBERES',
    ],
  },
  {
    code: 'NL',
    name: 'Netherlands',
    flag: '🇳🇱',
    searchTerms: [
      'Netherlands',
      'Holland',
      'Amsterdam',
      'Rotterdam',
      'Utrecht',
      'Leiden',
      'Erasmus',
      'UMC',
    ],
  },
  {
    code: 'SE',
    name: 'Sweden',
    flag: '🇸🇪',
    searchTerms: [
      'Sweden',
      'Stockholm',
      'Gothenburg',
      'Malmo',
      'Uppsala',
      'Karolinska',
    ],
  },
  {
    code: 'CH',
    name: 'Switzerland',
    flag: '🇨🇭',
    searchTerms: [
      'Switzerland',
      'Zurich',
      'Geneva',
      'Basel',
      'Bern',
      'ETH',
      'EPFL',
      'Roche',
      'Novartis',
    ],
  },
  {
    code: 'JP',
    name: 'Japan',
    flag: '🇯🇵',
    searchTerms: [
      'Japan',
      'Tokyo',
      'Osaka',
      'Kyoto',
      'Yokohama',
      'Nagoya',
      'University of Tokyo',
      'Keio',
      'Waseda',
    ],
  },
  {
    code: 'CN',
    name: 'China',
    flag: '🇨🇳',
    searchTerms: [
      'China',
      'Chinese',
      'Beijing',
      'Shanghai',
      'Guangzhou',
      'Shenzhen',
      'Wuhan',
      'Hangzhou',
      'Peking University',
      'Tsinghua',
      'Fudan',
      'Zhejiang',
    ],
  },
  {
    code: 'KR',
    name: 'South Korea',
    flag: '🇰🇷',
    searchTerms: [
      'South Korea',
      'Korea',
      'Seoul',
      'Busan',
      'Incheon',
      'Seoul National',
      'Yonsei',
      'Samsung Medical',
    ],
  },
  {
    code: 'IN',
    name: 'India',
    flag: '🇮🇳',
    searchTerms: [
      'India',
      'Mumbai',
      'Delhi',
      'Bangalore',
      'Chennai',
      'Kolkata',
      'Hyderabad',
      'AIIMS',
      'Tata Memorial',
    ],
  },
  {
    code: 'BR',
    name: 'Brazil',
    flag: '🇧🇷',
    searchTerms: [
      'Brazil',
      'Brasil',
      'Sao Paulo',
      'Rio de Janeiro',
      'Brasilia',
      'USP',
      'FIOCRUZ',
    ],
  },
  {
    code: 'MX',
    name: 'Mexico',
    flag: '🇲🇽',
    searchTerms: [
      'Mexico',
      'México',
      'Mexico City',
      'Guadalajara',
      'Monterrey',
      'UNAM',
    ],
  },
  {
    code: 'IL',
    name: 'Israel',
    flag: '🇮🇱',
    searchTerms: [
      'Israel',
      'Tel Aviv',
      'Jerusalem',
      'Haifa',
      'Weizmann',
      'Hebrew University',
      'Technion',
      'Hadassah',
    ],
  },
  {
    code: 'SG',
    name: 'Singapore',
    flag: '🇸🇬',
    searchTerms: [
      'Singapore',
      'NUS',
      'Nanyang',
      'Duke-NUS',
    ],
  },
  {
    code: 'NZ',
    name: 'New Zealand',
    flag: '🇳🇿',
    searchTerms: [
      'New Zealand',
      'Auckland',
      'Wellington',
      'Christchurch',
      'University of Auckland',
      'Otago',
    ],
  },
];

// Build PubMed search query for a single country
export function buildCountryQuery(countryCode: string): string | null {
  const country = COUNTRIES.find(c => c.code === countryCode);
  if (!country) return null;

  // Build OR query for affiliation field
  const terms = country.searchTerms.map(term => `"${term}"[ad]`);
  return `(${terms.join(' OR ')})`;
}

// Build PubMed search query for multiple countries
export function buildCountriesQuery(countryCodes: string[]): string | null {
  if (!countryCodes || countryCodes.length === 0) return null;

  // Collect all search terms from all selected countries
  const allTerms: string[] = [];
  for (const code of countryCodes) {
    const country = COUNTRIES.find(c => c.code === code);
    if (country) {
      allTerms.push(...country.searchTerms);
    }
  }

  if (allTerms.length === 0) return null;

  // Build OR query for affiliation field
  const terms = allTerms.map(term => `"${term}"[ad]`);
  return `(${terms.join(' OR ')})`;
}

// Get country by code
export function getCountryByCode(code: string): Country | undefined {
  return COUNTRIES.find(c => c.code === code);
}
