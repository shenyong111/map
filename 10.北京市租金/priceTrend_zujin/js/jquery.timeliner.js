(function($) {
    jQuery.fn.timeliner = function (n) {
        var o = $.extend({
            containerwidth: $(document).width() - 160,
            containerheight: 77,
            showpauseplay: true,
            showprevnext: false,
            controls_always_visible: true,
            timelinewidth: $(document).width() - 200,
            timelineheight: 6,
            timelinehorizontalmargin: 'auto',
            timelineverticalmargin: 30,
            timelineposition: 'bottom',
            showtimedisplay: false,
            timedisplayposition: 'above',
            showtotaltime: false,
            showtooltip: true,
            showtooltiptime: false,
            tooltipposition: 'above',
            interval: 1.5, //时间间隔
            repeat: true,
            autoplay: false,
            keyboard: true,
            transition: 'slide'
        }, n);
        $(this).each(function () {
            function getdisplaytime(a) {
                var b = Math.floor(a / 60);
                a = (a - (b * 60));
                if (a < 10) {
                    a = '0' + a
                }
                return b + ':' + a
            }

            var c, prenodepos = [0],
                nodepos = [0, 0],
                nodesec = [0, 0],
                nodeinterval = [0],
                targetpos, x = 1,
                activenode = 1,
                seconds = 0,
                timeinterval, totaltime = 0,
                playing = false,
                started = false,
                timeremaining, animationtime, $container = $(this).show(),
                $slides = $container.find('> li'),
                $timeline = $('<li class="timeline"></li>').prependTo($container),
                $innertimeline = $('<div class="innertimeline">&nbsp;</div>').prependTo($timeline),
                nodes = $slides.length;
            if (o.showtimedisplay) {
                var d = $('<div class="timedisplay">0:00</div>').prependTo($timeline);
                if (o.showtotaltime) {
                    d.append(' / 0:00')
                }
                var f = Math.round(d.outerWidth(true) / 2)
            }
            if (o.showpauseplay) {
                var g = $('<li class="play"></li>').prependTo($container).animate({
                    opacity: 0
                }, 0);
                if (o.showprevnext) {
                    var h = $('<li class="previous"></li>').prependTo($container).animate({
                        opacity: 0
                    }, 0);
                    var i = $('<li class="next"></li>').prependTo($container).animate({
                        opacity: 0
                    }, 0)
                }
            }
            $slides.each(function () {
                var a = $(this);
                a.addClass('slide').addClass('slide' + x).data('title', a.attr('title')).removeAttr('title').animate({
                    opacity: 0
                }, 0);
                if (x < nodes || o.repeat) {
                    if (a.attr('lang')) {
                        nodeinterval[x] = parseInt(a.attr('lang'), 10)
                    } else {
                        nodeinterval[x] = o.interval
                    }
                    totaltime = +totaltime + nodeinterval[x]
                } else {
                    nodeinterval[x] = 0
                }
                nodesec[x] = +nodesec[(x - 1)] + nodeinterval[(x - 1)];
                x++
            });
            x = 1;
            if (o.timelinehorizontalmargin == 'auto') {
                c = (o.containerwidth - o.timelinewidth)
            } else {
                c = o.timelinehorizontalmargin
            }
            var j = getdisplaytime(totaltime);
            for (x = 1; x < (nodes + 1); x++) {
                $('<div class="node node' + x + '"></div>').appendTo($timeline).data('id', x)
            }
            var k = $timeline.find('.node');
            x = 1;
            var l = k.outerWidth(true),
                nodeheight = k.outerHeight(true),
                halfnodewidth = Math.round(l / 2);
            k.each(function (ii, nn) {
                var a = $(this);
                prenodepos[x] = ((nodeinterval[(x - 1)] / totaltime) * 100).toFixed(4);
                nodepos[x] = +nodepos[(x - 1)] + Math.round(o.timelinewidth * (prenodepos[x] / 100));
                a.css({
                    left: (nodepos[x] - halfnodewidth),
                    top: -(Math.round(nodeheight / 2) - Math.round(o.timelineheight / 2))
                });
                if (o.showtooltip) {
                    var b = $container.find('.slide' + x).data('title');
                    if (b) {
                        let tmpArr = b.length;
                        if(tmpArr == 4){
                            a.prepend('<div style="color: red; font-weight: bold; font-size: 14px" class="tooltip" value="' + b + '">' + (ii % 1 == 0 || ii == k.length - 1 ? b : '') + '</div>')
                        }else{
                            a.prepend('<div class="tooltip" value="' + b + '">' + (ii % 1 == 0 || ii == k.length - 1 ? b : '') + '</div>')
                        }
                        // let tmpArr = b.split('年')
                        // if (tmpArr.length > 1) {
                        //     if (tmpArr[1] == "") {
                        //         a.prepend('<div style="color: red; font-weight: bold; font-size: 14px" class="tooltip" value="' + b + '1月">' + (ii % 1 == 0 || ii == k.length - 1 ? tmpArr[0] : '') + '年</div>')
                        //     } else {
                        //         a.prepend('<div class="tooltip" value="' + b + '">' + (ii % 1 == 0 || ii == k.length - 1 ? tmpArr[1] : '') + '</div>')
                        //     }
                        // }
                    }
                }
                if (o.showtooltiptime) {
                    a.find('.tooltip').prepend('<label class="tooltiptime">' + getdisplaytime(nodesec[x]) + '</label><br>')
                }
                x++
            });
            if (o.showtooltip) {
                var m = $container.find('.tooltip')
            }
            $container.css({
                width: o.containerwidth,
                height: o.containerheight
            });
            if (o.transition == 'slide' || o.transition == 'reveal' || o.transition == 'cover') {
                $container.css({
                    // overflow: 'hidden'
                })
            }
            $slides.css({
                width: o.containerwidth,
                height: o.containerheight
            });
            $timeline.css({
                width: o.timelinewidth,
                height: o.timelineheight,
                margin: c,
                marginTop: o.timelineverticalmargin,
                marginBottom: o.timelineverticalmargin
            }).css(o.timelineposition, 0);
            $innertimeline.css({
                height: o.timelineheight
            });
            if (o.showtimedisplay && o.timedisplayposition == 'below') {
                d.css({
                    top: (o.timelineheight + 5),
                    left: -f
                })
            } else if (o.showtimedisplay) {
                d.css({
                    bottom: (o.timelineheight + 5),
                    left: -f
                })
            }
            if (o.showtooltip) {
                if (o.tooltipposition == 'below') {
                    m.css({
                        top: nodeheight + 5
                    })
                } else {
                    m.css({
                        bottom: nodeheight + 5
                    })
                }
                m.each(function () {
                    var a = $(this);
                    a.css({
                        left: -(Math.round(a.outerWidth(true) / 2) - halfnodewidth)
                    })
                })
            }
            if (o.showpauseplay) {
                g.css({
                    top: (Math.round(o.containerheight / 2) - Math.round(g.outerHeight(true) / 2)),
                    //播放、暂停按钮样式
                    left: -77
                });
                if (o.showprevnext) {
                    h.css({
                        top: (Math.round(o.containerheight / 2) - Math.round(h.outerHeight(true) / 2)),
                        right: (Math.round(o.containerwidth / 2) + Math.round(g.outerWidth(true) / 2))
                    });
                    i.css({
                        top: (Math.round(o.containerheight / 2) - Math.round(i.outerHeight(true) / 2)),
                        left: (Math.round(o.containerwidth / 2) + Math.round(g.outerWidth(true) / 2))
                    })
                }
            }
            $slides.each(function () {
                var a = $(this);
                if (a.outerWidth() > o.containerwidth) {
                    a.width((a.width() - parseInt(a.css('paddingLeft'), 10) - parseInt(a.css('paddingRight'), 10)))
                }
                if (a.outerHeight() > o.containerheight) {
                    a.height((a.height() - parseInt(a.css('paddingTop'), 10) - parseInt(a.css('paddingBottom'), 10)))
                }
            });

            function dtime(a) {
                d.html(getdisplaytime(a));
                if (o.showtotaltime) {
                    d.append(' / ' + j)
                }
            }

            function time_start(a) {
                dtime(a);
                timeinterval = setInterval(function () {
                    seconds++;
                    dtime(seconds)
                }, 1000)
            }

            function time_stop() {
                clearInterval(timeinterval)
            }

            let stop = function() {
                $innertimeline.stop();
                if (o.showtimedisplay) {
                    time_stop();
                    d.stop()
                }
                playing = false;
                if (o.showpauseplay) {
                    g.attr('class', 'play')
                }
            }

            let start = function(a, b) {
                if (a < 2 && !b && !started) {
                    the_start_callback()
                }
                if (!b) {
                    seconds = nodesec[a]
                }
                if (o.showtimedisplay) {
                    time_start(seconds)
                }
                if (!b) {
                    $innertimeline.css({
                        width: nodepos[a]
                    });
                    if (o.showtimedisplay) {
                        d.css({
                            left: nodepos[a] - f
                        })
                    }
                }
                if (b) {
                    animationtime = (b * 1000)
                } else {
                    animationtime = (nodeinterval[a] * 1000)
                }
                if (a < nodes) {
                    targetpos = nodepos[(a + 1)]
                } else {
                    targetpos = o.timelinewidth
                }
                if (o.showtimedisplay) {
                    d.animate({
                        left: (targetpos - f)
                    }, animationtime, 'linear')
                }
                $innertimeline.animate({
                    width: targetpos
                }, animationtime, 'linear', function () {
                    if (o.showtimedisplay) {
                        time_stop()
                    }
                    if (a < nodes) {
                        start((a + 1))
                    } else {
                        the_end_callback();
                        started = false;
                        if (o.repeat) {
                            start(1)
                        }
                    }
                });
                if (a != activenode) {
                    $container.find('.slide:not(.slide' + a + '):not(.slide' + activenode + ')').stop().animate({
                        opacity: 0
                    }, 0).css({
                        'z-index': 0
                    });
                    if (o.transition == 'fade') {
                        $container.find('.slide' + activenode).stop().animate({
                            opacity: 0
                        }, 300, function () {
                            $(this).css({
                                'z-index': 0
                            })
                        });
                        $container.find('.slide' + a).stop().animate({
                            opacity: 1
                        }, 300, function () {
                            $(this).css({
                                'z-index': 1
                            })
                        })
                    }
                    if (o.transition == 'slide' || o.transition == 'reveal') {
                        $container.find('.slide' + activenode).css({
                            'z-index': 1
                        }).stop(true, true).animate({
                            left: -o.containerwidth
                        }, 600, function () {
                            $(this).css({
                                'z-index': 0,
                                left: 0
                            }).animate({
                                opacity: 0
                            }, 0)
                        })
                    }
                    if (o.transition == 'reveal') {
                        $container.find('.slide' + a).css({
                            'z-index': 0
                        }).stop(true, true).animate({
                            opacity: 1
                        }, 0)
                    }
                    if (o.transition == 'slide') {
                        $container.find('.slide' + a).css({
                            'z-index': 1,
                            left: o.containerwidth
                        }).stop(true, true).animate({
                            opacity: 1
                        }, 0).animate({
                            left: 0
                        }, 600)
                    }
                    if (o.transition == 'instant') {
                        $container.find('.slide' + activenode).animate({
                            opacity: 0
                        }, 0);
                        $container.find('.slide' + a).animate({
                            opacity: 1
                        }, 0)
                    }
                }
                $container.find('.node' + activenode).removeClass('node_active');
                $container.find('.node' + a).addClass('node_active');
                activenode = a;
                playing = true;
                if (o.showpauseplay) {
                    g.attr('class', 'pause')
                }
                if (o.showpauseplay && (a == nodes && !o.repeat)) {
                    stop()
                }
                if (!b && started) {
                    the_newslide_callback()
                }
                if (!started) {
                    started = true
                }
                timeliner_operation.activenode = activenode;
            }

            $.fn.timeliner.pauseplay = function () {
                g.click()
            };
            $.fn.timeliner.play = function () {
                if (!playing) {
                    g.click()
                }
            };
            $.fn.timeliner.pause = function () {
                if (playing) {
                    g.click()
                }
            };
            $.fn.timeliner.next = function () {
                i.click()
            };
            $.fn.timeliner.prev = function () {
                h.click()
            };

            $.fn.timeliner.remove = function () {
                if ($innertimeline)
                    stop();
                $innertimeline.stop(true, true);
            };


            function the_start_callback() {
                var a = $container.attr('id');
                if (a == undefined || !a) {
                    a = '[no id]'
                }
                timeliner_callback.start(a)
            };

            function the_newslide_callback() {
                var a = $container.attr('id');
                if (a == undefined || !a) {
                    a = '[no id]'
                }
                timeliner_callback.newslide(a, activenode)
            };

            function the_end_callback() {
                var a = $container.attr('id');
                if (a == undefined || !a) {
                    a = '[no id]'
                }
                timeliner_callback.end(a)

            };

            function the_paused_callback() {
                var a = $container.attr('id');
                if (a == undefined || !a) {
                    a = '[no id]'
                }
                timeliner_callback.paused(a, activenode)
            };

            function the_resumed_callback() {
                var a = $container.attr('id');
                if (a == undefined || !a) {
                    a = '[no id]'
                }
                timeliner_callback.resumed(a, activenode)

            };

            function the_click_callback() {
                var a = $container.attr('id');
                if (a == undefined || !a) {
                    a = '[no id]'
                }
                timeliner_callback.click(a, activenode)
            };
            k.click(function () {
                //点击事件
                stop();
                start($(this).data('id'));
                if (!o.autoplay) {
                    g.click()
                }
            })
            if (o.showpauseplay) {
                if (o.controls_always_visible) {
                    g.stop().animate({
                        opacity: 0.7
                    }, 300);
                    if (o.showprevnext) {
                        h.stop().animate({
                            opacity: 0.7
                        }, 300);
                        i.stop().animate({
                            opacity: 0.7
                        }, 300)
                    }
                } else {
                    $container.hover(function () {
                        g.stop().animate({
                            opacity: 0.7
                        }, 300);
                        if (o.showprevnext) {
                            h.stop().animate({
                                opacity: 0.7
                            }, 300);
                            i.stop().animate({
                                opacity: 0.7
                            }, 300)
                        }
                    }, function () {
                        g.stop().animate({
                            opacity: 0
                        }, 200);
                        if (o.showprevnext) {
                            h.stop().animate({
                                opacity: 0
                            }, 200);
                            i.stop().animate({
                                opacity: 0
                            }, 200)
                        }
                    })
                }
                g.click(function () {
                    if (playing) {
                        stop();
                        timeremaining = (nodeinterval[activenode] - seconds + nodesec[activenode]);
                        the_paused_callback()
                    } else {
                        if (activenode == nodes && !o.repeat) {
                            start(1)
                        } else {
                            start(activenode, timeremaining)
                        }
                        the_resumed_callback()
                    }
                }).hover(function () {
                    $(this).stop().animate({
                        opacity: 0.9
                    }, 200)
                }, function () {
                    $(this).stop().animate({
                        opacity: 0.7
                    }, 400)
                });
                if (o.showprevnext) {
                    h.click(function () {
                        if (activenode == 1) {
                            $container.find('.node' + nodes).click()
                        } else {
                            $container.find('.node' + (activenode - 1)).click()
                        }
                    }).hover(function () {
                        $(this).stop().animate({
                            opacity: 0.9
                        }, 200)
                    }, function () {
                        $(this).stop().animate({
                            opacity: 0.7
                        }, 400)
                    });
                    i.click(function () {
                        if (activenode == nodes) {
                            $container.find('.node1').click()
                        } else {
                            $container.find('.node' + (activenode + 1)).click()
                        }
                    }).hover(function () {
                        $(this).stop().animate({
                            opacity: 0.9
                        }, 200)
                    }, function () {
                        $(this).stop().animate({
                            opacity: 0.7
                        }, 400)
                    })
                }
            }
            $timeline.click(function (e) {
                var a = ((e.pageX - $(this).offset().left) + halfnodewidth);
                var b;
                x = 1;
                for (x in nodepos) {
                    if (x > 0 && x < nodes) {
                        if ((nodepos[x] < a) && (nodepos[(+x + 1)] > a)) {
                            b = x
                        }
                    }
                }
                if (a > nodepos[nodes]) {
                    b = nodes
                }
                if (a < 0) {
                    b = 1
                }
                if (b != activenode) {
                    $timeline.find('.node' + b).click()
                }
                stop() //点击之后是否停止
                the_click_callback()

            });
            if (o.keyboard) {
                $(document).keydown(function (e) {
                    if (e.keyCode == 32) {
                        e.preventDefault();
                        g.click()
                    }
                })
            }
            $container.find('.slide1').animate({
                opacity: 1
            }, 0).css({
                'z-index': 1
            });
            if (o.autoplay) {
                start(1)
            }
            timeliner_operation._this = this;
            timeliner_operation.start = start;
            timeliner_operation.stop = stop;
        })
    }
})(jQuery);