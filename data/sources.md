# Data Sources

## Table of Contents

* [County Level](#county-level)
  * [USA Facts](#usaFacts)
  * [1point3acers](#1point3acres)
  * [Johns Hopkins](#john-hopkins)
  * [University of Virginia](#university-of-virginia)
  * [Covid Tracking](#covid-tracking)
* [Other](#other)
  * [Demestic Epidemic](#demestic-epidemic)
  * [World Health Organization](#world-health-organization)
  * [dxy](#world-healthorganization)

## County Level

### Johns Hopkins

[Dashboard](https://systems.jhu.edu/research/public-health/2019-ncov-map-faqs/)
[Data Dumps](https://github.com/CSSEGISandData/COVID-19/tree/master/csse_covid_19_data)

Data:

* Total Confirmed
* Total Deaths
* Total Recovered

### USA Facts

Really easy to pull all historical data for counties ❤. good historical county data

[confirmed.csv](https://static.usafacts.org/public/data/covid-19/covid_confirmed_usafacts.csv)
[deaths.csv](https://static.usafacts.org/public/data/covid-19/covid_deaths_usafacts.csv)

[API](https://usafactsstatic.blob.core.windows.net/public/2020/coronavirus-timeline/allData.json)
[Dashboard](https://usafacts.org/visualizations/coronavirus-covid-19-spread-map/)

* Total Confirmed
* Total Deaths

### 1point3acers

Data from the US and Canada

[Dashboard](https://coronavirus.1point3acres.com/en)
[Data Request Form](https://coronavirus.1point3acres.com/en/data)

* Total Confirmed
* Total Deaths

### University of Virginia

You can curate this into a csv format including counties by searching for "United States" and clicking the Download button.

[Dashboard](https://nssac.bii.virginia.edu/covid-19/dashboard/)
[Export](https://docs.google.com/spreadsheets/d/1jLAjzYMcsPo71qu5uBxjT_dAzj8vxZfvnTMR-Xp3-v8/edit#gid=1076558078)

### COVID Tracking

links to state data

[data](https://covidtracking.com/)
[github](https://github.com/COVID19Tracking)

## Other

### Domestic Epidemic

Seems to have good global data at a regional scale (state, providence, area)

[Dashboard](https://news.qq.com/zt2020/page/feiyan.htm#/global)

API: https://api.inews.qq.com/newsqa/v1/query/pubished/daily/listcountry=%E6%84%8F%E5%A4%A7%E5%88%A9&

* Total Confirmed
* Total Deaths
* Total Cured

### World Health Organization

Good source of global region and country level data

[Situation Report](https://www.who.int/emergencies/diseases/novel-coronavirus-2019/situation-reports/)
[Reports as CSV](https://github.com/CSSEGISandData/COVID-19/blob/master/who_covid_19_situation_reports/who_covid_19_sit_rep_time_series/who_covid_19_sit_rep_time_series.csv)
[API](https://apps.who.int/gho/data/node.resources.api)

#### Data

updated daily

* Total Confirmed
* Total Deaths
* Days Since Last Reported Case

### DXY

[Dashboard](https://ncov.dxy.cn/ncovh5/view/en_pneumonia)

Streaming updates:

* Active Cases
* Total Confirmed
* Total Deaths
* Recovered