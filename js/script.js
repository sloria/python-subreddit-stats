// Generated by CoffeeScript 1.4.0
(function() {
  var fname, getDayRange, tenDayFilter,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  fname = "http://data.stevenloria.com/python-subreddit-traffic.csv";

  window.parseIsoDate = d3.time.format.iso.parse;

  getDayRange = function(dates) {
    var i, maxDate, minDate, step;
    minDate = d3.min(dates);
    maxDate = d3.max(dates);
    step = 86400000;
    return (function() {
      var _i, _results;
      _results = [];
      for (i = _i = minDate; minDate <= maxDate ? _i < maxDate : _i > maxDate; i = _i += step) {
        _results.push(new Date(i));
      }
      return _results;
    })();
  };

  tenDayFilter = function(datum, i) {
    /* Filter function to filter data recorded within the last 10 days
    */

    var tenDaysAgo;
    tenDaysAgo = new Date().setDate(new Date().getDate() - 10);
    return parseIsoDate(datum.date) > tenDaysAgo;
  };

  d3.csv(fname, function(error, csv) {
    var dates, x2tickValues;
    if (error) {
      return console.log("There was an error:" + error);
    }
    /* Line chart
    */

    window.lineChartData = function() {
      var data;
      data = d3.nest().key(function(d) {
        return "r/" + d.subreddit;
      }).rollup(function(d) {
        var filtered, formatted;
        filtered = d.filter(tenDayFilter);
        formatted = filtered.map(function(dat) {
          return {
            x: +parseIsoDate(dat.date),
            y: +dat.users
          };
        });
        return formatted;
      }).entries(csv);
      return data;
    };
    dates = csv.map(function(entry) {
      return +parseIsoDate(entry.date);
    });
    x2tickValues = getDayRange(dates);
    nv.addGraph(function() {
      var chart;
      chart = nv.models.lineWithFocusChart();
      chart.xAxis.axisLabel("Time").tickFormat(function(d) {
        return d3.time.format("%a %H:%M")(new Date(d));
      });
      chart.x2Axis.tickValues(x2tickValues).tickFormat(function(d) {
        return d3.time.format("%a %m/%d")(new Date(d));
      });
      chart.yAxis.axisLabel("Users").tickFormat(d3.format("d"));
      chart.y2Axis.tickFormat(d3.format("d"));
      d3.select("#time-chart svg").datum(lineChartData()).transition().duration(500).call(chart);
      return nv.utils.windowResize(chart.update);
    });
    /* Bar chart (by hour)
    */

    window.hourlyData = function() {
      var data, each, hours, hr_vals, nested, subreddit, values, _i, _len;
      nested = d3.nest().key(function(d) {
        return d.subreddit;
      }).key(function(d) {
        return parseIsoDate(d.date).getHours();
      }).sortKeys(function(a, b) {
        if (+a < +b) {
          return -1;
        } else {
          if (+a > +b) {
            return 1;
          } else {
            return 0;
          }
        }
      }).entries(csv);
      hours = d3.range(24);
      data = [];
      for (_i = 0, _len = nested.length; _i < _len; _i++) {
        each = nested[_i];
        subreddit = each.key;
        values = each.values.map(function(d) {
          var dat, nUsers, x, y;
          x = +d.key;
          nUsers = (function() {
            var _j, _len1, _ref, _results;
            _ref = d.values;
            _results = [];
            for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
              dat = _ref[_j];
              _results.push(+dat.users);
            }
            return _results;
          })();
          y = d3.round(d3.mean(nUsers));
          return {
            x: x,
            y: y
          };
        });
        hr_vals = values.map(function(d) {
          return d.x;
        });
        hours.forEach(function(hour, i, ary) {
          if (__indexOf.call(hr_vals, hour) < 0) {
            return values.push({
              x: +hour,
              y: 0
            });
          }
        });
        data.push({
          key: "r/" + subreddit,
          values: values
        });
      }
      return data;
    };
    nv.addGraph(function() {
      var chart;
      chart = nv.models.multiBarChart();
      chart.xAxis.axisLabel("Time").tickFormat(function(d) {
        return "" + d + ":00";
      }).showMaxMin(false);
      chart.yAxis.axisLabel("Mean number of users").tickFormat(d3.format("d")).showMaxMin(false);
      chart.tooltip(function(key, x, y, e, graph) {
        return "<h3>" + key + "</h3><p>" + y + " users at " + x + "</p>";
      });
      d3.select("#hour-chart svg").datum(hourlyData()).transition().duration(50).call(chart);
      return nv.utils.windowResize(chart.update);
    });
    /* Bar chart (by day)
    */

    window.dayData = function() {
      var data, day, day_strings, day_vals, days, each, nested, subreddit, values, _i, _len;
      days = {
        "Monday": 0,
        "Tuesday": 1,
        "Wednesday": 2,
        "Thursday": 3,
        "Friday": 4,
        "Saturday": 5,
        "Sunday": 6
      };
      nested = d3.nest().key(function(d) {
        return d.subreddit;
      }).key(function(d) {
        var date, day;
        date = parseIsoDate(d.date);
        day = d3.time.format("%A")(date);
        return day;
      }).sortKeys(function(a, b) {
        if (days[a] < days[b]) {
          return -1;
        } else {
          if (days[a] > days[b]) {
            return 1;
          } else {
            return 0;
          }
        }
      }).entries(csv);
      day_strings = (function() {
        var _results;
        _results = [];
        for (day in days) {
          _results.push(day);
        }
        return _results;
      })();
      data = [];
      for (_i = 0, _len = nested.length; _i < _len; _i++) {
        each = nested[_i];
        subreddit = each.key;
        values = each.values.map(function(d) {
          var dat, nUsers, x, y;
          x = d.key;
          nUsers = (function() {
            var _j, _len1, _ref, _results;
            _ref = d.values;
            _results = [];
            for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
              dat = _ref[_j];
              _results.push(+dat.users);
            }
            return _results;
          })();
          y = d3.round(d3.mean(nUsers));
          return {
            x: x,
            y: y
          };
        });
        day_vals = values.map(function(d) {
          return d.x;
        });
        day_strings.forEach(function(day, i, ary) {
          if (__indexOf.call(day_vals, day) < 0) {
            return values.push({
              x: day,
              y: 0
            });
          }
        });
        data.push({
          key: "r/" + subreddit,
          values: values
        });
      }
      return data;
    };
    return nv.addGraph(function() {
      var chart;
      chart = nv.models.multiBarChart();
      chart.xAxis.axisLabel("Day").tickFormat(function(x) {
        return "" + x;
      });
      chart.yAxis.axisLabel("Mean number of users per hour").tickFormat(d3.format("d")).showMaxMin(false);
      chart.tooltip(function(key, x, y, e, graph) {
        return "<h3>" + key + "</h3><p>" + y + " users/hr on " + x + "s</p>";
      });
      d3.select("#day-chart svg").datum(dayData()).transition().duration(200).call(chart);
      return nv.utils.windowResize(chart.update);
    });
  });

}).call(this);
