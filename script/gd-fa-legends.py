# -*- coding: utf-8 -*-
"""
Created on Mon Feb  8 21:27:26 2021

@author: B27438
"""
import datetime
import dateutil
import ee
ee.Initialize()
from lib.Combined import Combined

def getDates():
    # Get the valid dates for the combined dataset
    dataset = Combined.getData(Combined.EUROPEAN_UNION)\
        .filter(ee.Filter.And(
        ee.Filter.gt("deaths_weekly",0)
        ,ee.Filter.gt("cases_weekly",0)))
    dates = dataset.aggregate_array(Combined.DATE_START).distinct().sort();

    # Load the list of valid dates to a Python list
    return dates.getInfo()

def saveSRT(dates, mask, fps, filename):
    # Generate a SRT file that will legend the video 
    srt = open(filename, "w", newline="")
    # One legend per frame
    frame = 1
    clock = datetime.datetime(2021,1,1,0,0,0)
    for date in dates:
        tick = clock+datetime.timedelta(seconds=fps)
        mark = dateutil.parser.parse(date)
        srt.write("%d\r\n" % frame)
        srt.write("%s.000 --> %s.000\r\n" %(clock.strftime("%H:%M:%S"), tick.strftime("%H:%M:%S")))
        srt.write(mask % (mark.strftime("%Y-%m-%d")))
        srt.write("\r\n\r\n")
        clock = tick
        frame=frame+1
    srt.close()

# Read dates
dates = getDates()
# Generate both files
saveSRT(dates, "Deaths per million (%s)", 1, "../video/deaths.srt")
saveSRT(dates, "Cases per million (%s)", 1, "../video/cases.srt")