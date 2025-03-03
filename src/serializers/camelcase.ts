import camelCaseKeys from 'camelcase-keys';
import { defineSerializers } from '../main.ts';

/**
 * CamelCase serializers for the Xtream API
 *
 * These serializers transform the API response into a camelCase format only,
 * no other transformations are applied
 */
export const camelCaseSerializer = defineSerializers('Camel Case', {
  profile: (input) => {
    return camelCaseKeys(input);
  },
  serverInfo: (input) => {
    return camelCaseKeys(input);
  },
  channelCategories: (input) => {
    return camelCaseKeys(input);
  },
  movieCategories: (input) => {
    return camelCaseKeys(input);
  },
  TVShowCategories: (input) => {
    return camelCaseKeys(input);
  },
  channels: (input) => {
    return camelCaseKeys(input);
  },
  movies: (input) => {
    return camelCaseKeys(input);
  },
  TVShows: (input) => {
    return camelCaseKeys(input);
  },
  TVShow: (input) => {
    return camelCaseKeys(input, { deep: true });
  },
  shortEPG: (input) => {
    return camelCaseKeys(input, { deep: true });
  },
  fullEPG: (input) => {
    return camelCaseKeys(input, { deep: true });
  },
});
