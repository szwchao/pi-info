Highcharts.setOptions({
    global: {
        useUTC: false
    }
});

function activeLastPointToolip(chart) {
    //console.log(chart.series);
    var points0 = chart.series[0].points;
    var points1 = chart.series[1].points;
    chart.tooltip.refresh([points0[points0.length - 1], points1[points1.length - 1]]);
}
chart = new Highcharts.Chart({
    chart: {
        renderTo: 'temp-chart',
        type: 'spline',
        animation: Highcharts.svg, // don't animate in old IE
        events: {
            load: function() {}
        }
    },
    title: {
        text: '室内温湿度'
    },
    xAxis: {
        type: 'datetime',
        tickPixelInterval: 150,
        crosshair: true
    },
    yAxis: [{ // Primary yAxis
            labels: {
                format: '{value}°C',
                style: {
                    color: Highcharts.getOptions().colors[1]
                }
            },
            min: -10,
            max: 50,
            title: {
                text: '温度',
                style: {
                    color: Highcharts.getOptions().colors[1]
                }
            }
        }, { // Secondary yAxis
            title: {
                text: '湿度',
                style: {
                    color: Highcharts.getOptions().colors[0]
                }
            },
            min: 10,
            max: 100,
            labels: {
                format: '{value}%',
                style: {
                    color: Highcharts.getOptions().colors[0]
                }
            },
            opposite: true
        }],
    tooltip: {
        formatter: function() {
            return '<p style = "font-size: 20px">' + Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.points[0].x) + '</p><br/>'
                + '<p style = "font-size: 20px">温度：'+Highcharts.numberFormat(this.points[0].y, 1) + '°C</p><br/>'
                + '<p style = "font-size: 20px">湿度：' + Highcharts.numberFormat(this.points[1].y, 1) + '%</p>';
        },
        useHTML: true,
        style: {
                fontSize: 20
        },
        shared: true
    },
    legend: {
        enabled: true
    },
    exporting: {
        enabled: false
    },
    series: [{
            name: '温度',
            type: "spline",
            tooltip: {
                valueSuffix: '°C'
            },
            data: (function() { // generate an array of random data
                var data = [],
                    time = (new Date()).getTime(),
                    i;
                for (i = -19; i <= 0; i++) {
                    data.push({
                        x: time + i * 1000,
                        y: 0
                    });
                }
                return data;
            })()
        },
        {
            name: '湿度',
            yAxis: 1,
            tooltip: {
                valueSuffix: '%'
            },
            type: "line",
            data: (function() { // generate an array of random data
                var data = [],
                    time = (new Date()).getTime(),
                    i;
                for (i = -19; i <= 0; i++) {
                    data.push({
                        x: time + i * 1000,
                        y: 0
                    });
                }
                return data;
            })()
        }
    ]
}, function(c) {
    activeLastPointToolip(c)
});

var series = chart.series[0];
var series1 = chart.series[1];

function fillTempHumi() {
    var url = "http://192.168.1.211/"
    $.getJSON(url, function(data) {
        //console.log(data);
        y0 = Number(data.temperature);
        y1 = Number(data.humidity);

        var x = (new Date()).getTime(); // current time
        series.addPoint([x, y0], true, true);
        series1.addPoint([x, y1], true, true);
        activeLastPointToolip(chart)
    });
}

setInterval(function() {
    fillTempHumi();
}, 1000 * 7200);
