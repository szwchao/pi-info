# 基于树莓派的时钟和天气预报

一款基于树莓派以及官方屏幕的时钟和天气预报。静态网页，基于webkit的浏览器都可以打开，但屏幕仅适配于官方7寸屏，实时天气数据来源于darksky，未来三天预报和PM2.5来源于百度。

![](image.jpg)

## 使用方法

1. 申请百度开发者账号获得token
2. 申请DarkSky账号获得token
3. 修改`static/js/clockweather.js`分别填入token

## API调用

百度API：

http://lbsyun.baidu.com/index.php?title=car/api/weather

DarkSky API：

https://darksky.net/dev/docs/forecast
