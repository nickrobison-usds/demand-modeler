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
    ID: string;
    CountyName: string;
    StateName: string;
    Confirmed: number;
    Dead: number;
  }[]
```

### County Geo

`GET /api/county/:id/geo`

#### Parameters

none

#### Response

Case array order DESC

```JSON
  {
    ID: string;
    Geo: GeoJSON;
  }[]
```

## State

### State Cases

`GET /api/state/:id`

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
    ID: string;
    StateName: string;
    Confirmed: number;
    Dead: number;
  }[]
```

### State Geo

`GET /api/state/:id/geo`

#### Parameters

none

#### Response

Case array order DESC

```JSON
  {
    ID: string;
    Geo: GeoJSON;
  }[]
```

### State Counties

`GET /api/state/:id/counties`

#### Parameters

none

#### Response

any order

```JSON
  {
    ID: string;
  }[]
```
