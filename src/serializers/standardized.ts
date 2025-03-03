import camelCaseKeys from 'camelcase-keys';
import { defineSerializers, XtreamCategory } from '../main.ts';

/**
 * Standardized serializers for the Xtream API
 *
 * This serializer will transform the API response into a standardized format
 * ensuring dates are dates, keys are camel case, keys are consistent, etc.
 */
export const standardizedSerializer = defineSerializers('Standardized', {
  profile: (input): StandardXtreamProfile => {
    const { auth, expDate, maxConnections, activeCons, createdAt, ...camelInput } = camelCaseKeys(input);

    return {
      id: camelInput.username,
      ...camelInput,
      isTrial: camelInput.isTrial === '1',
      maxConnections: Number(maxConnections),
      activeConnections: Number(activeCons),
      createdAt: new Date(Number(createdAt) * 1000),
      expiresAt: new Date(Number(expDate) * 1000),
    };
  },

  serverInfo: (input): StandardXtreamServerInfo => {
    const { timestampNow, ...camelInput } = camelCaseKeys(input);

    return {
      id: input.url,
      ...camelInput,
      timeNow: new Date(Number(timestampNow) * 1000),
    };
  },

  channelCategories: (input): StandardXtreamCategory[] => {
    return categoryMapper(input);
  },

  movieCategories: (input): StandardXtreamCategory[] => {
    return categoryMapper(input);
  },

  TVShowCategories: (input): StandardXtreamCategory[] => {
    return categoryMapper(input);
  },

  channels: (input): StandardXtreamChannel[] => {
    const camelInput = camelCaseKeys(input);

    return camelInput.map((channel) => {
      const {
        added,
        num,
        streamId,
        streamType,
        isAdult,
        categoryId,
        categoryIds,
        streamIcon,
        epgChannelId,
        tvArchive,
        ...cced
      } = channel;

      return {
        id: streamId.toString(),
        number: num,
        ...cced,
        tvArchive: tvArchive === 1,
        logo: streamIcon,
        epgId: epgChannelId,
        isAdult: isAdult === 1,
        createdAt: new Date(Number(added) * 1000),
        categoryIds: categoryIds.map((id) => id.toString()),
      };
    });
  },

  movies: (input): StandardXtreamMovie[] => {
    const camelInput = camelCaseKeys(input);

    return camelInput.map((movie) => {
      const {
        num,
        streamType,
        streamIcon,
        streamId,
        isAdult,
        releaseDate,
        rating5Based,
        added,
        categoryIds,
        categoryId,
        episodeRunTime,
        genre,
        cast,
        director,
        ...cced
      } = movie;

      return {
        id: streamId.toString(),
        ...cced,
        genre: genre.split(',').map((x) => x.trim()),
        cast: cast.split(',').map((x) => x.trim()),
        director: director.split(',').map((x) => x.trim()),
        poster: streamIcon,
        isAdult: isAdult === 1,
        runtime: Number(episodeRunTime),
        releaseDate: new Date(releaseDate),
        createdAt: new Date(Number(added) * 1000),
        categoryIds: categoryIds.map((id) => id.toString()),
      };
    });
  },

  TVShows: (input): StandardXtreamTVShow[] => {
    const camelInput = camelCaseKeys(input);

    return camelInput.map((show) => {
      const {
        num,
        streamType,
        rating,
        rating5Based,
        seriesId,
        cover,
        releasedate,
        categoryId,
        categoryIds,
        backdropPath,
        releaseDate,
        episodeRunTime,
        lastModified,
        cast,
        director,
        genre,
        ...restShow
      } = show;

      return {
        id: seriesId.toString(),
        ...restShow,
        cast: cast.split(',').map((x) => x.trim()),
        director: director.split(',').map((x) => x.trim()),
        genre: genre.split(',').map((x) => x.trim()),
        rating: Number(rating),
        poster: cover,
        cover: backdropPath[0],
        episodeRunTime: Number(episodeRunTime),
        releaseDate: new Date(releasedate || releaseDate),
        updatedAt: new Date(Number(lastModified) * 1000),
        categoryIds: categoryIds.map((id) => id.toString()),
      };
    });
  },

  TVShow: (input): StandardXtreamTVShow => {
    const { seasons, info, episodes } = camelCaseKeys(input, {
      deep: true,
    });

    const {
      num,
      streamType,
      rating,
      rating5Based,
      seriesId,
      cover,
      releasedate,
      categoryId,
      categoryIds,
      backdropPath,
      releaseDate,
      episodeRunTime,
      lastModified,
      cast,
      director,
      genre,

      ...restTVShowInfo
    } = info;

    const flatEpisodes = Object.values(episodes).flat();

    const mappedEpisodes: StandardXtreamEpisode[] = flatEpisodes.map((episode) => {
      const { id, season, episodeNum, added, info, ...restEpisode } = episode;

      const { releaseDate, movieImage, coverBig, durationSecs, duration, tmdbId, ...restEpisodeInfo } = info;
      const seasonId = seasons.find((x) => x.seasonNumber === season)?.id.toString() || season.toString();

      return {
        id,
        number: Number(episodeNum),
        ...restEpisode,
        ...restEpisodeInfo,
        tmdbId: tmdbId?.toString(),
        poster: movieImage,
        cover: coverBig,
        duration: durationSecs,
        durationFormatted: duration,
        releaseDate: new Date(releaseDate),
        createdAt: new Date(Number(added) * 1000),
        tvShowId: seriesId.toString(),
        seasonId: seasonId,
      };
    });

    let seasonsToMap = seasons;

    if (seasonsToMap.length === 0) {
      // if xtream provides no seasons, we will use the episode keys to generate seasons
      seasonsToMap = Object.keys(episodes).map((season) => {
        const seasonNumber = season;
        const firstEpisode = episodes[season][0];
        return {
          id: Number(seasonNumber),
          name: `Season ${seasonNumber}`,
          episodeCount: episodes[season].length.toString(),
          overview: '',
          airDate: firstEpisode.info.releaseDate,
          cover: firstEpisode.info.movieImage,
          coverTmdb: firstEpisode.info.movieImage,
          seasonNumber: Number(seasonNumber),
          coverBig: firstEpisode.info.movieImage,
          releaseDate: firstEpisode.info.releaseDate,
        };
      });
    }

    const mappedSeasons: StandardXtreamSeason[] = seasonsToMap.map((season) => {
      const { id, seasonNumber, cover, coverBig, coverTmdb, airDate, ...restSeason } = season;

      return {
        id: id.toString(),
        ...restSeason,
        releaseDate: new Date(airDate),
        number: seasonNumber,
        cover: coverBig || coverTmdb,
        tvShowId: seriesId.toString(),
        episodes: mappedEpisodes.filter((episode) => episode.seasonId === id.toString()),
      };
    });

    return {
      id: info.seriesId.toString(),
      ...restTVShowInfo,
      rating: Number(rating),
      poster: cover,
      cover: backdropPath[0],
      episodeRunTime: Number(episodeRunTime),
      cast: cast.split(',').map((x) => x.trim()),
      director: director.split(',').map((x) => x.trim()),
      genre: genre.split(',').map((x) => x.trim()),
      releaseDate: new Date(releasedate || releaseDate),
      updatedAt: new Date(Number(lastModified) * 1000),
      categoryIds: categoryIds.map((id) => id.toString()),
      seasons: mappedSeasons,
    };
  },

  shortEPG: (input): StandardXtreamShortEPGListing[] => {
    const { epgListings } = camelCaseKeys(input, { deep: true });

    return epgListings.map((listing) => {
      const { lang, startTimestamp, stopTimestamp, stop, start, end, title, description, ...restListing } = listing;

      return {
        ...restListing,
        start: new Date(start),
        end: new Date(Number(end) * 1000),
        title: atob(title),
        description: atob(description),
        language: lang,
      };
    });
  },

  fullEPG: (input): StandardXtreamFullEPGListing[] => {
    const { epgListings } = camelCaseKeys(input, { deep: true });

    return epgListings.map((listing) => {
      const {
        lang,
        startTimestamp,
        stopTimestamp,
        start,
        end,
        title,
        description,
        nowPlaying,
        hasArchive,
        ...restListing
      } = listing;

      return {
        ...restListing,
        start: new Date(start),
        end: new Date(end),
        title: atob(title),
        description: atob(description),
        language: lang,
        nowPlaying: Boolean(nowPlaying),
        hasArchive: Boolean(hasArchive),
      };
    });
  },
});

