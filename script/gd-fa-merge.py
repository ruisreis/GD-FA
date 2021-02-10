# -*- coding: utf-8 -*-
"""
COVID-19 feature collection consolidation to aggregate climate data
"""
import ee
# Initialize the GEE API session
ee.Initialize()

from lib.Climate import Climate
from lib.Disease import Disease
    
# Handle each COVID19 record, data for a (date,country) pair
def mapDateCountry(feature):
    #Each entry in the dataset represents a weekly aggregate
    date_end = ee.Date(feature.getString(Disease.DATE))
    date_start = date_end.advance(-7, "day")
  
    # Obtain the climate reduced aggregate for the week and country
    aggregate = Climate.getAggregate(feature.getString(Disease.COUNTRY), date_start, date_end);
  
    # Compose the new dataset record, using the country geometry to ease further band calculation
    # Keep the relevant existing COVID19 dataset fields
    # Add the climate fields, include the weekly bounding dates and relative values
    new_feature = ee.Feature(aggregate.geometry)\
        .copyProperties(feature, [Disease.COUNTRY, Disease.REGION, Disease.CASES, Disease.DEATHS, Disease.POPULATION])\
        .set(aggregate.operation)\
        .set(aggregate.bounds)\
        .set({ 
            "deaths": feature\
                .getNumber(Disease.DEATHS)\
                .multiply(1e6)\
                .divide(feature.getNumber(Disease.POPULATION)),\
            "cases": feature\
                .getNumber(Disease.CASES)\
                .multiply(1e6)\
                .divide(feature.getNumber(Disease.POPULATION))})

    return new_feature

def main():
    # Read the COVID19 imported asset
    # Filter the European Union country data and map each record
    dataset = Disease\
                .getEuropeanUnion()\
                .map(mapDateCountry)
    
    job = ee.batch.Export.table.toAsset(dataset, "COVID19-PY", assetId="users/ruisreis/COVID19-CLIMATE-DS-PY")
    job.start();

main()