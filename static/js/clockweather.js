var darksky_token = "yourtoken"
var baidu_token = "yourtoken"

$(function() {
    // clock
    let clock = setInterval(setTime, 1000);
    let data = setInterval(setData, 1000 * 60 * 10);
    let $time = $('#time');
    let $date = $('#date');
    let $cnDate = $('#cnDate');

    function setTime() {
        moment.locale('zh-cn');
        var cn_date = calendar.solar2lunar();
        $time.html(moment().format('H:mm:ss'));
        $date.html(moment().format('LL dddd'));
        cnDateText = cn_date.IMonthCn + cn_date.IDayCn
        // 判断是否节气
        if (cn_date.isTerm) {
            cnDateText = cnDateText + cn_date.Term;
        }
        $cnDate.html("农历 " + cnDateText)
    }
    jg = new JustGage({
        id: "jg1",
        value: 72,
        min: 0,
        max: 300,
        pointer: true,
        pointerOptions: {
            toplength: 8,
            bottomlength: -20,
            bottomwidth: 6,
            color: '#8e8e93'
        },
        gaugeWidthScale: 0.4,
        hideMinMax: true,
        valueFontColor: "white",
        valueMinFontSize: 24,
        customSectors: [{
            color: "#00ff00",
            lo: 0,
            hi: 50
        }, {
            color: "#ffcc00",
            lo: 50,
            hi: 100
        }, {
            color: "#ff8a00",
            lo: 100,
            hi: 150
        }, {
            color: "#f70000",
            lo: 150,
            hi: 200
        }, {
            color: "#90024c",
            lo: 200,
            hi: 300
        }],
        counter: false
    });

    var url = "http://api.map.baidu.com/location/ip?" + "ak=" + baidu_token + "&coor=bd09ll"
    url = url + "&callback=?" // 添加callback使getJSON识别为jsonp格式，否则报错
    $.getJSON(url, function(json) {
        longitude = json.content.point.x
        latitude = json.content.point.y
        setData();
    });
});

function setDataByDarkSky() {
    var url = "https://api.darksky.net/forecast/"+ darksky_token + "/" + latitude + "," + longitude + "?lang=zh&units=ca"
    url = url + "&callback=?" // 添加callback使getJSON识别为jsonp格式，否则报错
    $.getJSON(url, function(json) {
        // 天气动画
        var icon = json.currently.icon
        var animation = "sunny"
        if (icon.match("clear") && icon.match("day")) {
            animation = "sunny"
        } else if (icon.match("clear") && icon.match("night")) {
            animation = "starry"
        } else if (icon.match("cloudy")) {
            animation = "cloudy"
        } else if (icon.match("rain")) {
            animation = "rainy"
        } else if (icon.match("snow")) {
            animation = "snowy"
        } else if (icon.match("storm")) {
            animation = "stormy"
        }
        $("#weather_icon").attr("class", animation);
    });
}

function setDataByBaidu() {
    var url = "http://api.map.baidu.com/telematics/v3/weather?location=" + longitude + "," + latitude + "&output=json&ak=" + baidu_token
    url = url + "&callback=?" // 添加callback使getJSON识别为jsonp格式，否则报错
    $.getJSON(url, function(json) {
        //"pm25": "50",
        //$("#pm25").text(json.results[0].pm25);
        jg.refresh(json.results[0].pm25);
        //"currentCity": "苏州",
        $("#city").text(json.results[0].currentCity);

        // 今天
        var weather_today = json.results[0].weather_data[0];
        //"date": "周五 01月06日 (实时：10℃)",
        var temp = weather_today.date.split(" ")[2];
        var s_i = temp.indexOf("：") + 1;
        var e_i = temp.indexOf("℃");
        $("#temperature-now").text(temp.substring(s_i, e_i));
        $("#temperature-now").append("<sup><small>°C</small> </sup>")

        //所有天气情况（”|”分隔符）：晴|多云|阴|阵雨|雷阵雨|雷阵雨伴有冰雹|雨夹雪|小雨|中雨|大雨|暴雨|大暴雨|特大暴雨|阵雪|小雪|中雪|大雪|暴雪|雾|冻雨|沙尘暴|小雨转中雨|中雨转大雨|大雨转暴雨|暴雨转大暴雨|大暴雨转特大暴雨|小雪转中雪|中雪转大雪|大雪转暴雪|浮尘|扬沙|强沙尘暴|霾
        var weather_dict = {
            "晴": "clear-",
            "多云": "partly-cloudy-",
            "阴": "cloudy",
            "雨": "rain",
            "雪": "snow",
            "雷阵雨": "thunderstorm",
            "冻雨":"sleet",
            "雾":"fog",
            //"风":"wind",
        }

        function icon_text(weather) {
            function getWeatherIcon(w, is_day_night) {
                var day_night = "";
                var index = "";
                if (w.match("晴") || w.match("多云")) {
                    day_night = is_day_night;
                } else {
                    day_night = "";
                }
                if (w.match("雪")) {
                    index = "雪";
                } else if (w.match("雨")) {
                    if (w.match("雷阵雨")) {
                        index = "雷阵雨";
                    }else if (w.match("冻雨")) {
                        index = "冻雨";
                    } else {
                        index = "雨";
                    }
                } else if (w.match("雾")) {
                    index = "雾";
                } else {
                    index = w;
                }
                return weather_dict[index] + day_night;
            }
            //font-icon
            //var icon_link_head = '<i class="wi wi-forecast-io-';
            //var icon_link_tail = '"></i>';
            //svg animation - high cpu load
            //var icon_link_head = '<object type="image/svg+xml" data="./static/svg/';
            //var icon_link_tail = '.svg" width="64" height="64"> </object>';
            //png image - low cpu load
            var icon_link_head = '<img src="./static/img/';
            var icon_link_tail = '.png" height="60" width="88"</img>';

            //"weather": "小雨转中雨",
            var w = weather.split("转");
            var i = "";
            var day_night = "";
            var index = "";
            if (w[0]) {
                i += icon_link_head + getWeatherIcon(w[0], "day") + icon_link_tail;
            }
            if (w[1]) {
                i += icon_link_head + getWeatherIcon(w[1], "night") + icon_link_tail;
            }
            return i;
        }

        function split_temperature(temp) {
            //"temperature": "12 ~ 10℃"
            var t = temp.replace("℃", "").split("~");
            if (t[1]) {
                return $.trim(t[1]) + "℃ / " + $.trim(t[0]) + "℃";
            } else {
                return $.trim(t[0]) + "℃";
            }
        }

        for (var i = 0; i < 3; ++i) {
            var data = json.results[0].weather_data[i];
            $(".weather" + i).text(data.weather);
            $(".temp" + i).text(split_temperature(data.temperature));
            //"wind": "东风3-4级",
            $(".wind" + i).text(data.wind);
            $("#icon" + i).html(icon_text(data.weather));
        }
    });
}

function setData() {
    setDataByBaidu();
    setDataByDarkSky();
}