function categoryMapper(input: XtreamCategory[]): StandardXtreamCategory[] {
  const camelInput = camelCaseKeys(input);

  return camelInput.map((category) => {
    const { categoryId, categoryName, parentId } = category;

    return {
      id: categoryId.toString(),
      name: categoryName,
      parentId: parentId.toString(),
    };
  });
}

/**
 * Standardized Xtream profile information
 *
 * This type represents the complete user profile information in a standardized format
 */
export type StandardXtreamProfile = {
  /** The unique identifier for the profile (username) */
  id: string;
  /** The username of the account */
  username: string;
  /** The password of the account */
  password: string;
  /** Account status (e.g., "Active") */
  status: string;
  /** Number of active connections currently used */
  activeConnections: number;
  /** Maximum allowed concurrent connections */
  maxConnections: number;
  /** Flag indicating if the account is a trial */
  isTrial: boolean;
  /** The date when the account was created */
  createdAt: Date;
  /** The expiration date of the account */
  expiresAt: Date;
};

/**
 * Standardized Xtream server information
 *
 * This type represents the server-specific information in a standardized format
 */
export type StandardXtreamServerInfo = {
  /** The unique identifier for the server (URL) */
  id: string;
  /** The base URL of the Xtream server */
  url: string;
  /** The HTTP port number */
  port: string;
  /** The HTTPS port number */
  httpsPort: string;
  /** The protocol used by the server */
  serverProtocol: string;
  /** The RTMP port number for streaming */
  rtmpPort: string;
  /** The timezone setting of the server */
  timezone: string;
  /** The current server time as a Date object */
  timeNow: Date;
  /** Server process status */
  process: boolean;
};

