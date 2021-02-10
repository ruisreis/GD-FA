var lib_gee = require("users/ruisreis/PhD:GD/lib-gee")
    ,lib_ui = require("users/ruisreis/PhD:GD/lib-ui");

var combined = lib_gee.Combined()
    // Visual style for both variables, numeric ranges are different
    ,style_deaths = {min:0.0, max:150.0, palette:lib_ui.Video.palette, forceRgbOutput: true}
    ,style_cases = {min:0.0, max:9350.0, palette:lib_ui.Video.palette, forceRgbOutput: true}
    // All calculations cover the European Union countries
    // The common dataset will be filtered to consider only those records that contain valid COVID19 data
    ,dataset = combined.getData(combined.EUROPEAN_UNION)
      .filter(ee.Filter.and(
        ee.Filter.gt("deaths_weekly",0)
        ,ee.Filter.gt("cases_weekly",0)
      ));
      
// Obtainn the unique sorted dates for the base dataset
var dates = dataset.aggregate_array(combined.DATE_START).distinct().sort();
// The image sequence is obtained by mapping all the valid dates.
// Casting is mandatory to disambiguate object types
var seq_deaths = ee.ImageCollection(ee.List(dates.iterate(handleDay(combined.DEATHS_M, style_deaths), ee.List([]))))
    ,seq_cases = ee.ImageCollection(ee.List(dates.iterate(handleDay(combined.CASES_M, style_cases), ee.List([]))));

// Handle a single day of information
function handleDay(variable, style)
{
  // The variable name and visual style are constants
  return function(date, list)
  {
    // Query the dataset for this iteration date
    var data = dataset.filter(ee.Filter.eq(combined.DATE_START, date));
    // Consolidate the several country images for this date bounding the resulting single image
    // by the whole dataset geometry. We are producing a video, set the visual style.
    // Map through the countries which have valid counts for this date.
    return ee.List(list)
      .add(ee.ImageCollection(ee.List(data.iterate(handleCountry(variable), ee.List([]))))
      .mosaic()
      .clip(dataset.geometry())
      .visualize(style));
  }
}

// Handle a single country
function handleCountry(variable)
{
  // The variable name is constant
  return function(feature, list)
  {
      // The band will have the constant value of the variable bound by the country's
      // geometry and mask the valid values (i.e. not empty or zero)
      var image = ee.Image(feature.getNumber(variable).add(1))
        .float()
        .rename("COVID19")
        .clip(feature.geometry())
        .selfMask();
      // Add the country to the list
      return ee.List(list).add(image);
  }
}

Export.video.toDrive({
  collection: seq_deaths
  ,description: "GD-COVID-DEATHS"
  ,scale: 10000
  ,region: dataset.geometry().bounds()
});

Export.video.toDrive({
  collection: seq_cases
  ,description: "GD-COVID-CASES"
  ,scale: 10000
  ,region: dataset.geometry().bounds()
});