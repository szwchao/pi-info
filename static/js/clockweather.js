var he_key = "yourkey"
var city = "苏州"

$(function() {
    // clock
    let clock = setInterval(setTime, 1000);
    let data = setInterval(setData, 1000 * 60 * 10);
    let aqi = setInterval(setAQI, 1000 * 60 * 10);
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

    setData();
    setAQI();
});

function setData() {
    var url = "https://free-api.heweather.com/s6/weather?location=" + city + "&key=" + he_key;
    $.getJSON(url, function(data) {
        console.log(data);
        // 天气动画
        var result = data.HeWeather6[0];

        // city: "苏州",
        $("#city").text(result.basic.city);

        // 天气动画
        var code = result.now.cond_code;
        var myDate = new Date();
        var currentHour = myDate.getHours();
        var daylight = true;
        if (currentHour > 17 || currentHour < 6) {
            daylight = false;
        } else {
            daylight = true;
        }
        var animation = "sunny"
        if (code == 100) {
            if (daylight) {
                animation = "sunny";
            } else {
                animation = "starry";
            }
        } else if (code >= 101 && code <= 104) {
            animation = "cloudy"
        } else if (code >= 300 && code <= 313) {
            if (code >= 310 && code <= 312) {
                animation = "stormy"
            } else {
                animation = "rainy"
            }
        } else if (code >= 400 && code <= 407) {
            animation = "snowy"
        }
        $("#weather_icon").attr("class", animation);

        // 当前
        var now = result.now;
        $("#temperature-now").text(now.tmp);
        $("#temperature-now").append("<sup><small>°C</small> </sup>");

        var icon_link_head = '<img src="./static/img/';
        var icon_link_tail = '.png" height="70" width="70"</img>';
        var forecast = result.daily_forecast;
        for (var i = 0; i < 3; ++i) {
            if (forecast[i].cond_txt_d != forecast[i].cond_txt_n) {
                txt = forecast[i].cond_txt_d + "转" + forecast[i].cond_txt_n;
                icon = icon_link_head + forecast[i].cond_code_d + icon_link_tail;
                var icon_code_night = forecast[i].cond_code_n;
                if (icon_code_night == 100 || icon_code_night == 103) {
                    icon_code_night = icon_code_night + "_night";
                }
                icon += icon_link_head + icon_code_night + icon_link_tail;
            } else {
                txt = forecast[i].cond_txt_d;
                icon = icon_link_head + forecast[i].cond_code_d + icon_link_tail;
            }
            $(".weather" + i).text(txt);
            $(".temp" + i).text(forecast[i].tmp_min + "℃ / " + forecast[i].tmp_max + "℃");
            //"wind": "东风3-4级", TODO 也可能是“东北风微风”，不应该加“级”
            $(".wind" + i).text(forecast[i].wind_dir + forecast[i].wind_sc + "级");
            $("#icon" + i).html(icon);
        }
    });

}

function setAQI() {
    var url = "https://free-api.heweather.com/s6/air/now?location=" + city + "&key=" + he_key;
    $.getJSON(url, function(data) {
        console.log(data);
        var result = data.HeWeather6[0];
        // AQI
        jg.refresh(result.air_now_city.aqi);
    });
}
