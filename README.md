<div align="center">

# @iptv/xtream-api

A TypeScript library for interacting with an Xtream compatible player API.

---

[![npm](https://img.shields.io/npm/v/@iptv/xtream-api?style=flat-square)](https://www.npmjs.com/package/@iptv/xtream-api)
[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/ektotv/xtream-api/ci.yml?branch=main&style=flat-square)](https://github.com/ektotv/xtream-api/actions/workflows/ci.yml)
[![Coverage](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/evoactivity/89b5ed71e9091bdaf59adf1aa29083c7/raw/iptv_xtream-api_coverage.json&style=flat-square)](https://github.com/ektotv/xtream-api/tree/main/tests)
[![GitHub](https://img.shields.io/github/license/ektotv/xtream-api?style=flat-square)](LICENSE.md)

</div>

---

## ✨ Features

- ESM and CommonJS support
- Supports Node, deno, bun and the browser
- Standardized API responses
- Customizable serializers

---

## 📥 Installation

To install this library, use the following command:

```bash
# pnpm
pnpm add @iptv/xtream-api

# npm
npm install @iptv/xtream-api

# yarn
yarn add @iptv/xtream-api
```

## 🔧 Usage

```typescript
import { Xtream } from '@iptv/xtream-api';

const xtream = new Xtream({
  url: 'http://example.com:8080',
  username: 'username',
  password: 'password',
  preferredFormat: 'm3u8', // optional preferred format for channel URLs
});

const categories = await xtream.getChannelCategories();
console.log(categories);
/* outputs
[
  {
    category_id: 1,
    category_name: 'Category 1',
  },
  {
    category_id: 2,
    category_name: 'Category 2',
  },
]
*/
```

### 📚 API

| Method                 | Argument                                    | Description                     | Serialized                                                                                                                     |
| ---------------------- | ------------------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `getProfile`           |                                             | Get the user profile            | [Standardized](tests/snapshots/standardized/profile.json) / [JSON:API](tests/snapshots/jsonapi/profile.json)                   |
| `getServerInfo`        |                                             | Get the server information      | [Standardized](tests/snapshots/standardized/server-info.json) / [JSON:API](tests/snapshots/jsonapi/server-info.json)           |
| `getChannelCategories` |                                             | Get the channel categories      | [Standardized](tests/snapshots/standardized/categories.json) / [JSON:API](tests/snapshots/jsonapi/categories.json)             |
| `getMovieCategories`   |                                             | Get the movie categories        | [Standardized](tests/snapshots/standardized/movie-categories.json) / [JSON:API](tests/snapshots/jsonapi/movie-categories.json) |
| `getShowCategories`    |                                             | Get the show categories         | [Standardized](tests/snapshots/standardized/show-categories.json) / [JSON:API](tests/snapshots/jsonapi/show-categories.json)   |
| `getChannels`          | `{ categoryId, page, limit }`               | Get the channels for a category | [Standardized](tests/snapshots/standardized/channels.json) / [JSON:API](tests/snapshots/jsonapi/channels.json)                 |
| `getMovies`            | `{ categoryId, page, limit }`               | Get the movies for a category   | [Standardized](tests/snapshots/standardized/movies.json) / [JSON:API](tests/snapshots/jsonapi/movies.json)                     |
| `getMovie`             | `{ movieId }`                               | Get the information for a movie | [Standardized](tests/snapshots/standardized/movie.json) / [JSON:API](tests/snapshots/jsonapi/movie.json)                       |
| `getShows`             | `{ categoryId, page, limit }`               | Get the shows for a category    | [Standardized](tests/snapshots/standardized/shows.json) / [JSON:API](tests/snapshots/jsonapi/shows.json)                       |
| `getShow`              | `{ showId }`                                | Get the information for a show  | [Standardized](tests/snapshots/standardized/show.json) / [JSON:API](tests/snapshots/jsonapi/show.json)                         |
| `getShortEPG`          | `{ channelId, limit }`                      | Get the short EPG for a channel | [Standardized](tests/snapshots/standardized/short-epg.json) / [JSON:API](tests/snapshots/jsonapi/short-epg.json)               |
| `getFullEPG`           | `{ channelId }`                             | Get the full EPG for a channel  | [Standardized](tests/snapshots/standardized/full-epg.json) / [JSON:API](tests/snapshots/jsonapi/full-epg.json)                 |
| `generateStreamUrl`    | `stream` Can be a channel, movie or episode | Generate a stream URL           |                                                                                                                                |

## 🔄 Serializers

Xtream has an unpredictable API format, keys change between types, dates come as date strings and timestamp strings, things that should be arrays are sometimes objects with number keys, some data is base64 encoded.

For this reason, this library can use serializers to convert the API response to a more usable format. We provide a default set of serializers for the most common API responses.

### Available Serializers

#### Camel Case

The simplest serializer just converts the keys of the response object to camel case.

[View Definition](src/serializers/camelcase.ts)

```typescript
import { Xtream } from '@iptv/xtream-api';
import { camelCaseSerializer } from '@iptv/xtream-api/camelcase';

const xtream = new Xtream({
  url: 'http://example.com:8080',
  username: 'username',
  password: 'password',
  serializer: camelCaseSerializer,
});

const categories = await xtream.getChannelCategories();
console.log(categories);
/* outputs
[
  {
    categoryId: 1,
    categoryName: 'Category 1',
    parentId: 0,
  },
  {
    categoryId: 2,
    categoryName: 'Category 2',
    parentId: 1
  },
]
*/
```

#### Standardized

Converts the shape of the response object to a standardized format similar to Active Record, also decodes base64 strings.

[View Definition](src/serializers/standardized.ts)

```typescript
import { Xtream } from '@iptv/xtream-api';
import { standardizedSerializer } from '@iptv/xtream-api/standardized';

const xtream = new Xtream({
  url: 'http://example.com:8080',
  username: 'username',
  password: 'password',
  serializer: standardizedSerializer,
});

const categories = await xtream.getChannelCategories();
console.log(categories);
/* outputs
[
  {
    id: '1',
    name: 'Category 1',
    parentId: '0',
  },
  {
    id: '2',
    name: 'Category 2',
    parentId: '1',
  },
]
*/
```

#### JSON:API Serializer

Converts the response object to [JSON:API](https://jsonapi.org) format, also decodes base64 strings.

[View Definition](src/serializers/jsonapi.ts)

```typescript
import { Xtream } from '@iptv/xtream-api';
import { JSONAPISerializer } from '@iptv/xtream-api/jsonapi';

const xtream = new Xtream({
  url: 'http://example.com:8080',
  username: 'username',
  password: 'password',
  serializer: JSONAPISerializer,
});

const categories = await xtream.getChannelCategories();
console.log(categories);
/* outputs
{
  data: [
    {
      type: 'channel-category',
      id: '1',
      attributes: {
        name: 'Category 1',
      },
    },
    {
      type: 'channel-category',
      id: '2',
      attributes: {
        name: 'Category 2',
      },
      relationships: {
        parent: {
          data: {
            type: 'channel-category',
            id: '1',
          },
        },
      },
    },
  ],
}
*/
```

### Custom Serializers

You can create your own serializer by passing an object of serializer methods to the Xtream class.

You can define serializers for each of these methods, all are optional.

```typescript
type Serializers = {
  profile: (input: XtreamUserProfile) => any;
  serverInfo: (input: XtreamServerInfo) => any;
  channelCategories: (input: XtreamCategory[]) => any;
  movieCategories: (input: XtreamCategory[]) => any;
  showCategories: (input: XtreamCategory[]) => any;
  channels: (input: XtreamChannel[]) => any;
  movies: (input: XtreamMoviesListing[]) => any;
  movie: (input: XtreamMovie) => any;
  shows: (input: XtreamShowListing[]) => any;
  show: (input: XtreamShow) => any;
  shortEPG: (input: XtreamShortEPG) => any;
  fullEPG: (input: XtreamFullEPG) => any;
};
```

```typescript
import { Xtream } from '@iptv/xtream-api';

const xtream = new Xtream({
  url: 'http://example.com:8080',
  username: 'username',
  password: 'password',
  serializer: {
    type: 'MyCustomSerializer',
    serializers: {
      channelCategories: (input) => {
        return input.map((category) => ({
          id: category.category_id,
          name: category.category_name,
        }));
      },
    },
  },
});

const categories = await xtream.getChannelCategories();
console.log(categories);
/* outputs
[
  {
    id: 1,
    name: 'Category 1'
  },
  {
    id: 2,
    name: 'Category 2'
  }
]
```

If you want to create your serializer as a separate file or outside of the class instantiation, a helper function is provided to ensure the correct type information is preserved.

```typescript
import { defineSerializers } from '@iptv/xtream-api';

export const serializers = defineSerializers('MyCustomSerializer', {
  channelCategories: (input) => {
    return input.map((category) => ({
      id: category.category_id,
      name: category.category_name,
    }));
  },
});
```

In this example `input` will have the type of `XtreamCategory[]` which is the type of the response from the `getChannelCategories` method.

After supplying the serializers to the Xtream class, the types of the responses will be updated to reflect the changes made by the serializers.

```typescript
import { Xtream, defineSerializers } from '@iptv/xtream-api';

const mySerializer = defineSerializers('MyCustomSerializer', {
  channelCategories: (input) => {
    return input.map((category) => ({
      id: Number(category.category_id),
      name: category.category_name,
    }));
  },
});

const xtream = new Xtream({
  url: 'http://example.com:8080',
  username: 'username',
  password: 'password',
  serializer: mySerializer,
});

const categories = await xtream.getChannelCategories();
//    ^---------
//    const categories = { id: number, name: string }[]
```

## 📄 License

This library is licensed under the [MIT License](https://github.com/ektotv/xtream-api/LICENSE.md) and is free to use in both open source and commercial projects.
