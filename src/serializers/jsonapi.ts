import camelCaseKeys from 'camelcase-keys';
import { defineSerializers } from '../xtream.ts';
import type { XtreamCategory } from '../types.ts';

/**
 * JSON API serializers for the Xtream API
 *
 * These serializers transform the API response into a JSON:API compatible format
 * https://jsonapi.org/
 */
export const JSONAPISerializer = defineSerializers('JSON:API', {
  profile: (input): { data: JSONAPIXtreamProfile } => {
    const { auth, expDate, maxConnections, activeCons, createdAt, ...camelInput } = camelCaseKeys(input);

    return {
      data: {
        type: 'user-profile',
        id: camelInput.username,
        attributes: {
          ...camelInput,
          isTrial: camelInput.isTrial === '1',
          maxConnections: Number(maxConnections),
          activeConnections: Number(activeCons),
          createdAt: new Date(Number(createdAt) * 1000),
          expiresAt: new Date(Number(expDate) * 1000),
        },
      },
    };
  },

  serverInfo: (input): { data: JSONAPIXtreamServerInfo } => {
    const { timestampNow, ...camelInput } = camelCaseKeys(input);

    return {
      data: {
        type: 'server-info',
        id: input.url,
        attributes: {
          ...camelInput,
          timeNow: new Date(Number(timestampNow) * 1000),
        },
      },
    };
  },

  channelCategories: (input): { data: JSONAPIXtreamCategory[] } => {
    return categoryMapper(input, 'channel-category');
  },

  movieCategories: (input): { data: JSONAPIXtreamCategory[] } => {
    return categoryMapper(input, 'movie-category');
  },

  showCategories: (input): { data: JSONAPIXtreamCategory[] } => {
    return categoryMapper(input, 'show-category');
  },

  channels: (input): { data: JSONAPIXtreamChannel[] } => {
    const camelInput = camelCaseKeys(input);

    return {
      data: camelInput.map((channel) => {
        const {
          added,
          num,
          streamId,
          streamType,
          categoryId,
          categoryIds,
          streamIcon,
          epgChannelId,
          tvArchive,
          ...cced
        } = channel;

        return {
          type: 'channel',
          id: streamId.toString(),
          attributes: {
            number: num,
            ...cced,
            tvArchive: tvArchive === 1,
            logo: streamIcon,
            epgId: epgChannelId,
            createdAt: new Date(Number(added) * 1000),
          },
          ...(categoryIds.length > 0 && {
            relationships: {
              categories: {
                data: categoryIds.map((id) => ({
                  type: 'channel-category',
                  id: id.toString(),
                })),
              },
            },
          }),
        };
      }),
    };
  },

  movies: (input): { data: JSONAPIXtreamMovieListing[] } => {
    const camelInput = camelCaseKeys(input);

    return {
      data: camelInput.map((movie) => {
        const {
          num,
          streamType,
          streamIcon,
          streamId,
          releaseDate,
          rating,
          rating5Based,
          added,
          categoryIds,
          categoryId,
          episodeRunTime,
          genre,
          cast,
          director,
          youtubeTrailer,
          ...cced
        } = movie;

        return {
          type: 'movie',
          id: streamId.toString(),
          attributes: {
            ...cced,
            genre: genre.split(',').map((x) => x.trim()),
            cast: cast.split(',').map((x) => x.trim()),
            director: director.split(',').map((x) => x.trim()),
            poster: streamIcon,
            voteAverage: Number(rating),
            duration: Number(episodeRunTime) * 60,
            youtubeId: youtubeTrailer,
            releaseDate: new Date(releaseDate),
            createdAt: new Date(Number(added) * 1000),
          },
          ...(categoryIds.length > 0 && {
            relationships: {
              categories: {
                data: categoryIds.map((id) => ({
                  type: 'movie-category',
                  id: id.toString(),
                })),
              },
            },
          }),
        };
      }),
    };
  },

  movie: (input): { data: JSONAPIXtreamMovie } => {
    const camelInput = camelCaseKeys(input, { deep: true });

    const {
      director,
      actors,
      genre,
      cast,
      oName,
      releaseDate,
      releasedate,
      mpaaRating,
      age,
      rating,
      duration,
      durationSecs,
      coverBig,
      movieImage,
      backdropPath,
      ratingCountKinopoisk,
      episodeRunTime,
      youtubeTrailer,
      tmdbId,
      ...restInfo
    } = camelInput.info;
    const { categoryId, categoryIds, streamId, added, ...restData } = camelInput.movieData;

    return {
      data: {
        type: 'movie',
        id: streamId.toString(),
        attributes: {
          ...restData,
          ...restInfo,
          informationUrl: restInfo.kinopoiskUrl,
          originalName: oName,
          cover: coverBig,
          poster: movieImage,
          duration: durationSecs,
          durationFormatted: duration,
          voteAverage: rating,
          director: director.split(',').map((x) => x.trim()),
          actors: actors.split(',').map((x) => x.trim()),
          cast: cast.split(',').map((x) => x.trim()),
          genre: genre.split(',').map((x) => x.trim()),
          youtubeId: youtubeTrailer,
          tmdbId: tmdbId?.toString(),
          rating: {
            mpaa: mpaaRating,
            age: Number(age),
          },
          releaseDate: new Date(releaseDate),
          createdAt: new Date(Number(added) * 1000),
        },
        ...(categoryIds.length > 0 && {
          relationships: {
            categories: {
              data: categoryIds.map((id) => ({
                type: 'movie-category',
                id: id.toString(),
              })),
            },
          },
        }),
      },
    };
  },

  shows: (input): { data: JSONAPIXtreamShow[] } => {
    const camelInput = camelCaseKeys(input);

    return {
      data: camelInput.map((show) => {
        const {
          num,
          streamType,
          rating,
          rating5Based,
          seriesId,
          cover,
          categoryId,
          categoryIds,
          backdropPath,
          releaseDate,
          episodeRunTime,
          lastModified,
          cast,
          director,
          genre,
          youtubeTrailer,
          ...restShow
        } = show;

        return {
          type: 'show',
          id: seriesId.toString(),
          attributes: {
            ...restShow,
            cast: cast.split(',').map((x) => x.trim()),
            director: director.split(',').map((x) => x.trim()),
            genre: genre.split(',').map((x) => x.trim()),
            voteAverage: Number(rating),
            poster: cover,
            cover: backdropPath[0],
            duration: Number(episodeRunTime) * 60,
            youtubeId: youtubeTrailer,
            releaseDate: new Date(releaseDate),
            updatedAt: new Date(Number(lastModified) * 1000),
          },
          ...(categoryIds.length > 0 && {
            relationships: {
              categories: {
                data: categoryIds.map((id) => ({
                  type: 'show-category',
                  id: id.toString(),
                })),
              },
            },
          }),
        };
      }),
    };
  },

  show: (
    input,
  ): {
    data: JSONAPIXtreamShow;
    included: (JSONAPIXtreamSeason | JSONAPIXtreamEpisode)[];
  } => {
    const { seasons, info, episodes } = camelCaseKeys(input, {
      deep: true,
    });

    const {
      rating,
      rating5Based,
      seriesId,
      cover,
      categoryId,
      categoryIds,
      backdropPath,
      releaseDate,
      episodeRunTime,
      lastModified,
      cast,
      director,
      genre,
      youtubeTrailer,
      ...restShowInfo
    } = info;

    const flatEpisodes = Object.values(episodes).flat();

    const episodesAsJSONAPI: JSONAPIXtreamEpisode[] = flatEpisodes.map((episode) => {
      const { id, season, episodeNum, added, info, ...restEpisode } = episode;

      const { releaseDate, rating, movieImage, coverBig, durationSecs, duration, tmdbId, ...restEpisodeInfo } = info;

      const seasonId = seasons.find((x) => x.seasonNumber === season)?.id.toString() || season.toString();

      return {
        type: 'episode',
        id,
        attributes: {
          number: Number(episodeNum),
          ...restEpisode,
          ...restEpisodeInfo,
          tmdbId: tmdbId?.toString(),
          poster: movieImage,
          cover: coverBig,
          voteAverage: Number(rating),
          duration: durationSecs,
          durationFormatted: duration,
          releaseDate: new Date(releaseDate),
          createdAt: new Date(Number(added) * 1000),
        },
        relationships: {
          season: {
            data: { type: 'season', id: seasonId },
          },

          show: {
            data: { type: 'show', id: seriesId.toString() },
          },
        },
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
          episodeCount: episodes[season].length,
          overview: '',
          airDate: firstEpisode.info.releaseDate,
          cover: firstEpisode.info.movieImage,
          seasonNumber: Number(seasonNumber),
          voteAverage: Number(firstEpisode.info.rating),
          coverBig: firstEpisode.info.movieImage,
          releaseDate: firstEpisode.info.releaseDate,
        };
      });
    }

    const seasonsAsJSONAPI: JSONAPIXtreamSeason[] = seasonsToMap.map((season) => {
      const { id, seasonNumber, cover, coverBig, airDate, ...restSeason } = season;

      return {
        type: 'season',
        id: id.toString(),
        attributes: {
          ...restSeason,
          releaseDate: new Date(airDate),
          number: seasonNumber,
          cover: coverBig,
        },
        relationships: {
          show: {
            data: { type: 'show', id: seriesId.toString() },
          },
          episodes: {
            data: flatEpisodes
              .filter((episode) => episode.season === seasonNumber)
              .map((episode) => ({
                type: 'episode',
                id: episode.id.toString(),
              })),
          },
        },
      };
    });

    return {
      data: {
        type: 'show',
        id: info.seriesId.toString(),
        attributes: {
          ...restShowInfo,
          voteAverage: Number(rating),
          poster: cover,
          cover: backdropPath[0],
          duration: Number(episodeRunTime) * 60,
          cast: cast.split(',').map((x) => x.trim()),
          director: director.split(',').map((x) => x.trim()),
          genre: genre.split(',').map((x) => x.trim()),
          youtubeId: youtubeTrailer,
          releaseDate: new Date(releaseDate),
          updatedAt: new Date(Number(lastModified) * 1000),
        },
        relationships: {
          categories: {
            data: categoryIds.map((id) => ({
              type: 'show-category',
              id: id.toString(),
            })),
          },
          seasons: {
            data: seasonsToMap.map((season) => ({
              type: 'season',
              id: season.id.toString(),
            })),
          },
          episodes: {
            data: flatEpisodes.map((episode) => ({
              type: 'episode',
              id: episode.id.toString(),
            })),
          },
        },
      },
      included: [...seasonsAsJSONAPI, ...episodesAsJSONAPI],
    };
  },

  shortEPG: (input): { data: JSONAPIXtreamShortEPGListing[] } => {
    const { epgListings } = camelCaseKeys(input, { deep: true });

    return {
      data: epgListings.map((listing) => {
        const {
          id,
          channelId,
          lang,
          startTimestamp,
          stopTimestamp,
          stop,
          start,
          end,
          title,
          description,
          ...restListing
        } = listing;

        return {
          type: 'epg-listing',
          id: id.toString(),
          attributes: {
            ...restListing,
            start: new Date(start),
            end: new Date(Number(end) * 1000),
            title: atob(title),
            description: atob(description),
            language: lang,
          },
          relationships: {
            channel: {
              data: {
                type: 'channel',
                id: channelId.toString(),
              },
            },
          },
        };
      }),
    };
  },

  fullEPG: (input): { data: JSONAPIXtreamFullEPGListing[] } => {
    const { epgListings } = camelCaseKeys(input, { deep: true });

    return {
      data: epgListings.map((listing) => {
        const {
          id,
          channelId,
          startTimestamp,
          stopTimestamp,
          start,
          end,
          title,
          description,
          nowPlaying,
          hasArchive,
          lang,
          ...restListing
        } = listing;

        return {
          type: 'epg-listing',
          id: id.toString(),
          attributes: {
            ...restListing,
            start: new Date(start),
            end: new Date(end),
            title: atob(title),
            description: atob(description),
            language: lang,
            nowPlaying: Boolean(nowPlaying),
            hasArchive: Boolean(hasArchive),
          },
          relationships: {
            channel: {
              data: {
                type: 'channel',
                id: channelId.toString(),
              },
            },
          },
        };
      }),
    };
  },
});

