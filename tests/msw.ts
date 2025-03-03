import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import fullEpg from './epg-response.ts';

const profile = {
  username: 'testuser',
  password: 'testpass',
  message: 'Welcome to IPTV Service',
  auth: 1,
  status: 'Active',
  exp_date: '1767542400',
  is_trial: '0',
  active_cons: 0,
  created_at: '1735084800',
  max_connections: '5',
  allowed_output_formats: ['m3u8', 'ts', 'rtmp'],
};

const serverInfo = {
  xui: true,
  version: '1.5.13',
  revision: null,
  url: 'api.example-iptv.com',
  port: '2052',
  https_port: '443',
  server_protocol: 'https',
  rtmp_port: '8880',
  timestamp_now: 1740599153,
  time_now: '2025-02-26 19:45:53',
  timezone: 'UTC',
};

const channels = [
  {
    num: 1,
    name: 'News 24/7',
    stream_type: 'live',
    stream_id: 1,
    stream_icon: 'https://example-iptv.com/images/news24.png',
    epg_channel_id: 'C679.262.ersatztv.org',
    added: '1735884153',
    custom_sid: '',
    tv_archive: 0,
    direct_source: '',
    tv_archive_duration: 0,
    category_id: '1',
    category_ids: [1],
    thumbnail: '',
  },
  {
    num: 2,
    name: 'Sports HD',
    stream_type: 'live',
    stream_id: 2,
    stream_icon: 'https://example-iptv.com/images/sports-hd.png',
    epg_channel_id: 'C679.263.ersatztv.org',
    added: '1735884153',
    custom_sid: '',
    tv_archive: 0,
    direct_source: '',
    tv_archive_duration: 0,
    category_id: '1',
    category_ids: [1],
    thumbnail: '',
  },
  {
    num: 3,
    name: 'Entertainment',
    stream_type: 'live',
    stream_id: 3,
    stream_icon: 'https://example-iptv.com/images/entertainment.png',
    epg_channel_id: 'C679.264.ersatztv.org',
    added: '1735884153',
    custom_sid: '',
    tv_archive: 0,
    direct_source: '',
    tv_archive_duration: 0,
    category_id: '1',
    category_ids: [1],
    thumbnail: '',
  },
  {
    num: 4,
    name: 'Documentaries',
    stream_type: 'live',
    stream_id: 4,
    stream_icon: 'https://example-iptv.com/images/documentaries.png',
    epg_channel_id: 'C679.265.ersatztv.org',
    added: '1735884153',
    custom_sid: '',
    tv_archive: 0,
    direct_source: '',
    tv_archive_duration: 0,
    category_id: '2',
    category_ids: [2],
    thumbnail: '',
  },
];

const categories = [
  { category_id: '1', category_name: 'Sports', parent_id: 0 },
  { category_id: '2', category_name: 'News', parent_id: 0 },
  { category_id: '3', category_name: 'Entertainment', parent_id: 0 },
  { category_id: '4', category_name: 'Documentaries', parent_id: 0 },
  { category_id: '5', category_name: 'Football', parent_id: 1 },
];

const movies = [
  {
    num: 1,
    name: 'Summer Adventure (2024)',
    title: 'Summer Adventure',
    year: '2024',
    stream_type: 'movie',
    stream_id: 935703,
    stream_icon: 'https://example-iptv.com/images/summer-adventure.jpg',
    rating: 5.5,
    rating_5based: 2.8,
    added: '1740562532',
    plot: 'Four friends embark on an unforgettable journey across the coast during their last summer together before college.',
    cast: 'John Smith, Emily Johnson, Michael Brown, Sarah Davis',
    director: 'Robert Wilson',
    genre: 'Adventure, Comedy, Drama',
    release_date: '2024-06-15',
    youtube_trailer: 'k2qgYK1CrkQ',
    episode_run_time: 109,
    category_id: '1',
    category_ids: [1],
    container_extension: 'mp4',
    custom_sid: '',
    direct_source: '',
  },
  {
    num: 2,
    name: 'The Last Stand (2023)',
    title: 'The Last Stand',
    year: '2023',
    stream_type: 'movie',
    stream_id: 935704,
    stream_icon: 'https://example-iptv.com/images/the-last-stand.jpg',
    rating: 7.5,
    rating_5based: 3.8,
    added: '1740562532',
    plot: 'A retired sheriff and his team must protect their town from a ruthless cartel leader and his gang.',
    cast: 'Robert Johnson, Sarah Adams, Michael Brown, Emily Davis',
    director: 'James Wilson',
    genre: 'Action, Crime, Thriller',
    release_date: '2023-08-22',
    youtube_trailer: 'k2qgYK1CrkQ',
    episode_run_time: 118,
    category_id: '2',
    category_ids: [2],
    container_extension: 'mp4',
    custom_sid: '',
    direct_source: '',
  },
];

