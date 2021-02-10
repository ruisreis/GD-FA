@echo off
set ffmpeg=C:\Tools\usr\FFMPEG\bin
set tf=%temp%\temp.$$$.mp4
if exist %tf% del %tf%
if [%1]==[] goto :help
if [%2]==[] goto :help
if [%3]==[] goto :help
if [%4]==[] goto :help
set f1=%CD%\%1
set f2=%CD%\%2
set f3=%CD%\%3
set f4=%CD%\%4

if exist %f1% goto :f2
call :nofile %f1%
goto :end
:f2
if exist %f2% goto :f3
call :nofile %f2%
goto :end
:f3
if exist %f3% goto :go
call :nofile %f3%
goto :end
:go
set f2=%f2:\=/%
set f2=%f2::=\\:%
%ffmpeg%\ffmpeg -i "%f1%" -lavfi "subtitles=%f2%:force_style='Alignment=0,OutlineColour=&H100000000,BorderStyle=3,Outline=1,Shadow=0,Fontsize=9,MarginL=5,MarginV=260'" -crf 1 -c:a copy "%tf%"
%ffmpeg%\ffmpeg -i %tf% -i %f3% -filter_complex "[0]scale='iw-mod(iw,2)':'ih-mod(ih,2)'[m];[m][1]overlay=10:80" %f4%

goto :end

:help
echo Insert frame labels
echo run [original] [labels] [overlay] [final]
goto :end

:nofile
echo file [%1] does not exist
goto :eof

:end
set f1=
set f2=
set f3=
set f4=

rem run GD-COVID-CASES.mp4 cases.srt cases.png GD-FA-COVID-CASES.mp4
rem run GD-COVID-DEATHS.mp4 deaths.srt deaths.png GD-FA-COVID-DEATHS.mp4