function categoryMapper(
  input: XtreamCategory[],
  type: JSONAPIXtreamCategory['type'],
): { data: JSONAPIXtreamCategory[] } {
  const camelInput = camelCaseKeys(input);

  return {
    data: camelInput.map((category) => {
      const { categoryId, categoryName, parentId } = category;

      return {
        type,
        id: categoryId.toString(),
        attributes: {
          name: categoryName,
        },
        ...(parentId && {
          relationships: {
            parent: {
              data: {
                type,
                id: parentId.toString(),
              },
            },
          },
        }),
      };
    }),
  };
}

/**
 * JSON:API Xtream profile information
 *
 * This type represents the complete user profile information in JSON:API format
 */
export type JSONAPIXtreamProfile = {
  /** The resource type (user-profile) */
  type: 'user-profile';
  /** The unique identifier for the profile (username) */
  id: string;
  /** The user profile attributes */
  attributes: {
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
};

/**
 * JSON:API Xtream server information
 *
 * This type represents the server-specific information in JSON:API format
 */
export type JSONAPIXtreamServerInfo = {
  /** The resource type (server-info) */
  type: 'server-info';
  /** The unique identifier for the server (URL) */
  id: string;
  /** The server information attributes */
  attributes: {
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
  };
};

/**
 * JSON:API Xtream category information
 *
 * This type represents a content category in the Xtream system in JSON:API format
 */
export type JSONAPIXtreamCategory = {
  /** The resource type (channel-category, movie-category, or show-category) */
  type: 'channel-category' | 'movie-category' | 'show-category';
  /** The unique identifier for the category */
  id: string;
  /** The category attributes */
  attributes: {
    /** The display name of the category */
    name: string;
  };
  /** The category relationships */
  relationships?: {
    /** The parent category relationship if applicable */
    parent?: {
      data: {
        /** The parent category type */
        type: 'channel-category' | 'movie-category' | 'show-category';
        /** The ID of the parent category */
        id: string;
      };
    };
  };
};

/**
 * JSON:API Xtream channel information
 *
 * This type represents a live TV channel in the Xtream system in JSON:API format
 */
export type JSONAPIXtreamChannel = {
  /** The resource type (channel) */
  type: 'channel';
  /** The unique identifier for the channel */
  id: string;
  /** The channel attributes */
  attributes: {
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
    /** The date when the channel was added to the system */
    createdAt: Date;
  };
  /** The channel relationships */
  relationships?: {
    /** The categories relationship if applicable */
    categories?: {
      data: {
        /** The category type */
        type: 'channel-category';
        /** The category ID */
        id: string;
      }[];
    };
  };
};

/**
 * JSON:API Xtream movie listing
 *
 * This type represents a movie in the Xtream system in JSON:API format
 */
export type JSONAPIXtreamMovieListing = {
  /** The resource type (movie) */
  type: 'movie';
  /** The unique identifier for the movie */
  id: string;
  /** The movie attributes */
  attributes: {
    /** The title of the movie */
    name: string;
    /** The synopsis/description of the movie */
    plot: string;
    /** The movie's rating */
    voteAverage: number;
    /** The URL for the movie's poster */
    poster: string;
    /** The release date of the movie */
    releaseDate: Date;
    /** The runtime of the movie in seconds */
    duration: number;
    /** The cast of the movie as an array */
    cast: string[];
    /** The director(s) of the movie as an array */
    director: string[];
    /** The youtube id of the trailer */
    youtubeId: string;
    /** The genres of the movie as an array */
    genre: string[];
    /** The date when the movie was added to the system */
    createdAt: Date;
  };
  /** The movie relationships */
  relationships?: {
    /** The categories relationship if applicable */
    categories?: {
      data: {
        /** The category type */
        type: 'movie-category';
        /** The category ID */
        id: string;
      }[];
    };
  };
};

/**
 * JSON:API Xtream movie information
 */
export type JSONAPIXtreamMovie = {
  type: 'movie';
  /** The unique identifier for the stream */
  id: string;
  attributes: {
    /** The URL to the movie's tmdb/imdb etc page */
    informationUrl: string;
    /** The ID of the movie in The Movie Database (TMDB) */
    tmdbId: string;
    /** The title of the movie */
    name: string;
    /** The original title of the movie */
    originalName: string;
    /** The URL for the movie's cover image */
    cover: string;
    /** The URL for the movie's image */
    poster: string;
    /** The release date of the movie */
    releaseDate: Date;
    /** The YouTube ID or URL for the trailer */
    youtubeId: string;
    /** The director(s) of the movie */
    director: string[];
    /** The actors in the movie */
    actors: string[];
    /** The cast of the movie */
    cast: string[];
    /** The synopsis/description of the movie */
    description: string;
    /** The plot of the movie */
    plot: string;
    /** The age abd MPAA rating of the movie */
    rating: {
      age: number;
      mpaa: string;
    };
    /** The country of origin for the movie */
    country: string;
    /** The genre(s) of the movie */
    genre: string[];
    /** The duration of the movie in seconds */
    duration: number;
    /** The formatted duration of the movie */
    durationFormatted: string;
    /** The bitrate of the movie */
    bitrate: number;
    /** Array of available subtitles */
    subtitles: string[];
    /** The rating of the movie */
    voteAverage: number;
    /** The date when the movie was added to the system */
    createdAt: Date;
    /** The file format extension */
    containerExtension: string;
    /** Custom stream identifier */
    customSid: string;
    /** The direct URL to the movie's source */
    directSource: string;
  };
  /** The movie relationships */
  relationships?: {
    /** The categories relationship if applicable */
    categories?: {
      data: {
        /** The category type */
        type: 'movie-category';
        /** The category ID */
        id: string;
      }[];
    };
  };
};

/**
 * JSON:API Xtream show information
 *
 * This type represents a show in the Xtream system in JSON:API format
 */
export type JSONAPIXtreamShow = {
  /** The resource type (show) */
  type: 'show';
  /** The unique identifier for the show */
  id: string;
  /** The show attributes */
  attributes: {
    /** The title of the show */
    name: string;
    /** The synopsis/description of the show */
    plot: string;
    /** The show's rating */
    voteAverage: number;
    /** The URL for the show's poster image */
    poster: string;
    /** The URL for the show's cover image */
    cover: string;
    /** The release date of the show */
    releaseDate: Date;
    /** The average runtime of episodes in seconds */
    duration: number;
    /** The cast members of the show as an array */
    cast: string[];
    /** The director(s) of the show as an array */
    director: string[];
    /** The genre(s) of the show as an array */
    genre: string[];
    /** Youtube ID of trailer */
    youtubeId: string;
    /** The date when the show was last updated */
    updatedAt: Date;
  };
  /** The show relationships */
  relationships?: {
    /** The categories relationship if applicable */
    categories?: {
      data: {
        /** The category type */
        type: 'show-category';
        /** The category ID */
        id: string;
      }[];
    };
    /** The seasons relationship if applicable */
    seasons?: {
      data: {
        /** The season type */
        type: 'season';
        /** The season ID */
        id: string;
      }[];
    };
    /** The episodes relationship if applicable */
    episodes?: {
      data: {
        /** The episode type */
        type: 'episode';
        /** The episode ID */
        id: string;
      }[];
    };
  };
};

/**
 * JSON:API Xtream episode information
 *
 * This type represents an episode in a show in the Xtream system in JSON:API format
 */
export type JSONAPIXtreamEpisode = {
  /** The resource type (episode) */
  type: 'episode';
  /** The unique identifier for the episode */
  id: string;
  /** The episode attributes */
  attributes: {
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
  };
  /** The episode relationships */
  relationships: {
    /** The season relationship */
    season?: {
      data: {
        /** The season type */
        type: 'season';
        /** The season ID */
        id: string;
      };
    };
    /** The show relationship */
    show: {
      data: {
        /** The show type */
        type: 'show';
        /** The show ID */
        id: string;
      };
    };
  };
};

/**
 * JSON:API Xtream season information
 *
 * This type represents a season of a show in the Xtream system in JSON:API format
 */
export type JSONAPIXtreamSeason = {
  /** The resource type (season) */
  type: 'season';
  /** The unique identifier for the season */
  id: string;
  /** The season attributes */
  attributes: {
    /** The season number */
    number: number;
    /** The URL for the season's cover image */
    cover: string;
    /** The date when the season first aired */
    releaseDate: Date;
  };
  /** The season relationships */
  relationships: {
    /** The show relationship */
    show: {
      data: {
        /** The show type */
        type: 'show';
        /** The show ID */
        id: string;
      };
    };
  };
};

/**
 * JSON:API Xtream short EPG listing information
 *
 * This type represents a short EPG listing for a channel in JSON:API format
 */
export type JSONAPIXtreamShortEPGListing = {
  /** The resource type (epg-listing) */
  type: 'epg-listing';
  /** The unique identifier for the listing */
  id: string;
  /** The EPG listing attributes */
  attributes: {
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
  };
  /** The EPG listing relationships */
  relationships: {
    /** The channel relationship */
    channel: {
      data: {
        /** The channel type */
        type: 'channel';
        /** The channel ID */
        id: string;
      };
    };
  };
};

/**
 * JSON:API Xtream full EPG listing information
 *
 * This type represents a full EPG listing for a channel in JSON:API format with additional information
 */
export type JSONAPIXtreamFullEPGListing = {
  /** The resource type (epg-listing) */
  type: 'epg-listing';
  /** The unique identifier for the listing */
  id: string;
  /** The EPG listing attributes */
  attributes: {
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
    /** Flag indicating if the listing is currently playing */
    nowPlaying: boolean;
    /** Flag indicating if the listing has an archive available */
    hasArchive: boolean;
  };
  /** The EPG listing relationships */
  relationships: {
    /** The channel relationship */
    channel: {
      data: {
        /** The channel type */
        type: 'channel';
        /** The channel ID */
        id: string;
      };
    };
  };
};
