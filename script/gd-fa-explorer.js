var lib_gee = require("users/ruisreis/PhD:GD/lib-gee")
    ,lib_ui = require("users/ruisreis/PhD:GD/lib-ui");

var territory =lib_gee.Territory()
    ,disease = lib_gee.Combined()
    // We will only handle the European Union
    ,shortlist = disease.EUROPEAN_UNION
    ,overlay = territory.countries(shortlist);


// GEE boundary
function chartMap(feature)
{
  // Produce the chart for the specified date
  return feature.set({date: ee.Date(feature.getString(disease.DATE_END))});
}

function selectCountry(coordinates) {
  // The mouse was clicked, track the country using the point coordinates
  overlay
    .filterBounds(ee.Geometry.MultiPoint(coordinates))
    .aggregate_array(territory.COUNTRY_FIELD)
    .evaluate(selectCountryCB);
}

function invalidateOverlay(countries)
{
  // The overlay is invalid, a new country was chosen
  var overlay = territory
    .countries(countries)
    .style(Styles.selected);
  invalidateOverlayCB(overlay);
}

function invalidateChart(countries, from, to)
{
  // The chart is invalid, the criteria has changed
  var dataset = disease
    .getData(Explorer.selected, from, to)
    .map(chartMap)
    .filter(ee.Filter.and(
              ee.Filter.gte(Constants.DATE_FIELD, ee.Date(from))
              ,ee.Filter.lte(Constants.DATE_FIELD, ee.Date(to))))
    .sort(Constants.DATE_FIELD, true);
  invalidateChartCB(dataset);
}

// Client boundary
// Contant strings used
var Constants={
  DATE_FIELD: "date",
  DEATHS: "Deaths",
  DEATHS_M: "Deaths per million",
  CASES: "Cases",
  CASES_M: "Cases per million",
  DATE_START: '2020-11-01',
  DATE_END: '2021-01-27'
};

// Visual style elements and UI components
var Styles={
      countries: {color: '26458d', fillColor: '00000000'},
      selected: {color: '8856a7', fillColor: '8856a7C0'},
      title: {fontWeight: 'bold', fontSize: '24px'},
      subtitle: {fontWeight: 'bold', fontSize: '18px'},
      chartTitle: {italic: false, bold: true},
      yTitle: {italic: false, bold: true}}
    ,Palette = {
      chart: ["003f5c","58508d","bc5090","ff6361","ffa600"].reverse()}
    ,Buttons = {
      clear: ui.Button('Clear selected', clearSelected),
      update: ui.Button('Update chart', updateChart)
    }
    ,Boxes = {
      dateFrom: ui.Textbox({placeholder:"yyyy-mm-dd", value:Constants.DATE_START, style:{width: "8em"}}),
      dateTo: ui.Textbox({placeholder:"yyyy-mm-dd", value:Constants.DATE_END, style:{width: "8em"}})
    }
    ,Select = {
      variable: ui.Select([Constants.DEATHS_M, Constants.DEATHS, Constants.CASES_M, Constants.CASES], Constants.DEATHS_M)
    }
    ,Labels = {
      message: ui.Label('Select up to 5 countries'),
      title: ui.Label("COVID19 data explorer", Styles.title),
      criteria: {
        title : ui.Label("Chart selection criteria", Styles.subtitle),
        dateFrom: ui.Label("From: ", {width: "3em"}),
        dateTo: ui.Label(" To: ", {width: "3em"}),
        variable: ui.Label("Variable: ", {width: "3em"}),
        error: ui.Label(" ", {color: "red"})
      }
    }
    ,Charts = {
      main: ui.Panel({layout: ui.Panel.Layout.Flow('horizontal')})
    }
    ,Containers = {
      dates: ui.Panel([
        Labels.criteria.dateFrom,
        Boxes.dateFrom,
        Labels.criteria.dateTo,
        Boxes.dateTo], ui.Panel.Layout.Flow('horizontal')),
      variable: ui.Panel([
        Labels.criteria.variable,
        Select.variable], ui.Panel.Layout.Flow('horizontal')),
      buttons: ui.Panel([Buttons.clear], ui.Panel.Layout.Flow('horizontal'), {margin: '0 0 0 auto', width: '500px'})
    }
    ,Panels = {
      results: ui.Panel({widgets: [
        Charts.main,
        Containers.buttons,
        Labels.message], style: {position: 'bottom-right'}}),
      criteria: ui.Panel({widgets:[
        Labels.criteria.title,
        Containers.dates,
        Labels.criteria.error,
        Containers.variable,
        Buttons.update
        ],
        style: {position: 'bottom-left', margin: '0 0 0 auto', width: '400px'}})};
