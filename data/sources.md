# Data Sources

source to add
 * List of APIs https://covid-19-apis.postman.com/
 * Italy data https://github.com/pcm-dpc/COVID-19

## Table of Contents

* [County Level](#county-level)
  * [USA Facts](#usaFacts)
  * [New York Times](#New-York-Times)
  * [CSBS](#Conference-of-State-Bank-Supervisors)
  * [1point3acers](#1point3acres)
  * [Johns Hopkins](#john-hopkins)
  * [University of Virginia](#university-of-virginia)
  * [Covid Tracking](#covid-tracking)
* [Other](#other)
  * [Demestic Epidemic](#demestic-epidemic)
  * [World Health Organization](#world-health-organization)
  * [dxy](#world-healthorganization)

## County Level

### USA Facts

Really easy to pull all historical data for counties ❤. good historical county data

[confirmed.csv](https://static.usafacts.org/public/data/covid-19/covid_confirmed_usafacts.csv)
[deaths.csv](https://static.usafacts.org/public/data/covid-19/covid_deaths_usafacts.csv)

[API](https://usafactsstatic.blob.core.windows.net/public/2020/coronavirus-timeline/allData.json)
[Dashboard](https://usafacts.org/visualizations/coronavirus-covid-19-spread-map/)

* Total Confirmed
* Total Deaths

### New York Times

[CSV repo](https://github.com/nytimes/covid-19-data)

* State
  * Total Confirmed
  * Total Deaths
* County
  * Total Confirmed
  * Total Deaths

### Conference of State Bank Supervisors

[Dashboard](https://www.csbs.org/information-covid-19-coronavirus)

* Total Confirmed
* Total Deaths

### 1point3acers

Data from the US and Canada

[Dashboard](https://coronavirus.1point3acres.com/en)
[Data Request Form](https://coronavirus.1point3acres.com/en/data)

* Total Confirmed
* Total Deaths

### COVID Tracking

links to state data

[data](https://covidtracking.com/)
[github](https://github.com/COVID19Tracking)


### University of Virginia

You can curate this into a csv format including counties by searching for "United States" and clicking the Download button.

[Dashboard](https://nssac.bii.virginia.edu/covid-19/dashboard/)
[Export](https://docs.google.com/spreadsheets/d/1jLAjzYMcsPo71qu5uBxjT_dAzj8vxZfvnTMR-Xp3-v8/edit#gid=1076558078)

### Johns Hopkins

[Dashboard](https://systems.jhu.edu/research/public-health/2019-ncov-map-faqs/)
[Data Dumps](https://github.com/CSSEGISandData/COVID-19/tree/master/csse_covid_19_data)

Data:

* Total Confirmed
* Total Deaths
* Total Recovered

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

## County-level data by state
|State|Total tests|Negative|Positive|Deaths|Notes|
|---|---|---|---|---|---|
|AK|[COVID tracker source](http://dhss.alaska.gov/dph/Epi/id/Pages/COVID-19/monitoring.aspx#)||[COVID tracker source](http://dhss.alaska.gov/dph/Epi/id/Pages/COVID-19/monitoring.aspx#)||Boroughs|
|AL|[COVID tracker source](https://alpublichealth.maps.arcgis.com/apps/opsdashboard/index.html#/6d2771faa9da4a2786a509d82c8cf0f7)||[COVID tracker source](https://alpublichealth.maps.arcgis.com/apps/opsdashboard/index.html#/6d2771faa9da4a2786a509d82c8cf0f7)|[COVID tracker source](https://alpublichealth.maps.arcgis.com/apps/opsdashboard/index.html#/6d2771faa9da4a2786a509d82c8cf0f7)||
|AR|[**New** source](https://adem.maps.arcgis.com/apps/opsdashboard/index.html#/f533ac8a8b6040e5896b05b47b17a647)|[**New** source](https://adem.maps.arcgis.com/apps/opsdashboard/index.html#/f533ac8a8b6040e5896b05b47b17a647)|[COVID tracker source](https://www.healthy.arkansas.gov/programs-services/topics/novel-coronavirus#)||2 deaths in the state| no county reporting of fatalities yet"|
|AS|||||Samoa divided into 3 districts.  No district-level reporting published|
|AZ|||[COVID tracker source](https://www.azdhs.gov/preparedness/epidemiology-disease-control/infectious-disease-epidemiology/index.php#novel-coronavirus-home)|||
|CA|||[COVID tracker source](https://www.latimes.com/projects/california-coronavirus-cases-tracking-outbreak/#)|[COVID tracker source](https://www.latimes.com/projects/california-coronavirus-cases-tracking-outbreak/#)|County granularity for Total Tests and Negative likely available at the 58 county sites the LA Times compiles from (but does not currently report on)|
|CO|||[**New** source](https://data-cdphe.opendata.arcgis.com/datasets/colorado-covid-19-positive-cases-and-rates-of-infection-by-county-of-identification/data)|||
|CT|||[COVID tracker source](https://portal.ct.gov/Coronavirus#)|[COVID tracker source](https://portal.ct.gov/Coronavirus#)||
|DC|[COVID tracker source](https://coronavirus.dc.gov/page/coronavirus-surveillance-data#)|[COVID tracker source](https://coronavirus.dc.gov/page/coronavirus-surveillance-data#)|[COVID tracker source](https://coronavirus.dc.gov/page/coronavirus-surveillance-data#)|[COVID tracker source](https://coronavirus.dc.gov/page/coronavirus-surveillance-data#)||
|DE|||[COVID tracker source](https://dhss.delaware.gov/dhss/dph/epi/2019novelcoronavirus.html#)||Tracker has space for other fields| but all are 0 so not trustworthy"|
|FL|[COVID tracker source](https://experience.arcgis.com/experience/96dd742462124fa0b38ddedb9b25e429/#)|[COVID tracker source](https://experience.arcgis.com/experience/96dd742462124fa0b38ddedb9b25e429/#)|[COVID tracker source](https://experience.arcgis.com/experience/96dd742462124fa0b38ddedb9b25e429/#)|[COVID tracker source](https://experience.arcgis.com/experience/96dd742462124fa0b38ddedb9b25e429/#)||
|GA|||[COVID tracker source](https://dph.georgia.gov/georgia-department-public-health-covid-19-daily-status-report#)|||
|GU|||||Guam is divided into villages.  No village-granularity data has been published|
|HI|||[COVID tracker source](https://hawaiicovid19.com/#)|||
|IA|||[COVID tracker source](https://idph.iowa.gov/Emerging-Health-Issues/Novel-Coronavirus#)||Direct GIS link: https://iowa.maps.arcgis.com/apps/opsdashboard/index.html#/ef0a08e22e6742d28f78c0519eac4dce|
|ID|||[COVID tracker source](https://coronavirus.idaho.gov/#)|[COVID tracker source](https://coronavirus.idaho.gov/#)||
|IL|||[COVID tracker source](http://www.dph.illinois.gov/topics-services/diseases-and-conditions/diseases-a-z-list/coronavirus#)||Deaths on map by city| county can be inferred that way"|
|IN|||[COVID tracker source](https://www.in.gov/isdh/28470.htm#)|[COVID tracker source](https://www.in.gov/isdh/28470.htm#)|Direct map link: https://coronavirus.in.gov/2393.htm|
|KS|||[COVID tracker source](http://www.kdheks.gov/coronavirus/#)||Direct GIS link: https://kdhe.maps.arcgis.com/apps/opsdashboard/index.html#/05f4169dc6394aa98895072b94734134|
|KY|||[COVID tracker source](https://chfs.ky.gov/agencies/dph/Pages/covid19.aspx#)|||
|LA|||[COVID tracker source](http://ldh.la.gov/Coronavirus/#)|[COVID tracker source](http://ldh.la.gov/Coronavirus/#)|Parishes|
|MA|||[COVID tracker source](https://www.mass.gov/info-details/covid-19-cases-quarantine-and-monitoring#)|||
|MD|||[COVID tracker source](https://phpa.health.maryland.gov/Pages/Novel-coronavirus.aspx#)|||
|ME|||[COVID tracker source](https://www.maine.gov/dhhs/mecdc/infectious-disease/epi/airborne/coronavirus.shtml#)|||
|MI|||[COVID tracker source](https://www.michigan.gov/coronavirus/0&#124;9753&#124;7-406-98163-520743--&#124;00.html)|[COVID tracker source](https://www.michigan.gov/coronavirus/0&#124;9753&#124;7-406-98163-520743--&#124;00.html)||
|MN|||[COVID tracker source](https://www.health.state.mn.us/diseases/coronavirus/situation.html#)|||
|MO|||[COVID tracker source](https://health.mo.gov/living/healthcondiseases/communicable/novel-coronavirus/#)|[COVID tracker source](https://health.mo.gov/living/healthcondiseases/communicable/novel-coronavirus/#)|Direct link to data: https://health.mo.gov/living/healthcondiseases/communicable/novel-coronavirus/results.php|
|MP|||||Commonwealth of the Northern Mariana Islands only links to Johns Hopkins|
|MS|||[COVID tracker source](https://msdh.ms.gov/msdhsite/_static/14&#124;0#124;420.html#)|[COVID tracker source](https://msdh.ms.gov/msdhsite/_static/14#124;0#124;420.html#)||
|MT|||[COVID tracker source](https://dphhs.mt.gov/publichealth/cdepi/diseases/coronavirusmt#)||Direct GIS link: https://montana.maps.arcgis.com/apps/MapSeries/index.html?appid=7c34f3412536439491adcc2103421d4b|
|NC|||[COVID tracker source](https://www.ncdhhs.gov/covid-19-case-count-north-carolina#)|||
|ND|||[COVID tracker source](https://www.health.nd.gov/diseases-conditions/coronavirus/north-dakota-coronavirus-cases#)|||
|NE|||||No data at the county-level beyond Johns Hopkins.  Univ of NE republishes at https://universityofne.maps.arcgis.com/apps/MapSeries/index.html?appid=d68aec6490f2457a8f0156d9f150e954|
|NH|||[COVID tracker source](https://www.dhhs.nh.gov/dphs/cdcs/2019-ncov.htm#)|||
|NJ|||[COVID tracker source](https://covid19.nj.gov/#live-updates)|||
|NM|||[COVID tracker source](https://cv.nmhealth.org/#)|[COVID tracker source](https://cv.nmhealth.org/#)|Direct data link: https://cv.nmhealth.org/cases-by-county/|
|NV|||||Only offical data at state level|
|NY|||[COVID tracker source](https://coronavirus.health.ny.gov/county-county-breakdown-positive-cases#)|||
|OH|||[COVID tracker source](https://coronavirus.ohio.gov/wps/portal/gov/covid-19/#)|[COVID tracker source](https://coronavirus.ohio.gov/wps/portal/gov/covid-19/#)||
|OK|||[COVID tracker source](https://coronavirus.health.ok.gov/#)|[**New** source](https://experience.arcgis.com/experience/0e8ccb659c804924b72ddc862ec0eadf)||
|OR||[COVID tracker source](https://www.oregon.gov/oha/PH/DISEASESCONDITIONS/DISEASESAZ/Pages/emerging-respiratory-infections.aspx#)|[COVID tracker source](https://www.oregon.gov/oha/PH/DISEASESCONDITIONS/DISEASESAZ/Pages/emerging-respiratory-infections.aspx#)|[COVID tracker source](https://www.oregon.gov/oha/PH/DISEASESCONDITIONS/DISEASESAZ/Pages/emerging-respiratory-infections.aspx#)||
|PA|||[COVID tracker source](https://www.health.pa.gov/topics/disease/coronavirus/Pages/Cases.aspx#)|[COVID tracker source](https://www.health.pa.gov/topics/disease/coronavirus/Pages/Cases.aspx#)||
|PR|||[COVID tracker source](http://www.salud.gov.pr/Pages/coronavirus.aspx#)||Direct data link: https://estadisticas.pr/en/covid-19|
|RI|||||Only offical data at state level|
|SC|||[COVID tracker source](https://scdhec.gov/health/infectious-diseases/viruses/coronavirus-disease-2019-covid-19/monitoring-testing-covid-19#)||Direct GIS link: https://sc-dhec.maps.arcgis.com/home/item.html?id=5ffb6e698ea64a91a497194814a26311|
|SD|||[COVID tracker source](https://doh.sd.gov/news/Coronavirus.aspx#)|||
|TN|||[COVID tracker source](https://www.tn.gov/health/cedep/ncov.html#)|||
|TX|||[**New** source](https://txdshs.maps.arcgis.com/apps/opsdashboard/index.html#/ed483ecd702b4298ab01e8b9cafc8b83)|||
|UT|||[COVID tracker source](https://coronavirus-dashboard.utah.gov/#)|||
|VA|||[COVID tracker source](https://public.tableau.com/views/VirginiaCOVID-19Dashboard/VirginiaCOVID-19Dashboard?:embed=yes&:display_count=yes&:showVizHome=no&:toolbar=no#)|||
|VI|||||No data at county level|
|VT|||[COVID tracker source](https://www.healthvermont.gov/response/infectious-disease/2019-novel-coronavirus#)|||
|WA|||[COVID tracker source](https://www.doh.wa.gov/Emergencies/Coronavirus#)|[COVID tracker source](https://www.doh.wa.gov/Emergencies/Coronavirus#)||
|WI|||[COVID tracker source](https://www.dhs.wisconsin.gov/outbreaks/index.htm#)|[COVID tracker source](https://www.dhs.wisconsin.gov/outbreaks/index.htm#)||
|WV|||[COVID tracker source](https://dhhr.wv.gov/Coronavirus Disease-COVID-19/Pages/default.aspx)|||
|WY|[COVID tracker source](https://health.wyo.gov/publichealth/infectious-disease-epidemiology-unit/disease/novel-coronavirus/#)||[COVID tracker source](https://health.wyo.gov/publichealth/infectious-disease-epidemiology-unit/disease/novel-coronavirus/#)||Direct data link: https://health.wyo.gov/publichealth/infectious-disease-epidemiology-unit/disease/novel-coronavirus/covid-19-map-and-statistics/|
