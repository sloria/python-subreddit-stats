fname = "http://data.stevenloria.com/python-subreddit-traffic.csv"
# fname = './python-subreddit-traffic.csv'
window.parseIsoDate = d3.time.format.iso.parse

getDayRange = (dates) ->
    minDate = d3.min(dates)
    maxDate = d3.max(dates)
    step = 86400000  # Milliseconds in a day
    return (new Date(i) for i in [minDate...maxDate] by step)

tenDayFilter = (datum, i) ->
    ### Filter function to filter data recorded within the last 10 days ###
    # Date object for 10 days ago
    tenDaysAgo = new Date().setDate(new Date().getDate() - 10)
    return parseIsoDate(datum.date) > tenDaysAgo

d3.csv(fname, (error, csv) ->
    return console.log("There was an error:" + error)  if error
    ### Line chart  ###
    window.lineChartData = () ->
        data =  d3.nest()
            .key((d) -> "r/" + d.subreddit)
            .rollup((d) ->
                # Only show data within the past 10 days
                filtered = d.filter(tenDayFilter)
                formatted = filtered.map((dat) ->
                    # Date on the x-axis, user count on y-axis
                    return {x: +parseIsoDate(dat.date), y: +dat.users})
                return formatted
            )
            .entries(csv)
        return data

    dates = csv.map((entry) -> return +parseIsoDate(entry.date))
    x2tickValues = getDayRange(dates)  # Show a tick mark at every day on
                                        # The bottom panel

    nv.addGraph ->
        chart = nv.models.lineWithFocusChart()
        chart.xAxis.axisLabel("Time").tickFormat (d) ->
            d3.time.format("%a %H:%M")(new Date(d))
        chart.x2Axis
            .tickValues(x2tickValues)
            .tickFormat((d) ->
                d3.time.format("%a %m/%d")(new Date(d)))
        chart.yAxis.axisLabel("Users").tickFormat d3.format("d")
        chart.y2Axis.tickFormat(d3.format("d"))

        d3.select("#time-chart svg")
            .datum(lineChartData())
            .transition().duration(500)
            .call(chart)
        nv.utils.windowResize(chart.update)


    ### Bar chart (by hour) ###
    window.hourlyData = () ->
        nested = d3.nest()
                    .key((d) -> d.subreddit)
                    .key((d) -> parseIsoDate(d.date).getHours())  # This is a string
                    .sortKeys((a, b) ->
                        # Sort by ascending order
                        # Need to parse each item as an int
                        return if +a < +b then -1 else (if +a > +b then 1 else 0)
                    )
                    .entries(csv)
        hours = d3.range(24)
        data = []
        for each in nested
            subreddit = each.key
            values = each.values.map((d) ->
                x = +d.key  # the hour
                # Array of user counts for this hour
                nUsers = (+dat.users for dat in d.values)
                y = d3.round(d3.mean(nUsers))
                # Each value has the form: {x: hour, y: mean users}
                return {x: x, y: y}
            )
            # Fill in missing vals
            hr_vals = values.map((d) -> return d.x)
            hours.forEach((hour, i, ary) ->
                if hour not in hr_vals
                    values.push({x: +hour, y: 0})
            )
            data.push {key: "r/" + subreddit, values: values}
        return data

    nv.addGraph ->
        chart = nv.models.multiBarChart()
        chart.xAxis
            .axisLabel("Time")
            .tickFormat((d) -> "#{d}:00")
            .showMaxMin(false)
        chart.yAxis
            .axisLabel("Mean number of users")
            .tickFormat(d3.format("d"))
            .showMaxMin(false)
        chart.tooltip((key, x, y, e, graph) ->
            return "<h3>#{key}</h3><p>#{y} users at #{x}</p>"
        )
        d3.select("#hour-chart svg")
            .datum(hourlyData())
            .transition().duration(50)
            .call(chart)

        nv.utils.windowResize(chart.update)

    ### Bar chart (by day) ###
    window.dayData = () ->
        # Object used to sort days
        days =
            "Monday": 0,
            "Tuesday": 1,
            "Wednesday": 2,
            "Thursday": 3,
            "Friday": 4,
            "Saturday": 5,
            "Sunday": 6
        nested = d3.nest()
                    .key((d) -> d.subreddit)
                    .key((d) ->
                        date = parseIsoDate(d.date)
                        day = d3.time.format("%A")(date)  # Returns the weekday as a string
                        return day
                    )
                    .sortKeys((a, b) ->
                        # Sort by ascending order
                        # Use the `days` object to figure out the ordering
                        return if days[a] < days[b] then -1 else (if days[a] > days[b] then 1 else 0)
                    )
                    .entries(csv)
        day_strings = (day for day of days)
        data = []
        for each in nested
            # console.log each
            subreddit = each.key
            values = each.values.map((d) ->
                x = d.key  # the day
                # Array of user counts for this day
                nUsers = (+dat.users for dat in d.values)
                y = d3.round(d3.mean(nUsers))
                return {x: x, y: y}
            )
            # Fill in missing vals
            day_vals = values.map((d) -> return d.x)
            day_strings.forEach((day, i, ary) ->
                if day not in day_vals
                    values.push({x: day, y: 0})
            )
            # each value has the form: {x: weekday, y: mean users}
            data.push {key: "r/" + subreddit, values: values}
        return data

    nv.addGraph ->
        chart = nv.models.multiBarChart()
        chart.xAxis
            .axisLabel("Day")
            .tickFormat((x) -> "#{x}")
        chart.yAxis
            .axisLabel("Mean number of users per hour")
            .tickFormat(d3.format("d"))
            .showMaxMin(false)
        chart.tooltip((key, x, y, e, graph) ->
            return "<h3>#{key}</h3><p>#{y} users/hr on #{x}s</p>"
        )
        d3.select("#day-chart svg")
            .datum(dayData())
            .transition().duration(200)
            .call(chart)

        nv.utils.windowResize(chart.update)
)

