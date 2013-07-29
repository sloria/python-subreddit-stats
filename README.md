# Python subreddit stats

`What?`

A quick hack to capture and visualize user traffic on Python-related subreddits.

See it live: [http://stevenloria.com/python-subreddit-stats][live site]

`How?`

- A [python script](https://github.com/sloria/datasources/blob/master/scripts/rusers.py) scrapes the subreddit pages for the current user counts. An [Openshift](https://www.openshift.com/) app runs this script every hour and makes the data available [here][data].
- `script.coffee`/`script.js` uses [D3][] and [NVD3][] to visualize the data.

[data]: http://data.stevenloria.com/python-subreddit-traffic.csv
[live site]: http://stevenloria.com/python-subreddit-stats
[D3]: http://d3js.org/
[NVD3]: http://nvd3.org/