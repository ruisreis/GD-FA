# -*- coding: utf-8 -*-
"""
Created on Mon Feb  8 21:09:15 2021

@author: B27438
"""

import ee

class Combined:
    DATE_START = "system:time_start"
    DATE_END = "system:time_end"
    REGION = "countriesAndTerritories"
    COUNTRY = "fips"
    DEATHS = "deaths_weekly"
    CASES = "cases_weekly"
    DEATHS_M = "deaths"
    CASES_M = "cases"
    # European Union FIPS country codes
    EUROPEAN_UNION = [  "RO", "FI", "IT", "MT", "HR", "GR", "BU", "PO", "SP", "FR",
                        "SW", "DA", "EN", "LG", "LH", "PL", "GM", "EZ", "LO", "HU",
                        "SI", "AU", "LU", "NL", "BE", "EI", "CY" ]
    
    # Class properties
    db = ee.FeatureCollection("users/ruisreis/COVID19-CLIMATE-DS-PY")
    
    @classmethod
    def getData(cls, countries):
        operation = cls.db.filter(ee.Filter.inList(cls.COUNTRY, countries))
        return operation
