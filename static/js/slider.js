// code borrow from: http://www.webdeveasy.com/pages-slider-with-javascript-and-css/

var HOME_PAGE = 1;

(function($) {
    var PagesSlider = function (slider, options) {
        this.options = $.extend({
            endDuration: 300
        }, options);

        this.slider = slider;
        this.content = slider.children().first();
        this.currentIndex = 0;
        this.pages = this.content.children();
        this.slider.width(this.pages.first().width());

        var totalWidth = 0;
        this.pages.each(function (index, page) {
            totalWidth += $(page).width();
        });
        this.content.width(totalWidth);

        this.bindEvents();
        this.count = 10;
        this.start_timer = false;
        this.goToIndex(HOME_PAGE);
        setInterval(this.timeout.bind(this), 1000);  // bind this, 否则this指向window了

    };
    $.extend(PagesSlider.prototype, {
        timeout: function () {
            if (this.start_timer) {
                if (this.count == 0) {
                    this.goToIndex(HOME_PAGE);
                    this.start_timer = false;
                } else {
                    this.count--;
                }
            }
        },
        bindEvents: function () {
            this._removeTransition = $.proxy(this.removeTransition, this);
            //this._doubleclick = $.proxy(this.doubleClick, this);
            this._startDrag = $.proxy(this.startDrag, this);
            this._doDrag = $.proxy(this.doDrag, this);
            this._endDrag = $.proxy(this.endDrag, this);
            this._timeout = $.proxy(this.timeout, this);

            this.content
                .on('dragstart', this._startDrag)
                .on('transitionend', this._removeTransition);
                //.on('dblclick', this._doubleclick);
            $('body')
                .on('drag', this._doDrag)
                .on('dragend', this._endDrag);
        },
        destroy: function () {
            this.content
                .off('dragstart', this._startDrag)
                .off('transitionend', this._removeTransition);
                //.off('dblclick', this._doubleclick);
            $('body')
                .off('drag', this._doDrag)
                .off('dragend', this._endDrag);
        },
        doubleClick: function (event) {
            //this.enableDrag = true;
            //this.dragStartX = event.clientX;
            if (this.currentIndex == 1)
            {
                this.next();
                //this.start_timer = true;
                this.count = 5;
            } else {
                this.start_timer = false;
                this.prev();
            }
            this.render();
        },
        startDrag: function (event) {
            this.enableDrag = true;
            this.dragStartX = event.gesture.deltaX;
        },
        doDrag: function (event) {
            if (this.enableDrag) {
                var position = this.pages.eq(this.currentIndex).position();
                var delta = event.clientX - this.dragStartX;

                this.content.css('transform', 'translate3d(' + (delta - position.left) + 'px, 0, 0)');
                event.preventDefault();
            }
        },
        endDrag: function (event) {
            if (this.enableDrag) {
                this.enableDrag = false;

                var delta = event.gesture.deltaX;
                if (Math.abs(delta) > this.slider.width() / 5) {
                    if (this.currentIndex == 1)
                    {
                        this.count = 60;
                        this.start_timer = true;
                    } else {
                        this.start_timer = false;
                    }
                    if (delta < 0) {
                        this.next();
                    } else {
                        this.prev();
                    }
                    this.render();
                } else {
                    this.current();
                }
            }
        },
        removeTransition: function() {
            this.content.css('transition', 'none');
        },
        goToIndex: function (index) {
            var position = this.pages.eq(index).position();

            this.content
                .css('transition', 'all ' + this.options.endDuration + 'ms ease')
                .css('transform', 'translate3d(' + (-1 * (position.left)) + 'px, 0, 0)');

            this.currentIndex = index;
        },
        current: function () {
            this.goToIndex(this.currentIndex);
        },
        next: function () {
            if (this.currentIndex >= this.pages.length - 1) {
                this.current();
            } else {
                this.goToIndex(this.currentIndex + 1);
            }
        },
        prev: function () {
            if (this.currentIndex <= 0) {
                this.current();
            } else {
                this.goToIndex(this.currentIndex - 1);
            }
        },
        render: function () {
            if (this.currentIndex == 2)
            {
                // 切换到第二页时向右滑动
                var timeline = document.querySelector(".timeline ol");
                timeline.style.transform = "translateX(" + 0 + "px)";
                timeline.style.transform = "translateX(-" + 480 + "px)";
                document.querySelector(".timeline .arrows .arrow__next").click();
                
                // json数据格式如下
                // {'busline': [{'we_arrived': None, 'station': '星海广场首末站', 'ew_arrived': '20:16:41'}, {'we_arrived': None, 'station': '都市花园', 'ew_arrived': None}, {'we_arrived': None, 'station': '青年公社', 'ew_arrived': '20:34:05'},], 'we_dist': 4, 'query_station': '东沙湖学校', 'ew_dist': 7}
                var url = 'http://127.0.0.1:5000/json'
                $.getJSON(url, function(data) {
                    if (data != null) {
                        console.log(data);
                        var content = "";
                        for (var i = 0; i < data.busline.length; ++i) {
                            content += '<li><div class="status noselect" id="bus' + (i+1) + '"><time_bot class="noselect">'
                            if (data.busline[i].we_arrived) {
                                content += data.busline[i].we_arrived;
                            }
                            content += '</time_bot><time_up class="noselect">'
                            if (data.busline[i].ew_arrived) {
                                content += data.busline[i].ew_arrived;
                            }
                            content += '</time_up><span></span><h4 class="noselect">'
                            content +=  data.busline[i].station + '</h4></div></li>'
                        }
                        $("#station_info").html(content);
                        if (data.we_dist > 0) {
                            $("#nearest_we").text("距" + data.query_station + "还有" + data.we_dist + "站")
                        } else {
                            $("#nearest_we").text("已无车")
                        }
                        if (data.ew_dist > 0) {
                            $("#nearest_ew").text("距" + data.query_station + "还有" + data.ew_dist + "站")
                        } else {
                            $("#nearest_ew").text("已无车")
                        }
                    } else {
                        $("#nearest_ew").text("无法获取公交信息")
                        $("#nearest_we").text("无法获取公交信息")
                    }
                });
            } else if (this.currentIndex == 0) {
                fillTempHumi();
            }
        }
    });

    $.fn.pagesSlider = function(options) {
        this.hammer();
        this.each(function(index, slider) {
            var $this = $(slider);
            var pagesSlider = new PagesSlider($this, options);
            $this.data('pagesSlider', pagesSlider);
        });
        return this;
    };
})(jQuery);

$(function() {
    $('.slider').pagesSlider();
});