const tvShows = [
  {
    num: 1,
    name: 'Medical Heroes (2022)',
    title: 'Medical Heroes',
    year: '2022',
    stream_type: 'series',
    series_id: 15120,
    cover: 'https://example-iptv.com/images/medical-heroes-cover.jpg',
    plot: 'Follow the lives of dedicated medical professionals as they face challenging cases and personal dilemmas in a busy metropolitan hospital.',
    cast: 'Jennifer Adams, Richard Carter, Samantha Wright',
    director: '',
    genre: 'Drama, Medical',
    release_date: '2022-03-15',
    releaseDate: '2022-03-15',
    last_modified: '1740596715',
    rating: '7',
    rating_5based: 3.5,
    backdrop_path: ['https://example-iptv.com/images/medical-heroes-backdrop.jpg'],
    youtube_trailer: '',
    episode_run_time: '88',
    category_id: '1',
    category_ids: [1],
  },
  {
    num: 2,
    name: 'Small Town Stories (2025)',
    title: 'Small Town Stories',
    year: '2025',
    stream_type: 'series',
    series_id: 16083,
    cover: 'https://example-iptv.com/images/small-town-main.jpg',
    plot: "A heartwarming drama that follows the interconnected lives of residents in a close-knit small town as they navigate life's joys and challenges together. Each episode brings new revelations about the town's history and its inhabitants.",
    cast: 'Elizabeth Parker, Michael Reynolds, Susan Thompson, Robert Anderson, Laura Martinez',
    director: '',
    genre: 'Drama, Family',
    release_date: '2025-02-24',
    releaseDate: '2025-02-24',
    last_modified: '1740591320',
    rating: '0',
    rating_5based: 0,
    backdrop_path: ['https://example-iptv.com/images/small-town-backdrop.jpg'],
    youtube_trailer: '',
    episode_run_time: '37',
    category_id: '2',
    category_ids: [2],
  },
];

const tvShow = {
  seasons: [
    {
      air_date: '2025-02-17',
      episode_count: 5,
      id: 442962,
      name: 'Specials',
      overview: '',
      season_number: 0,
      vote_average: 0,
      cover: 'https://example-iptv.com/images/small-town-specials.jpg',
      cover_big: 'https://example-iptv.com/images/small-town-specials-large.jpg',
    },
    {
      air_date: '2025-02-24',
      episode_count: 15,
      id: 382546,
      name: 'Season 1',
      overview: '',
      season_number: 1,
      vote_average: 10,
      cover: 'https://example-iptv.com/images/small-town-s1.jpg',
      cover_big: 'https://example-iptv.com/images/small-town-s1-large.jpg',
    },
  ],
  info: {
    name: 'Small Town Stories (2025)',
    title: 'Small Town Stories',
    year: '2025',
    cover: 'https://example-iptv.com/images/small-town-main.jpg',
    plot: "A heartwarming drama that follows the interconnected lives of residents in a close-knit small town as they navigate life's joys and challenges together. Each episode brings new revelations about the town's history and its inhabitants.",
    cast: 'Elizabeth Parker, Michael Reynolds, Susan Thompson, Robert Anderson, Laura Martinez',
    director: '',
    genre: 'Drama, Family',
    release_date: '2025-02-24',
    releaseDate: '2025-02-24',
    last_modified: '1740591320',
    rating: '0',
    rating_5based: 0,
    backdrop_path: ['https://example-iptv.com/images/small-town-backdrop.jpg'],
    youtube_trailer: '',
    episode_run_time: '37',
    category_id: '2',
    category_ids: [2],
    series_id: 16083,
  },
  episodes: {
    '1': [
      {
        id: '935666',
        episode_num: '1',
        title: 'Small Town Stories - S01E01 - Monday, February 24, 2025',
        container_extension: 'mp4',
        info: {
          tmdb_id: 5197445,
          release_date: '2025-02-24',
          plot: 'The series premiere introduces the picturesque town of Riverside and its colorful residents as they prepare for the annual Founders Day celebration.',
          duration_secs: 2214,
          duration: '00:36:54',
          movie_image: 'https://example-iptv.com/images/small-town-s01e01.jpg',
          bitrate: 5244,
          rating: 10,
          season: 1,
          cover_big: 'https://example-iptv.com/images/small-town-s01e01-large.jpg',
        },
        subtitles: [],
        custom_sid: '',
        added: '1740503721',
        season: 1,
        direct_source: '',
      },
      {
        id: '935727',
        episode_num: '2',
        title: 'Small Town Stories - S01E02 - Tuesday, February 25, 2025',
        container_extension: 'mp4',
        info: {
          tmdb_id: 5750693,
          release_date: '2025-02-25',
          plot: 'Long-buried family secrets come to light during the renovation of an old building in the town square, causing tension among several families.',
          duration_secs: 2209,
          duration: '00:36:49',
          movie_image: 'https://example-iptv.com/images/small-town-s01e02.jpg',
          bitrate: 5245,
          rating: 10,
          season: 1,
          cover_big: 'https://example-iptv.com/images/small-town-s01e02-large.jpg',
        },
        subtitles: [],
        custom_sid: '',
        added: '1740591320',
        season: 1,
        direct_source: '',
      },
    ],
  },
};

