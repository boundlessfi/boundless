import { useState, useEffect, useCallback } from 'react';
import { geocodeAddress } from '@/lib/country-utils';
import type { Country, State, City } from '@/lib/country-utils';
import type {
  UseFormWatch,
  FieldValues,
  Path,
  PathValue,
} from 'react-hook-form';

interface MapLocation {
  lat: number;
  lng: number;
  address: string;
}

interface UseGeocodingProps<T extends FieldValues> {
  countries: Country[];
  states: State[];
  cities: City[];
  selectedCountry: string;
  selectedState: string;
  watch: UseFormWatch<T>;
}

export const useGeocoding = <T extends FieldValues>({
  countries,
  states,
  cities,
  selectedCountry,
  selectedState,
  watch,
}: UseGeocodingProps<T>) => {
  const [mapLocation, setMapLocation] = useState<MapLocation | null>(null);

  const getLocationCenter = useCallback((): MapLocation | null => {
    const country = countries.find(c => c.iso2 === selectedCountry);
    const state = states.find(s => s.state_code === selectedState);
    const cityName = watch('city' as Path<T>) as PathValue<T, Path<T>>;
    const city =
      typeof cityName === 'string'
        ? cities.find(c => c.name === cityName)
        : undefined;

    if (city) {
      return {
        lat: city.latitude,
        lng: city.longitude,
        address: `${city.name}, ${state?.name || ''}, ${country?.name || ''}`
          .replace(/,\s*,/g, ',')
          .replace(/,$/, ''),
      };
    } else if (state) {
      return {
        lat: state.latitude,
        lng: state.longitude,
        address: `${state.name}, ${country?.name || ''}`
          .replace(/,\s*,/g, ',')
          .replace(/,$/, ''),
      };
    } else if (country) {
      return {
        lat: country.latitude,
        lng: country.longitude,
        address: country.name,
      };
    }
    return null;
  }, [countries, states, cities, selectedCountry, selectedState, watch]);

  const geocodeAddressHandler = useCallback(
    async (address: string) => {
      if (!address.trim()) return;

      try {
        const country = countries.find(c => c.iso2 === selectedCountry);
        const state = states.find(s => s.state_code === selectedState);
        const city = watch('city' as Path<T>) as PathValue<T, Path<T>>;

        let searchQuery = address;
        if (city && typeof city === 'string' && city !== 'other') {
          searchQuery = `${address}, ${city}`;
        }
        if (state && state.name) {
          searchQuery += `, ${state.name}`;
        }
        if (country && country.name) {
          searchQuery += `, ${country.name}`;
        }

        const result = await geocodeAddress(searchQuery);
        if (result) {
          setMapLocation(result);
        }
      } catch {
        // Silently fail geocoding as it's not critical
      }
    },
    [countries, states, selectedCountry, selectedState, watch]
  );

  useEffect(() => {
    const address = watch('venueAddress' as Path<T>) as PathValue<T, Path<T>>;
    const country = watch('country' as Path<T>) as PathValue<T, Path<T>>;
    const state = watch('state' as Path<T>) as PathValue<T, Path<T>>;
    const city = watch('city' as Path<T>) as PathValue<T, Path<T>>;
    const venueType = watch('venueType' as Path<T>) as PathValue<T, Path<T>>;

    if (venueType === 'physical') {
      if (address && typeof address === 'string' && address.trim()) {
        const timeoutId = setTimeout(() => {
          geocodeAddressHandler(address);
        }, 1000);

        return () => clearTimeout(timeoutId);
      } else if (country || state || city) {
        const locationCenter = getLocationCenter();
        if (locationCenter) {
          setMapLocation(locationCenter);
        }
      }
    }
  }, [watch, geocodeAddressHandler, getLocationCenter]);

  return {
    mapLocation,
  };
};