// User context 
var Explorer = {
  selected: [],
  dateFrom: Constants.DATE_START,
  dateTo: Constants.DATE_END,
  variable: Constants.DEATHS_M
};

function showStatus(message)
{
  // Show this status message in the chart frame
  Labels.message.setValue(message);
}

function getChart(dataset, variable, title, ytitle)
{
  // Produce the chart using Google Charts and the filtered GEE dataset (FeatureCollection)
  return ui.Chart.feature
        .groups({
          features: dataset,
          xProperty: Constants.DATE_FIELD,
          yProperty: variable,
          seriesProperty: disease.REGION
        })
        .setChartType('LineChart')
        .setOptions({
          title: title,
          intervals: {style: 'area'},
          legend: {position: 'top'},
          hAxis: {
            title: 'Date',
            titleTextStyle: Styles.chartTitle,
          },
          vAxis: {title: ytitle, titleTextStyle: Styles.yTitle, viewWindow:{min: 0}},
          lineWidth: 5,
          colors: Palette.chart,
          curveType: 'function'
        });
}

function selectClick(location) {
  // The user clicked the map
  if(Explorer.selected.length<5)
  {
    // A country can still be selected
    selectCountry([[location.lon, location.lat]]);
  }
}

function clearSelected()
{
  // Clear the selected countries in the user context and refresh the UI
  Explorer.selected = [];
  Map.layers().remove(Map.layers().get(1));
  Buttons.clear.setDisabled(true);
  Buttons.update.setDisabled(true);
  showStatus("Select up to 5 countries");
}

function selectCountryCB(data, error)
{
  // Country selection callback, once the data has been retrieved from the GEE
  if(data!==null && data.length>0)
  {
    if(Explorer.selected.indexOf(data[0])==-1)
    {
      showStatus("Wait...");
      Explorer.selected.push(data[0]);
      invalidateChart(Explorer.selected, Explorer.dateFrom, Explorer.dateTo);
      invalidateOverlay(Explorer.selected);
    }
  }
}

function invalidateOverlayCB(data, error)
{
  // Overlay refreshing callback, once the geometry country data has been retrieved from the GEE
  showStatus("Updating overlay");
  Buttons.clear.setDisabled(false);
  Buttons.update.setDisabled(false);
  Map.layers().set(1, ui.Map.Layer(data));
  showStatus("Done");
}

function invalidateChartCB(data, error) {
  // Statistical data was received from GEE, produce  the chart
  var chart = null;
  switch(Explorer.variable)
  {
    case Constants.DEATHS_M:
      chart = getChart(data, "deaths", "Deaths by COVID19", "Deaths per million");
      break;
    case Constants.DEATHS:
      chart = getChart(data, "deaths_weekly", "Deaths by COVID19", "Death individuals");
      break;
    case Constants.CASES_M:
      chart = getChart(data, "cases", "Diagnosed cases of COVID19", "Cases per million");
      break;
    case Constants.CASES:
      chart = getChart(data, "cases_weekly", "Diagnosed cases of COVID19", "Infected individuals");
      break;
  }
  if(chart!==null)
  {
    showStatus("Updating chart");
    Charts.main.clear().add(chart);
    showStatus("Done");
  }
}

function updateChart()
{
  // Chart criteria was changed in the left pane, invalidate the existing chart
  var dateFrom = Date.parse(Boxes.dateFrom.getValue()),
      dateTo = Date.parse(Boxes.dateTo.getValue());
  
  if(isNaN(dateFrom)) { Labels.criteria.error.setValue("Date from must be valid (yyyy-MM-dd)."); }
  else
  if(isNaN(dateTo)) { Labels.criteria.error.setValue("Date to must be valid (yyyy-MM-dd)."); }
  else
  if(dateFrom>dateTo) { Labels.criteria.error.setValue("Dates must be a valid interval."); }
  else
  {
    Explorer.dateFrom = Boxes.dateFrom.getValue();
    Explorer.dateTo = Boxes.dateTo.getValue();
    Explorer.variable = Select.variable.getValue();
    invalidateChart(Explorer.selected, Explorer.dateFrom, Explorer.dateTo);
  }
}

function main()
{
  // Initialize the UI
  Map.setControlVisibility(false);
  Map.setControlVisibility({scaleControl: true, zoomControl: true});
  Map.style().set({cursor: 'crosshair'});
  Map.centerObject(overlay);
  Map.addLayer(overlay.style(Styles.countries));
  Map.add(Labels.title)
  Map.add(Panels.results);
  Map.add(Panels.criteria);
  clearSelected();
  Map.onClick(selectClick);
}

main();