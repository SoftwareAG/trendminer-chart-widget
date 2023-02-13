# Trendminer chart widget [<img width="35" src="https://user-images.githubusercontent.com/67993842/97668428-f360cc80-1aa7-11eb-8801-da578bda4334.png"/>](https://github.com/SoftwareAG/trendminer-chart-widget/releases/download/v1.0.1/trendminer-chart-widget-1.0.1.zip)

The Trendminer chart widget allows you to create graphs showing customizable amounts of data from one or more series with context events overlayed.

![Charts](/assets/img-preview.png)

## Features

### Chart TrendMiner series.

- Line charts only currently.

_There will be more added in the future depending on demand (E.G trendminer histogram data)_

### Customization

- Selected data ranges configurable (time range)
- Choose colours for plotted data
- show and hide data by clicking legend items, tool tips
- configurable label times
- fill area under line
- Plot multiple series on the same chart
- Show context events on the chart 
  -  Choose Icons, color and size for start and end event
- Show labels with the context events
  - Choose the color and size of the labels.

## Installation

### Runtime Widget Deployment?

- This widget supports runtime deployment. Download the [Runtime Binary](https://github.com/SoftwareAG/trendminer-chart-widget/releases/download/v1.0.1/trendminer-chart-widget-1.0.1.zip) and follow runtime deployment instructions from [here](https://github.com/SoftwareAG/cumulocity-runtime-widget-loader).

## User guide

This guide will teach you how to add the widget in your existing or new dashboard.

NOTE: This guide assumes that you have followed the [installation](https://github.com/SoftwareAG/cumulocity-runtime-widget-loader) instructions

1. Open the Application Builder application from the app switcher (Next to your username in the top right)
2. Add a new dashboard or navigate to an existing dashboard
3. Click `Add Widget`
4. Search for `TrendMiner` 
5. See below for the configuration options

### Configuration
The widget configuration page contains a number of configuration attributes.

- **Title** : Enter the title which will display at the top of your widget

**TrendMiner Configuration** section
- **Address** : The calls to TrendMiner are proxyied through API gateway, enter the address of the proxy here. 
- **Series** : Much the same as the TrendMiner UI click into the box and start typing to see a list of possible series that can be added.
  - Multiple series can be chosen 
- **Visible period**: Choose a period of time fom the current time to display. E.G. the last 5 days. 
  
**Chart Options** section

- **Chart Labels** : Define what labels should show on the time axis of the chart. 
- **Show context events** : Show or hide context events on the chart. 
- **Fill area** : Fill under the plotted line. 
- **Icon size** : What size to show the event icon(s) on the chart. 
- **Start symbol, line and icon** : Choose the line colors and icon to show. 
- **End symbol, line and icon** : Choose the line colors and icon to show. 
- **Show context labels** : Choose to show the labels for the events that show name and type of event. 
- **Label font color and size** : Choose label color and size. 
- **Refresh every...** : The graph will update periodically if checked. 

**Series Options** section
- **Color** : Choose the color for the series to be plotted in.
### Example configuration

![example configuration](/images/configuration.gif)

The end result of the choices shown above are the following chart

![example configuration](/images/example-chart.png)

### Chart screen

There are a number of controls on the front screen that can be used to change the display. 

firstly if you want to update the chart to the current time, click the refresh button on the top right. You might want to do this if the refresh rate of the widget is low and you wish to get up to datye information.

![Force update](/images/force-update.gif)

Next you can start or stop regular refreshes (based on the configuration) using the play/pause button. 

![periodic update](/images/update.gif)

Lastly using the date controls you can change the displayed data. 

![Dates update](/images/update-dates.gif)



---

These tools are provided as-is and without warranty or support. They do not constitute part of the Software AG product suite. Users are free to use, fork and modify them, subject to the license agreement. While Software AG welcomes contributions, we cannot guarantee to include every contribution in the master project.

---

For more information you can Ask a Question in the [Tech Community Forums](https://tech.forums.softwareag.com/tags/c/forum/1/Cumulocity-IoT).

You can find additional information in the [Software AG Tech Community](https://techcommunity.softwareag.com/en_en/cumulocity-iot.html).
