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

<table>
<thead>
<tr>
<th>Method</th>
<th>Serialized</th>
</tr>
</thead>
<tbody>
<tr>
<td valign="top">

```ts
getProfile();
```

</td>
      <td valign="top">- <a href="tests/snapshots/standardized/profile.json">Standardized</a> <br> - <a href="tests/snapshots/jsonapi/profile.json">JSON:API</a></td>
    </tr>
    <tr>
      <td valign="top">

```ts
getServerInfo();
```

</td>
<td valign="top">- <a href="tests/snapshots/standardized/server-info.json">Standardized</a> <br>- <a href="tests/snapshots/jsonapi/server-info.json">JSON:API</a></td>
</tr>

<tr>
<td valign="top">

```ts
getChannelCategories();
```

</td>
<td valign="top">- <a href="tests/snapshots/standardized/categories.json">Standardized</a> <br>- <a href="tests/snapshots/jsonapi/categories.json">JSON:API</a></td>
</tr>

<tr>
<td valign="top">

```ts
getMovieCategories();
```

</td>
<td valign="top">- <a href="tests/snapshots/standardized/movie-categories.json">Standardized</a> <br>- <a href="tests/snapshots/jsonapi/movie-categories.json">JSON:API</a></td>
</tr>

<tr>
<td valign="top">

```ts
getShowCategories();
```

</td>
<td valign="top">- <a href="tests/snapshots/standardized/show-categories.json">Standardized</a> <br>- <a href="tests/snapshots/jsonapi/show-categories.json">JSON:API</a></td>
</tr>

<tr>
<td valign="top">
      
```ts
getChannels(options: { 
  categoryId?: string | number, 
  page: number, 
  limit: number 
});
```

</td>
<td valign="top">- <a href="tests/snapshots/standardized/channels.json">Standardized</a> <br>- <a href="tests/snapshots/jsonapi/channels.json">JSON:API</a></td>
</tr>

<tr>
<td valign="top">

```ts
getMovies(options: {
  categoryId?: string | number,
  page: number,
  limit: number
})
```

</td>
<td valign="top">- <a href="tests/snapshots/standardized/movies.json">Standardized</a> <br>- <a href="tests/snapshots/jsonapi/movies.json">JSON:API</a></td>
</tr>

<tr>
<td valign="top">

```ts
getMovie(options: {
  movieId: string | number
})
```

</td>
<td valign="top">- <a href="tests/snapshots/standardized/movie.json">Standardized</a> <br>- <a href="tests/snapshots/jsonapi/movie.json">JSON:API</a></td>
</tr>

<tr>
<td valign="top">

```ts
getShows(options: {
  categoryId?: string | number,
  page: number,
  limit: number
})
```

</td>
<td valign="top">- <a href="tests/snapshots/standardized/shows.json">Standardized</a> <br>- <a href="tests/snapshots/jsonapi/shows.json">JSON:API</a></td>
</tr>

<tr>
<td valign="top">

```ts
getShow(options: {
  showId: string | number
})
```

</td>
<td valign="top">- <a href="tests/snapshots/standardized/show.json">Standardized</a> <br>- <a href="tests/snapshots/jsonapi/show.json">JSON:API</a></td>
</tr>
<tr>
<td valign="top">

```ts
getShortEPG(options: {
  channelId: string | number,
  limit: number
})
```

</td>
<td valign="top">- <a href="tests/snapshots/standardized/short-epg.json">Standardized</a> <br>- <a href="tests/snapshots/jsonapi/short-epg.json">JSON:API</a></td>
</tr>

<tr>
<td valign="top">

```ts
getFullEPG(options: {
  channelId: string | number
})
```

</td>
<td valign="top">- <a href="tests/snapshots/standardized/full-epg.json">Standardized</a> <br>- <a href="tests/snapshots/jsonapi/full-epg.json">JSON:API</a></td>
</tr>

<tr>
<td valign="top">

```ts
generateStreamUrl(options: {
  type: 'channel' | 'movie' | 'episode';
  streamId: string | number;
  extension: string;
  timeshift: {
    duration: number;
    start: Date;
  }
})
```

This is used internally to generate the stream URLs. You can use this method to generate a timeshift URL or if you need to generate a URL manually for any reason.

</td>
<td valign="top">N/A</td>
</tr>
</tbody>
</table>

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
