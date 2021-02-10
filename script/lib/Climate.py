# -*- coding: utf-8 -*-
"""
ERA5 climate dataset wrapper
"""
import ee
from .Territory import Territory
from .ClimateResult import ClimateResult
   
class Climate:
    TEMP_MEAN = "mean_2m_air_temperature"
    TEMP_MAX = "maximum_2m_air_temperature"
    TEMP_MIN = "minimum_2m_air_temperature"
    RAIN = "total_precipitation"
    PRESSURE = "surface_pressure"
    DATE_START = "system:time_start"
    DATE_END = "system:time_end"
    ISO_MASK = "yyyy-MM-dd'T'HH:mm:ss"
    SCALE = 1000
    
    # Class properties
    db = ee.ImageCollection("ECMWF/ERA5/DAILY")
    
    @classmethod
    def getAggregate(cls, country, date_start, date_end):
        geometry = Territory.getCountries([country]).geometry()
        operation = cls.db\
                        .select([cls.TEMP_MEAN, cls.TEMP_MIN, cls.TEMP_MAX, cls.RAIN, cls.PRESSURE])\
                        .filter(ee.Filter.date(date_start, date_end))\
                        .mean()\
                        .reduceRegion(ee.Reducer.mean(), geometry, cls.SCALE)
        bounds = {};
        bounds[cls.DATE_START] = date_start.format(cls.ISO_MASK);
        bounds[cls.DATE_END] = date_end.format(cls.ISO_MASK);
      
        return ClimateResult(operation, bounds, geometry)