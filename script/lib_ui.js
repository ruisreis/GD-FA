// Visualization palette for temperature (mean, min and max) and 2m dewpoint
// temperature
var vis2mt = {
  min: 250,
  max: 320,
  palette: [
    '#000080', '#0000D9', '#4000FF', '#8000FF', '#0080FF', '#00FFFF', '#00FF80',
    '#80FF00', '#DAFF00', '#FFFF00', '#FFF500', '#FFDA00', '#FFB000', '#FFA400',
    '#FF4F00', '#FF2500', '#FF0A00', '#FF00FF'
  ]
};

exports.palettes = {
  temperature: [
    '#000080', '#0000D9', '#4000FF', '#8000FF', '#0080FF', '#00FFFF', '#00FF80',
    '#80FF00', '#DAFF00', '#FFFF00', '#FFF500', '#FFDA00', '#FFB000', '#FFA400',
    '#FF4F00', '#FF2500', '#FF0A00', '#FF00FF'
  ]
}
// Legend style constants
var LegendStyle = 
    {
      Title : {
        fontSize: '20px',
        fontWeight: 'bold',
        stretch: 'horizontal',
        textAlign: 'center',
        margin: '4px',
      },
      Normal : {
        fontSize: '10px',
        stretch: 'horizontal',
        textAlign: 'center',
        margin: '4px',
      },
      Footnote : {
        fontSize: '10px',
        stretch: 'horizontal',
        textAlign: 'center',
        margin: '4px',
      }
    },
    PopulationStyle = {
      min: 0,
      max: 1,
      palette: ['lightyellow', 'steelblue', 'darkblue']
    },
    CountriesStyle = {color: '26458d', fillColor: '00000000'},
    HighlightStyle = {color: '8856a7', fillColor: '8856a7C0'};
    
var POPULATION_VIS_MAX_VALUE = 1200;
var POPULATION_VIS_NONLINEARITY = 4;

function ColorBar(width, height, palette)
{
    return ui.Thumbnail({
      image: ee.Image.pixelLonLat().select(0),
      params: {
        bbox: [0, 0, 1, 0.1],
        dimensions: String(width)+'x'+String(height),
        format: 'png',
        min: 0,
        max: 1,
        palette: palette,
      },
      style: {stretch: 'horizontal', margin: '0px 8px'},
    });  
}

function undoColorStretch(val) {
  return Math.pow(val, POPULATION_VIS_NONLINEARITY) * POPULATION_VIS_MAX_VALUE;
}

function LegendGauge()
{
    var labelPanel = ui.Panel(
      [
        ui.Label(Math.round(undoColorStretch(0)), {margin: '4px 8px'}),
        ui.Label(
            Math.round(undoColorStretch(0.5)),
            {margin: '4px 8px', textAlign: 'center', stretch: 'horizontal'}),
        ui.Label(Math.round(undoColorStretch(1)), {margin: '4px 8px'})
      ],
      ui.Panel.Layout.flow('horizontal'));
  return ui.Panel([ColorBar(100, 10, PopulationStyle.palette), labelPanel]);
}

exports.LegendPanel = function()
{
    return ui.Panel(
      [
        ui.Label('Densidade populacional', LegendStyle.Title),
        LegendGauge(),
        ui.Label('(milhares de pessoas por km^2)', LegendStyle.Normal),
        ui.Label('Fontes: Global Human Settlement Layer (JRC)', LegendStyle.Normal),
        ui.Label('e USDOS LSIB', LegendStyle.Normal)
      ],
      ui.Panel.Layout.flow('vertical'),
      {width: '330px', position: 'bottom-left'});
}