/**
 * Standardized Xtream category information
 *
 * This type represents a content category in the Xtream system in a standardized format
 */
export type StandardXtreamCategory = {
  /** The unique identifier for the category */
  id: string;
  /** The display name of the category */
  name: string;
  /** The ID of the parent category, if applicable */
  parentId: string;
};

/**
 * Standardized Xtream channel information
 *
 * This type represents a live TV channel in the Xtream system in a standardized format
 */
export type StandardXtreamChannel = {
  /** The unique identifier for the channel */
  id: string;
  /** The name of the channel */
  name: string;
  /** The Electronic Program Guide channel ID */
  epgId: string;
  /** The position/order number of the channel */
  number: number;
  /** Custom stream identifier */
  customSid: string;
  /** Flag indicating if TV archive is available */
  tvArchive: boolean;
  /** The direct URL to the channel's source */
  directSource: string;
  /** The duration of available archive in days */
  tvArchiveDuration: number;
  /** The URL for the channel's cover image */
  thumbnail: string;
  /** The URL for the channel's logo */
  logo: string;
  /** Flag indicating if the content is for adults */
  isAdult: boolean;
  /** The date when the channel was added to the system */
  createdAt: Date;
  /** All category IDs the channel belongs to */
  categoryIds?: string[];
};

/**
 * Standardized Xtream movie information
 *
 * This type represents a movie in the Xtream system in a standardized format
 */
export type StandardXtreamMovie = {
  /** The unique identifier for the movie */
  id: string;
  /** The title of the movie */
  name: string;
  /** The synopsis/description of the movie */
  plot: string;
  /** The movie's rating */
  rating: number;
  /** The URL for the movie's poster */
  poster: string;
  /** The release date of the movie */
  releaseDate: Date;
  /** The runtime of the movie in minutes */
  runtime: number;
  /** The cast of the movie as an array */
  cast: string[];
  /** The director(s) of the movie as an array */
  director: string[];
  /** The genres of the movie as an array */
  genre: string[];
  /** The date when the movie was added to the system */
  createdAt: Date;
  /** All category IDs the movie belongs to */
  categoryIds?: string[];
};

