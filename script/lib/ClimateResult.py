# -*- coding: utf-8 -*-
"""
Class to wrap an ERA5 climate aggregation map result
"""
class ClimateResult:
    def __init__(self, operation, bounds, geometry):
        self.__operation = operation
        self.__bounds = bounds
        self.__geometry = geometry
        
    @property
    def operation(self):
        return self.__operation
    
    @property
    def bounds(self):
        return self.__bounds
    
    @property
    def geometry(self):
        return self.__geometry