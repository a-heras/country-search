export interface RawLanguage {
  name: string;
  iso639_1?: string;
  iso639_2?: string;
  nativeName?: string;
}

export interface RawCurrency {
  code: string;
  name: string;
  symbol?: string;
}

export interface RawCountry {
  name: string;
  flag?: string;
  flags?: { png?: string; svg?: string };
  capital?: string;
  region?: string;
  subregion?: string;
  population?: number;
  languages?: RawLanguage[];
  area?: number;
  borders?: string[];
  currencies?: RawCurrency[];
  nativeName?: string;
  demonym?: string;
  timezones?: string[];
}

export interface Country {
  name: string;
  flag: string;
  flagUrl: string;
  capital: string;
  region: string;
  subregion: string;
  population: number;
  languages: string[];
  area: number;
  borders: string[];
  currencies: string[];
  nativeName: string;
  demonym: string;
  timezones: string[];
}
