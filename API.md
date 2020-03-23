# API

## Table of contents

- [County](#county)
  - [Cases](#county-cases)
- [State](#state)
  - [Cases](#state-cases)

## County

### County Cases

`GET /api/county/:id`
example `/api/county/05|032`


#### Parameters

no params = give all date
Just start = all dates after start

```js
start?: string (ex: "2020-21-1")
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

## State

### State Cases

`GET /api/state/:id`
example `/api/state/05`

#### Parameters

no params = give all date
Just start = all dates after start

```js
start?: string (ex: "2020-21-1")
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