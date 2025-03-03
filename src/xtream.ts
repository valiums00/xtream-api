import type {
  XtreamUserProfile,
  XtreamServerInfo,
  XtreamCategory,
  XtreamChannel,
  XtreamMoviesListing,
  XtreamProfile,
  XtreamShortEPG,
  XtreamFullEPG,
  XtreamMovie,
  XtreamTVShowListing,
  XtreamTVShow,
} from './types.ts';

type Serializers = {
  profile: (input: XtreamUserProfile) => any;
  serverInfo: (input: XtreamServerInfo) => any;
  channelCategories: (input: XtreamCategory[]) => any;
  movieCategories: (input: XtreamCategory[]) => any;
  TVShowCategories: (input: XtreamCategory[]) => any;
  channels: (input: XtreamChannel[]) => any;
  movies: (input: XtreamMoviesListing[]) => any;
  movie: (input: XtreamMovie) => any;
  TVShows: (input: XtreamTVShowListing[]) => any;
  TVShow: (input: XtreamTVShow) => any;
  shortEPG: (input: XtreamShortEPG) => any;
  fullEPG: (input: XtreamFullEPG) => any;
};

type CustomSerializers = Partial<Serializers>;

type Options = {
  url: string;
  username: string;
  password: string;
};

type FilterableRequest = {
  categoryId?: number | string;
  page?: number;
  limit?: number;
};

type EPGOptions = {
  channelId: number | string;
  limit?: number;
};

type TVShowOptions = {
  showId: number | string;
};

type MovieOptions = {
  movieId: number | string;
};

export class Xtream<T extends CustomSerializers = CustomSerializers> {
  // The base URL of the Xtream API
  #baseUrl: string;

