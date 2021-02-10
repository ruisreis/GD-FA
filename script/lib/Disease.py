# -*- coding: utf-8 -*-
"""
Created on Tue Feb  2 23:01:55 2021

@author: B27438
"""
import ee

class Disease:
    CONTINENT = "continentExp"
    REGION = "countriesAndTerritories"
    COUNTRY = "fips"
    DATE = "system:time_start"
    DEATHS = "deaths_weekly"
    CASES = "cases_weekly"
    POPULATION = "popData2019"
    # European Union FIPS country codes
    EUROPEAN_UNION = ["RO", "FI", "IT", "MT", "HR", "GR", "BU", "PO", "SP", "FR",
                      "SW", "DA", "EN", "LG", "LH", "PL", "GM", "EZ", "LO", "HU",
                      "SI", "AU", "LU", "NL", "BE", "EI", "CY" ]
    
    # Class properties
    db =ee.FeatureCollection("users/ruisreis/COVID19-20210127")
    
    @classmethod
    def getCountries(cls, countries, date_start=None, date_end=None):
        operation = cls.db.filter(ee.Filter.inList(cls.COUNTRY, countries))
        if not(date_start is None) and not(date_end is None):
            operation = operation.filter(ee.Filter.And(
                ee.Filter.gte(cls.DATE, ee.Date(date_start))
                ,ee.Filter.lte(cls.DATE, ee.Date(date_end))));
        return operation
    
    @classmethod
    def getEuropeanUnion(cls, date_start=None, date_end=None):
        return cls.getCountries(cls.EUROPEAN_UNION, date_start, date_end)