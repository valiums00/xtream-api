import camelCaseKeys from 'camelcase-keys';
import { defineSerializers, XtreamCategory } from '../main.ts';

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

  TVShowCategories: (input): { data: JSONAPIXtreamCategory[] } => {
    return categoryMapper(input, 'tv-show-category');
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
          isAdult,
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
            isAdult: isAdult === 1,
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

  movies: (input): { data: JSONAPIXtreamMovie[] } => {
    const camelInput = camelCaseKeys(input);

    return {
      data: camelInput.map((movie) => {
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
          type: 'movie',
          id: streamId.toString(),
          attributes: {
            ...cced,
            genre: genre.split(',').map((x) => x.trim()),
            cast: cast.split(',').map((x) => x.trim()),
            director: director.split(',').map((x) => x.trim()),
            poster: streamIcon,
            isAdult: isAdult === 1,
            runtime: Number(episodeRunTime),
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

  TVShows: (input): { data: JSONAPIXtreamTVShow[] } => {
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
          type: 'tv-show',
          id: seriesId.toString(),
          attributes: {
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
          },
          ...(categoryIds.length > 0 && {
            relationships: {
              categories: {
                data: categoryIds.map((id) => ({
                  type: 'tv-show-category',
                  id: id.toString(),
                })),
              },
            },
          }),
        };
      }),
    };
  },

  TVShow: (
    input,
  ): {
    data: JSONAPIXtreamTVShow;
    included: (JSONAPIXtreamSeason | JSONAPIXtreamEpisode)[];
  } => {
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

    const episodesAsJSONAPI: JSONAPIXtreamEpisode[] = flatEpisodes.map((episode) => {
      const { id, season, episodeNum, added, info, ...restEpisode } = episode;

      const { releaseDate, movieImage, coverBig, durationSecs, duration, tmdbId, ...restEpisodeInfo } = info;

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
          duration: durationSecs,
          durationFormatted: duration,
          releaseDate: new Date(releaseDate),
          createdAt: new Date(Number(added) * 1000),
        },
        relationships: {
          season: {
            data: { type: 'season', id: seasons[season - 1].id.toString() },
          },
          tvShow: {
            data: { type: 'tv-show', id: seriesId.toString() },
          },
        },
      };
    });

    const seasonsAsJSONAPI: JSONAPIXtreamSeason[] = seasons.map((season) => {
      const { id, seasonNumber, cover, coverBig, coverTmdb, airDate, ...restSeason } = season;

      return {
        type: 'season',
        id: id.toString(),
        attributes: {
          ...restSeason,
          releaseDate: new Date(airDate),
          number: seasonNumber,
          cover: coverBig || coverTmdb,
        },
        relationships: {
          tvShow: {
            data: { type: 'tv-show', id: seriesId.toString() },
          },
        },
      };
    });

    return {
      data: {
        type: 'tv-show',
        id: info.seriesId.toString(),
        attributes: {
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
        },
        relationships: {
          categories: {
            data: categoryIds.map((id) => ({
              type: 'tv-show-category',
              id: id.toString(),
            })),
          },
          seasons: {
            data: seasons.map((season) => ({
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
    /** Server process status */
    process: boolean;
  };
};

/**
 * JSON:API Xtream category information
 *
 * This type represents a content category in the Xtream system in JSON:API format
 */
export type JSONAPIXtreamCategory = {
  /** The resource type (channel-category, movie-category, or tv-show-category) */
  type: 'channel-category' | 'movie-category' | 'tv-show-category';
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
        type: 'channel-category' | 'movie-category' | 'tv-show-category';
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
    /** Flag indicating if the content is for adults */
    isAdult: boolean;
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
 * JSON:API Xtream movie information
 *
 * This type represents a movie in the Xtream system in JSON:API format
 */
export type JSONAPIXtreamMovie = {
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
 * JSON:API Xtream TV show information
 *
 * This type represents a TV show in the Xtream system in JSON:API format
 */
export type JSONAPIXtreamTVShow = {
  /** The resource type (tv-show) */
  type: 'tv-show';
  /** The unique identifier for the TV show */
  id: string;
  /** The TV show attributes */
  attributes: {
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
  };
  /** The TV show relationships */
  relationships?: {
    /** The categories relationship if applicable */
    categories?: {
      data: {
        /** The category type */
        type: 'tv-show-category';
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
 * This type represents an episode in a TV show in the Xtream system in JSON:API format
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
    season: {
      data: {
        /** The season type */
        type: 'season';
        /** The season ID */
        id: string;
      };
    };
    /** The TV show relationship */
    tvShow: {
      data: {
        /** The TV show type */
        type: 'tv-show';
        /** The TV show ID */
        id: string;
      };
    };
  };
};

/**
 * JSON:API Xtream season information
 *
 * This type represents a season of a TV show in the Xtream system in JSON:API format
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
    /** The TV show relationship */
    tvShow: {
      data: {
        /** The TV show type */
        type: 'tv-show';
        /** The TV show ID */
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