const seriesNotFound = {
  seasons: [],
  info: {
    name: null,
    title: null,
    year: null,
    cover: null,
    plot: null,
    cast: null,
    director: null,
    genre: null,
    release_date: null,
    releaseDate: null,
    last_modified: null,
    rating: '0',
    rating_5based: 0,
    backdrop_path: null,
    youtube_trailer: null,
    episode_run_time: null,
    category_id: '',
    category_ids: null,
  },
};

const shortEpg = {
  epg_listings: [
    {
      id: '17528639',
      epg_id: '63',
      title: 'ZmFrZSBwcm9ncmFtbWU=',
      lang: '',
      start: '2025-03-03 13:57:02',
      end: '1741012393',
      description: 'ZmFrZSBkZXNjcmlwdGlvbg==',
      channel_id: 'C679.262.ersatztv.org',
      start_timestamp: '1741010222',
      stop_timestamp: '1741012393',
      stop: '2025-03-03 14:33:13',
    },
    {
      id: '17528640',
      epg_id: '63',
      title: 'ZmFrZSBwcm9ncmFtbWU=',
      lang: '',
      start: '2025-03-03 14:33:13',
      end: '1741014359',
      description: 'ZmFrZSBkZXNjcmlwdGlvbg==',
      channel_id: 'C679.262.ersatztv.org',
      start_timestamp: '1741012393',
      stop_timestamp: '1741014359',
      stop: '2025-03-03 15:05:59',
    },
    {
      id: '17528641',
      epg_id: '63',
      title: 'ZmFrZSBwcm9ncmFtbWU=',
      lang: '',
      start: '2025-03-03 15:05:59',
      end: '1741018869',
      description: 'ZmFrZSBkZXNjcmlwdGlvbg==',
      channel_id: 'C679.262.ersatztv.org',
      start_timestamp: '1741014359',
      stop_timestamp: '1741018869',
      stop: '2025-03-03 16:21:09',
    },
    {
      id: '17528642',
      epg_id: '63',
      title: 'ZmFrZSBwcm9ncmFtbWU=',
      lang: '',
      start: '2025-03-03 16:21:09',
      end: '1741021172',
      description: 'ZmFrZSBkZXNjcmlwdGlvbg==',
      channel_id: 'C679.262.ersatztv.org',
      start_timestamp: '1741018869',
      stop_timestamp: '1741021172',
      stop: '2025-03-03 16:59:32',
    },
  ],
};

export const restHandlers = [
  http.get('http://example.com/player_api.php', ({ request }) => {
    const params = new URL(request.url).searchParams;

    const username = params.get('username');
    const categoryId = params.get('category_id');

    if (username === 'error') {
      return new HttpResponse(null, { status: 404 });
    }

    switch (params.get('action')) {
      case 'get_live_categories':
      case 'get_vod_categories':
      case 'get_series_categories':
        return HttpResponse.json(categories);
      case 'get_live_streams':
        const filteredChannels = channels.filter((channel) => {
          if (!categoryId) {
            return true;
          }

          return channel.category_ids.some((id) => id === Number(categoryId));
        });
        return HttpResponse.json(filteredChannels);
      case 'get_vod_streams':
        const filteredMovies = movies.filter((movie) => {
          if (!categoryId) {
            return true;
          }

          return movie.category_ids.some((id) => id === Number(categoryId));
        });
        return HttpResponse.json(filteredMovies);
      case 'get_series':
        const filteredSeries = tvShows.filter((show) => {
          if (!categoryId) {
            return true;
          }

          return show.category_ids.some((id) => id === Number(categoryId));
        });
        return HttpResponse.json(filteredSeries);
      case 'get_series_info':
        if (params.get('series_id') === '1000') {
          return HttpResponse.json(seriesNotFound);
        }

        if (params.get('series_id') === '2000') {
          const modifiedTvShow = JSON.parse(JSON.stringify(tvShow));

          modifiedTvShow.seasons[0].cover_tmdb = modifiedTvShow.seasons[0].cover_big;

          delete modifiedTvShow.seasons[0].cover_big;

          return HttpResponse.json(modifiedTvShow);
        }

        return HttpResponse.json(tvShow);

      case 'get_short_epg':
        const limit = params.get('limit');
        const streamId = params.get('stream_id');

        if (streamId === '1000') {
          return HttpResponse.json({ epg_listings: [] });
        }

        if (limit) {
          return HttpResponse.json({ epg_listings: shortEpg.epg_listings.slice(0, Number(limit)) });
        }
        return HttpResponse.json(shortEpg);

      case 'get_simple_data_table':
        return HttpResponse.json(fullEpg);

      case 'get_profile':
      case 'get_server_info':
      default:
        return HttpResponse.json({
          user_info: profile,
          server_info: serverInfo,
        });
    }
  }),
];

const server = setupServer(...restHandlers);

export { server };
