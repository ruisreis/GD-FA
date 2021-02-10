# -*- coding: utf-8 -*-
"""
CODIV-19 Dataset country code conversion

Support script to translate between ISO country codes present in the dataset
using a convertion dictionary
"""
import csv
from datetime import datetime

"""
The mapping dictionary will allways be well delimited and is sure not to cause
any overwelming of the process memory.
"""
def getFIPStoISO(filename):
    source = open(filename, newline="")
    reader = csv.reader(source)
    mapdict = {}
    # Skip header
    next(reader)
    for row in reader:
        mapdict[row[0]]=row[1]
    source.close()
    
    return mapdict

"""
The size of the COVID-19 dataset is unknown, the process must not make any
assumptions. No memory cache will be used.
"""
def preprocess(infilename, outfilename, mapdict):
    # Dataset fields
    DATEREP = 0
    YEAR_WEEK = 1
    CASES_WEEKLY = 2
    DEATHS_WEEKLY = 3
    COUNTRIESANDTERRITORIES = 4
    GEOID = 5
    COUNTRYTERRITORYCODE = 6
    POPDATA2019 = 7
    CONTINENTEXP = 8
    NOTIFICATION_RATE_PER_100000_POPULATION_14_DAYS = 9
    
    source = open(infilename, newline="")
    target = open(outfilename, "w", newline="")
    reader = csv.reader(source)
    writer = csv.writer(target)
    
    for row in reader:
        if reader.line_num==1:
            # Add a field to the header
            row.append("fips")
            # Rename the date column do easee GEE asset ingestion 
            row[DATEREP] = "system:time_start"
            writer.writerow(row)
        else:
            # Convert date
            date = datetime.strptime(row[DATEREP], "%d/%m/%Y")
            row[DATEREP] = date.isoformat()
            if row[COUNTRYTERRITORYCODE] in mapdict.keys():
                # Existing FIPS code, add it
                row.append(mapdict[row[COUNTRYTERRITORYCODE]])
            else:
                # Unknow FIPS code, add a placeholder
                row.append("$$$")
            writer.writerow(row)
            
    source.close()
    target.close()

mapper = getFIPStoISO("../data/FIPS_ISO.csv")
preprocess("../data/COVID19-20210204.csv", "../data/COVID19-20210204-FIPS.csv", mapper)