  // The default serializers to use for transforming the API response
  #serializers: Serializers = {
    profile: (input) => input,
    serverInfo: (input) => input,
    channelCategories: (input) => input,
    movieCategories: (input) => input,
    TVShowCategories: (input) => input,
    channels: (input) => input,
    movies: (input) => input,
    movie: (input) => input,
    TVShows: (input) => input,
    TVShow: (input) => input,
    shortEPG: (input) => input,
    fullEPG: (input) => input,
  };

  serializerType = 'none';

  /**
   * Creates a new instance of the Xtream service
   *
   * Accepts an object with the following properties:
   * - `url`: The base URL of the Xtream API
   * - `username`: The username to authenticate with
   * - `password`: The password to authenticate with
   * - `serializers`: An object with custom mapping functions for transforming the API response
   */
  constructor(
    options: Options & {
      serializer?: ReturnType<typeof defineSerializers<T>>;
    },
  ) {
    const { url, username, password } = options;

    if (!url) {
      throw new Error('The Xtream URL is required');
    }

    if (!username || !password) {
      throw new Error('The authentication credentials are required');
    }

    this.#baseUrl =
      url.replace(/\/$/, '') + `/player_api.php?username=${username.trim()}&password=${password.trim()}&action=`;

    if (options.serializer) {
      this.serializerType = options.serializer.type;
      this.#serializers = {
        ...this.#serializers,
        ...options.serializer.serializers,
      };
    }
  }

  /**
   * Make a request to the Xtream API
   */
  async #request<R>(action: string): Promise<R> {
    const response = await fetch(`${this.#baseUrl}${action}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return await response.json();
  }

  /**
   * Gets the profile information of the user
   *
   * @returns The profile information of the user
   */
  async getProfile(): Promise<T extends { profile: (input: XtreamUserProfile) => infer R } ? R : XtreamUserProfile> {
    const profile = await this.#request<XtreamProfile>('get_profile');

    return this.#serializers.profile(profile.user_info);
  }

  /**
   * Get the server information
   *
   * @returns The server information
   */
  async getServerInfo(): Promise<
    T extends { serverInfo: (input: XtreamServerInfo) => infer R } ? R : XtreamServerInfo
  > {
    const profile = await this.#request<XtreamProfile>('get_server_info');

    return this.#serializers.serverInfo(profile.server_info);
  }

  /**
   * Gets the list of all available categories
   *
   * @returns A list of all available categories
   */
  async getChannelCategories(): Promise<
    T extends {
      channelCategories: (input: XtreamCategory[]) => infer R;
    }
      ? R
      : XtreamCategory[]
  > {
    const categories = await this.#request<XtreamCategory[]>('get_live_categories');

    return this.#serializers.channelCategories(categories);
  }

  /**
   * Gets the list of all available Movie categories
   *
   * @returns A list of all available Movie categories
   */
  async getMovieCategories(): Promise<
    T extends { movieCategories: (input: XtreamCategory[]) => infer R } ? R : XtreamCategory[]
  > {
    const categories = await this.#request<XtreamCategory[]>('get_vod_categories');

    return this.#serializers.movieCategories(categories);
  }

  /**
   * Gets the list of all available TV show categories
   *
   * @returns A list of all available TV show categories
   */
  async getTVShowCategories(): Promise<
    T extends {
      TVShowCategories: (input: XtreamCategory[]) => infer R;
    }
      ? R
      : XtreamCategory[]
  > {
    const categories = await this.#request<XtreamCategory[]>('get_series_categories');

    return this.#serializers.TVShowCategories(categories);
  }

  /**
   * Gets the list of all available channels
   *
   * @returns A list of all available channels
   */
  async getChannels({ categoryId, page, limit }: FilterableRequest = {}): Promise<
    T extends { channels: (input: XtreamChannel[]) => infer R } ? R : XtreamChannel[]
  > {
    const action = 'get_live_streams' + (categoryId ? `&category_id=${categoryId}` : '');

    const channels = await this.#request<XtreamChannel[]>(action);

    if (page && limit) {
      const start = (page - 1) * limit;
      const end = start + limit;

      return this.#serializers.channels(channels.slice(start, end));
    }

    return this.#serializers.channels(channels);
  }

  /**
   * Gets the list of all available Movies
   *
   * @returns A list of all available Movies
   */
  async getMovies({ categoryId, page, limit }: FilterableRequest = {}): Promise<
    T extends { movies: (input: XtreamMoviesListing[]) => infer R } ? R : XtreamMoviesListing[]
  > {
    const action = 'get_vod_streams' + (categoryId ? `&category_id=${categoryId}` : '');
    ('get_vod_streams');
    const movies = await this.#request<XtreamMoviesListing[]>(action);

    if (page && limit) {
      const start = (page - 1) * limit;
      const end = start + limit;

      return this.#serializers.movies(movies.slice(start, end));
    }

    return this.#serializers.movies(movies);
  }

  /**
   * Gets the information about a specific Movie
   *
   * @param MovieOptions The options for the request
   * @returns The information about the Movie
   */
  async getMovie({
    movieId,
  }: MovieOptions): Promise<T extends { movie: (input: XtreamMovie) => infer R } ? R : XtreamMovie> {
    const movie = await this.#request<XtreamMovie>('get_vod_info&vod_id=' + movieId);

    if (Array.isArray(movie.info) && movie.info.length === 0) {
      throw new Error('Movie Not Found');
    }

    return this.#serializers.movie(movie);
  }

  /**
   * Gets the list of all available TV shows
   *
   * @returns A list of all available TV shows
   */
  async getTVShows({ categoryId, page, limit }: FilterableRequest = {}): Promise<
    T extends { TVShows: (input: XtreamTVShowListing[]) => infer R } ? R : XtreamTVShowListing[]
  > {
    const action = 'get_series' + (categoryId ? `&category_id=${categoryId}` : '');
    const tvShows = await this.#request<XtreamTVShowListing[]>(action);

    if (page && limit) {
      const start = (page - 1) * limit;
      const end = start + limit;

      return this.#serializers.TVShows(tvShows.slice(start, end));
    }

    return this.#serializers.TVShows(tvShows);
  }

  /**
   * Gets the information about a specific TV show
   *
   * @param TVShowOptions The options for the request
   * @returns The information about the TV show
   */
  async getTVShow({
    showId,
  }: TVShowOptions): Promise<T extends { TVShow: (input: XtreamTVShow) => infer R } ? R : XtreamTVShow> {
    const show = await this.#request<XtreamTVShow>('get_series_info&series_id=' + showId);

    if (show.info.name === null) {
      throw new Error('TV Show Not Found');
    }

    return this.#serializers.TVShow(show);
  }

  /**
   * Gets short EPG information for a specific channel
   *
   * @param EPGOptions The options for the request
   * @returns The short EPG information for the channel
   */
  async getShortEPG({
    channelId,
    limit,
  }: EPGOptions): Promise<T extends { shortEPG: (input: XtreamShortEPG) => infer R } ? R : XtreamShortEPG> {
    const action = `get_short_epg&stream_id=${channelId}` + (limit ? `&limit=${limit}` : '');
    const epg = await this.#request<XtreamShortEPG>(action);

    return this.#serializers.shortEPG(epg);
  }

  /**
   * Gets full EPG information for a specific channel
   *
   * @param EPGOptions The options for the request
   * @returns The full EPG information for the channel
   */
  async getFullEPG({
    channelId,
  }: EPGOptions): Promise<T extends { fullEPG: (input: XtreamFullEPG) => infer R } ? R : XtreamFullEPG> {
    const action = `get_simple_data_table&stream_id=${channelId}`;
    const epg = await this.#request<XtreamFullEPG>(action);

    return this.#serializers.fullEPG(epg);
  }
}

export function defineSerializers<T extends Partial<Serializers>>(
  type: string,
  serializers: T & Record<Exclude<keyof T, keyof Serializers>, never>,
): { type: string; serializers: T } {
  return { type, serializers };
}