/**
 * Standardized Xtream TV show information
 *
 * This type represents a TV show in the Xtream system in a standardized format
 */
export type StandardXtreamTVShow = {
  /** The unique identifier for the TV show */
  id: string;
  /** The title of the TV show */
  name: string;
  /** The synopsis/description of the TV show */
  plot: string;
  /** The TV show's rating */
  rating: number;
  /** The URL for the TV show's poster image */
  poster: string;
  /** The URL for the TV show's cover image */
  cover: string;
  /** The release date of the TV show */
  releaseDate: Date;
  /** The average runtime of episodes in minutes */
  episodeRunTime: number;
  /** The cast members of the TV show as an array */
  cast: string[];
  /** The director(s) of the TV show as an array */
  director: string[];
  /** The genre(s) of the TV show as an array */
  genre: string[];
  /** The date when the TV show was last updated */
  updatedAt: Date;
  /** All category IDs the TV show belongs to */
  categoryIds?: string[];
  /** Array of seasons in the TV show */
  seasons?: StandardXtreamSeason[];
  /** If no seasons exists episodes will be on this property */
  episodes?: StandardXtreamEpisode[];
};

/**
 * Standardized Xtream episode information
 *
 * This type represents an episode in a TV show in the Xtream system in a standardized format
 */
export type StandardXtreamEpisode = {
  /** The unique identifier for the episode */
  id: string;
  /** The episode number within the season */
  number: number;
  /** The title of the episode */
  title: string;
  /** The synopsis/description of the episode */
  plot: string;
  /** The release date of the episode */
  releaseDate: Date;
  /** The duration of the episode in seconds */
  duration: number;
  /** The formatted duration of the episode */
  durationFormatted: string;
  /** The URL for the episode's poster image */
  poster: string;
  /** The URL for the episode's cover image */
  cover: string;
  /** The id of the episode in The Movie Database */
  tmdbId: string;
  /** The date when the episode was added to the system */
  createdAt: Date;
  /** The ID of the season this episode belongs to */
  seasonId?: string;
  /** The ID of the TV show this episode belongs to */
  tvShowId: string;
};

/**
 * Standardized Xtream season information
 *
 * This type represents a season of a TV show in the Xtream system in a standardized format
 */
export type StandardXtreamSeason = {
  /** The unique identifier for the season */
  id: string;
  /** The season number */
  number: number;
  /** The URL for the season's cover image */
  cover: string;
  /** The date when the season first aired */
  releaseDate: Date;
  /** The ID of the TV show this season belongs to */
  tvShowId: string;
  /** Episodes in this season */
  episodes?: StandardXtreamEpisode[];
};

/**
 * Standardized Xtream short EPG listing information
 *
 * This type represents a short EPG listing for a channel in a standardized format
 */
export type StandardXtreamShortEPGListing = {
  /** The unique identifier for the listing */
  id: string;
  /** The EPG ID of the listing */
  epgId: string;
  /** The title of the listing */
  title: string;
  /** The language of the listing */
  language: string;
  /** The start time of the listing */
  start: Date;
  /** The end time of the listing */
  end: Date;
  /** The description of the listing */
  description: string;
  /** The channel ID of the listing */
  channelId: string;
};

/**
 * Standardized Xtream full EPG listing information
 *
 * This type represents a full EPG listing for a channel in a standardized format with additional information
 */
export type StandardXtreamFullEPGListing = {
  /** The unique identifier for the listing */
  id: string;
  /** The EPG ID of the listing */
  epgId: string;
  /** The title of the listing */
  title: string;
  /** The language of the listing */
  language: string;
  /** The start time of the listing */
  start: Date;
  /** The end time of the listing */
  end: Date;
  /** The description of the listing */
  description: string;
  /** The channel ID of the listing */
  channelId: string;
  /** Flag indicating if the listing is currently playing */
  nowPlaying: boolean;
  /** Flag indicating if the listing has an archive available */
  hasArchive: boolean;
};
