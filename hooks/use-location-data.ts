import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  loadCountries,
  loadStatesByCountry,
  loadCitiesByState,
  type Country,
  type State,
  type City,
} from '@/lib/country-utils';
import type {
  UseFormSetValue,
  FieldValues,
  Path,
  PathValue,
} from 'react-hook-form';

interface UseLocationDataProps<T extends FieldValues> {
  selectedCountry: string;
  selectedState: string;
  setValue: UseFormSetValue<T>;
}

export const useLocationData = <T extends FieldValues>({
  selectedCountry,
  selectedState,
  setValue,
}: UseLocationDataProps<T>) => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);

  useEffect(() => {
    const loadCountriesData = async () => {
      try {
        const countriesData = await loadCountries();
        setCountries(countriesData);
      } catch {
        toast.error('Failed to load countries. Please try again.');
      }
    };
    loadCountriesData();
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      const loadStatesData = async () => {
        try {
          const statesData = await loadStatesByCountry(selectedCountry);
          setStates(statesData);
          setCities([]);
          setValue('state' as Path<T>, '' as PathValue<T, Path<T>>);
          setValue('city' as Path<T>, '' as PathValue<T, Path<T>>);
        } catch {
          toast.error('Failed to load states');
          setStates([]);
        }
      };
      loadStatesData();
    } else {
      setStates([]);
      setCities([]);
    }
  }, [selectedCountry, setValue]);

  useEffect(() => {
    if (selectedCountry && selectedState) {
      const loadCitiesData = async () => {
        try {
          const citiesData = await loadCitiesByState(
            selectedCountry,
            selectedState
          );
          setCities(citiesData);
          setValue('city' as Path<T>, '' as PathValue<T, Path<T>>);
        } catch {
          toast.error('Failed to load cities');
          setCities([]);
        }
      };
      loadCitiesData();
    } else {
      setCities([]);
    }
  }, [selectedCountry, selectedState, setValue]);

  return {
    countries,
    states,
    cities,
  };
};
