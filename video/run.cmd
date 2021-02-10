rem echo off
set ffmpeg=C:\Tools\usr\ffmpeg\bin

if exist %temp%\temp.$$$ del %temp%\temp.$$$
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
%ffmpeg%\ffmpeg -i "%f1%" -lavfi "subtitles='%f2%':force_style='Alignment=0,OutlineColour=&H100000000,BorderStyle=3,Outline=1,Shadow=0,Fontsize=9,MarginL=5,MarginV=260'" -crf 1 -c:a copy "%temp%\temp.$$$"

goto :end

:help
echo Insert frame labels
echo run [original] [labels] [overlay] [final]
goto :end

:nofile
echo file [%1] does not exist
goto :eof

:end
set ffmpeg=
set f1=
set f2=
set f3=