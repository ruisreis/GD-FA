function Territory()
{
  var me = {
    REGION_FIELD: "wld_rgn",
    COUNTRY_FIELD: "country_co",
    NAME_FIELD: "country_na",
    EUROPEAN_UNION: ['Austria', 'Belgium', 'Bulgaria', 'Croatia', 'Cyprus', 'Czechia', 'Denmark', 'Estonia', 'Finland',
                      'France', 'Germany', 'Greece', 'Hungary', 'Ireland', 'Italy', 'Latvia', 'Lithuania', 'Luxembourg',
                      'Malta', 'Netherlands', 'Poland', 'Portugal', 'Romania', 'Slovakia', 'Slovenia', 'Spain', 'Sweden'],
    db: ee.FeatureCollection("USDOS/LSIB_SIMPLE/2017"),
    regions: function(country)
    {
      var operation = this.db
        .filter(ee.Filter.eq(this.COUNTRY_FIELD, country))
        .iterate(this.foreach_record(this.NAME_FIELD), ee.List([]));
      return operation
        .getInfo();
    },
    geometry: function(country, region)
    {
      var operation = this.db
        .filter(
          ee.Filter.and(
            ee.Filter.eq(this.COUNTRY_FIELD, country),
            ee.Filter.eq(this.NAME_FIELD, region)
            )
          )
          .geometry()
      return operation;
    },
    geometries: function(countries)
    {
      var operation = this.db
        .filter(
          ee.Filter.and(
            ee.Filter.inList(this.COUNTRY_FIELD,ee.List(countries)),
            ee.Filter.stringContains(this.NAME_FIELD, '(').not()
            )
          )
        .geometry();
   
      return operation;
    },
    countries: function(countries)
    {
      var operation = this.db
        .filter(
          ee.Filter.and(
            ee.Filter.inList(this.COUNTRY_FIELD,ee.List(countries)),
            ee.Filter.stringContains(this.NAME_FIELD, '(').not()
            )
          );
   
      return operation;
    },
    european_union: function()
    {
      var operation = this.db
        .filter(ee.Filter.and(
          ee.Filter.inList(this.NAME_FIELD, this.EUROPEAN_UNION),
          ee.Filter.stringContains(this.NAME_FIELD, '(').not()
          ));
   
      return operation;
    },
    foreach_record: function(field) {
      return function(record, list)
        {
          return ee.List(list)
          .add(record.get(field))
        }
    }
  }
  
  return me;
}
exports.Territory = Territory;

exports.Disease = function()
{
  var me = {
    CONTINENT: "continentExp",
    REGION: "countriesAndTerritories",
    COUNTRY: "fips",
    DATE: "system:time_start",
    DEATHS: "deaths_weekly",
    CASES: "cases_weekly",
    POPULATION: "popData2019",
    // European Union FIPS country codes
    EUROPEAN_UNION: [   "RO", "FI", "IT", "MT", "HR", "GR", "BU", "PO", "SP", "FR",
                        "SW", "DA", "EN", "LG", "LH", "PL", "GM", "EZ", "LO", "HU",
                        "SI", "AU", "LU", "NL", "BE", "EI", "CY" ],
    db: ee.FeatureCollection("users/ruisreis/COVID19-20210127"),
    dates: function()
    {
      var operation = 
        ee.List(
          this.db
            .select(this.DATE)
            // Two year span is the maximum
            .iterate(
              function(feature, list)
              {
                return ee.List(list).add(feature.getString(this.DATE));
              }, ee.List([])))
          .distinct()
          .sort();
        
      return operation;
    },
    getEuropeanUnion: function()
    {
      var operation = this.db
        .filter(ee.Filter.inList(this.COUNTRY, this.EUROPEAN_UNION))
      return operation;
    },
    getDate: function(date)
    {
      var operation = this.db
        .filter(
            ee.Filter.and(
              ee.Filter.lte(this.DATE_START, date)
              ,ee.Filter.gte(this.DATE_END, date)));
      return operation;
    },
    getDateCountry: function(date, country)
    {
      var operation = this.db
        .filter(
            ee.Filter.and(
              ee.Filter.lte(this.DATE_START, date)
              ,ee.Filter.gte(this.DATE_END, date)
              ,ee.Filter.eq(this.COUNTRY, country)));
      return operation;
    },
    getDateCountries: function(date, countries)
    {
      var operation = this.db
        .filter(
            ee.Filter.and(
              ee.Filter.lte(this.DATE_START, date)
              ,ee.Filter.gte(this.DATE_END, date)
              ,ee.Filter.inList(this.COUNTRY, countries)));
      return operation;
    },
    getCountry: function(country)
    {
      var operation = this.db
        .filter(ee.Filter.eq(this.COUNTRY, country));
      return operation;
    },
    getCountries: function(countries, from, to)
    {
      var operation = this.db
        .filter(ee.Filter.inList(this.COUNTRY, countries));
      if(typeof(from)!="undefined" && typeof(to)!="undefined")
      {
        operation.filter(ee.Filter.and(
              ee.Filter.gte(this.DATE, ee.Date(from))
              ,ee.Filter.lte(this.DATE, ee.Date(to))));
      }
      return operation;
    }
  }

  return me;
}

exports.Climate=function()
{
  var me = 
  {
    TEMP_MEAN: "mean_2m_air_temperature",
    TEMP_MAX: "maximum_2m_air_temperature",
    TEMP_MIN: "minimum_2m_air_temperature",
    RAIN: "total_precipitation",
    PRESSURE: "surface_pressure",
    DATE_START: "system:time_start",
    DATE_END: "system:time_end",
    ISO_MASK: "yyyy-MM-dd'T'HH:mm:ss",
    scale: 1000,
    territory: Territory(),
    db: ee.ImageCollection("ECMWF/ERA5/DAILY"),
    aggregate: function(from, to, country)
    {
      var geometry = this.territory.geometries(country)
          ,operation = ee.ImageCollection('ECMWF/ERA5/DAILY')
                        .select([this.TEMP_MEAN, this.TEMP_MIN, this.TEMP_MAX, this.RAIN, this.PRESSURE])
                        .filter(ee.Filter.date(from, to))
                        .mean()
                        .reduceRegion(ee.Reducer.mean(), geometry, this.scale)
          ,bounds = {};
                    
      bounds[this.DATE_START] = from.format(this.ISO_MASK);
      bounds[this.DATE_END] = to.format(this.ISO_MASK);
      
      
      
      return {  operation: operation
                ,bounds: bounds
                ,geometry: geometry };
    }
  }
  
  return me;
}

exports.Combined=function()
{
  var me = {
    DATE_START: "system:time_start",
    DATE_END: "system:time_end",
    REGION: "countriesAndTerritories",
    COUNTRY: "fips",
    DEATHS: "deaths_weekly",
    CASES: "cases_weekly",
    DEATHS_M: "deaths",
    CASES_M: "cases",
    // European Union FIPS country codes
    EUROPEAN_UNION: [   "RO", "FI", "IT", "MT", "HR", "GR", "BU", "PO", "SP", "FR",
                        "SW", "DA", "EN", "LG", "LH", "PL", "GM", "EZ", "LO", "HU",
                        "SI", "AU", "LU", "NL", "BE", "EI", "CY" ],
    territory: Territory(),
    db: ee.FeatureCollection("users/ruisreis/COVID19-CLIMATE-DS-PY"),
    getData: function(countries)
    {
      var operation = this.db
        .filter(ee.Filter.inList(this.COUNTRY, countries));
      return operation;
    }
  }
  
  return me;
}