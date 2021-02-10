# -*- coding: utf-8 -*-
"""
Created on Tue Feb  2 22:58:58 2021

@author: B27438
"""
import ee

class Territory:
    REGION_FIELD = "country_na"
    COUNTRY_FIELD = "country_co"
    # Class properties
    db = ee.FeatureCollection("USDOS/LSIB_SIMPLE/2017")

    @classmethod
    def getCountries(cls, countries):
        operation = cls.db\
            .filter(
                ee.Filter.And(
                    ee.Filter.inList(Territory.COUNTRY_FIELD, ee.List(countries)),
                    ee.Filter.stringContains(Territory.REGION_FIELD, '(').Not()
                    )
                )
   
        return operation