# API

## Table of contents

- [County](#county)
  - [Cases](#county-cases)
  - [Geo](#county-geo)
- [State](#state)
  - [Cases](#state-cases)
  - [Counties](#state-counties)
  - [Geo](#state-geo)

## County

### County Cases

`GET /api/county/:id`
example `/api/county/05|032`


#### Parameters

no params = give all date
Just start = all dates after start
just end = all dates before end

```js
start?: string (ex: "2020-21-1")
end?: string (ex: "2020-12-17")
```

#### Response

Case array order DESC

```js
  {
    ID: string; (ex: "05|032")
    CountyName: string;
    StateName: string;
    Confirmed: number;
    Dead: number;
  }[]
```

### County Geo

`GET /api/county/:id/geo`
example `/api/county/05|032/geo`

#### Parameters

none

#### Response

Case array order DESC

```js
  {
    ID: string; (ex: "05|032")
    Geo: GeoJSON;
  }[]
```

## State

### State Cases

`GET /api/state/:id`
example `/api/state/05`

#### Parameters

no params = give all date
Just start = all dates after start
just end = all dates before end

```js
start?: string (ex: "2020-21-1")
end?: string (ex: "2020-12-17")
```

#### Response

Case array order DESC

```js
  {
    ID: string; (ex: "05")
    StateName: string;
    Confirmed: number;
    Dead: number;
  }[]
```

### State Geo

`GET /api/state/:id/geo`
example `/api/state/05/geo`

#### Parameters

none

#### Response

Case array order DESC

```js
  {
    ID: string; (ex: "05")
    Geo: GeoJSON;
  }[]
```

### State Counties

`GET /api/state/:id/counties`
example `/api/state/05/counties`

#### Parameters

none

#### Response

any order

```js
  {
    ID: string; (ex: "05|032")
  }[]
```
