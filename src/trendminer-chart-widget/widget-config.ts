/** @format */

//import { NgbDateStruct, NgbTimeStruct } from "@ng-bootstrap/ng-bootstrap";
import { ChartOptions } from 'chart.js';
import { DateTime } from 'luxon';



//
// Helper classes and interfaces
//

/**
 * series interface
 */
interface SeriesDetail {
    id: string;
    name: string;
    color: string;
    ownAxis: boolean;
}

export interface AnnotationDetail {
    name: string;
    startCode: string;
    endCode: string;
    iconSize: string;
    startValue: any;
    endValue: any;
    startColor: string;
    endColor: string;
    position: string;
    startLineColor: string;
    endLineColor: string;
    tooltip: string;
    fontColor: string;
    fontSize: number;
    showContextLabels: boolean;
}


/**
 * This class will contain all the bespoke config for the widget
 */
export class WidgetConfig {

    public units = ["second", "minute", "hour", "day", "week", "month", "year"];
    public unitVal = [1, 60, 3600, 86400, 592200, 2622600, 30879000];
    /**
     * The Chart basic options 
     */

    public chartConfig: (ChartOptions & { fontAwesomeAnnotation: { annotations: AnnotationDetail[]; }; }) = {
        responsive: true,
        scales: {
            // We use this empty structure as a placeholder for dynamic theming.
            xAxes: [{
                type: 'time',
                time: {
                    unit: 'hour'
                },
                display: true,
                scaleLabel: { labelString: "Date" },
            }],
            yAxes: []
        },
        fontAwesomeAnnotation: { annotations: [] },
    };

    /**
         * Default colours so we have a set of main
         * and aggregate colors.
         */
    colorList: string[] = [
        "#FF0000",
        "#00FF00",
        "#0000FF",
        "#FF00FF",
        "#00FFFF",
        "#808000",
        "#800000",
        "#008000",
        "#008080",
        "#800080",
        "#808080",
        "#FFFF00",
    ];

    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    series: { [key: string]: SeriesDetail; } = {};
    seriesNames: any[];
    colours: string[];
    fitAxis: boolean;
    fillArea: boolean;
    proxy: string;
    chartUnit: string;
    showContext: boolean;
    realtime: boolean;
    refreshPeriodMinutes: number;
    periodValue: number;
    periodUnit: string;

    eventSymbolStart: any;
    eventSymbolEnd: any;
    eventSymbolSize: string;
    eventSymbolStartColor: string;
    eventSymbolEndColor: string;
    eventLineStartColor: string;
    eventLineEndColor: string;



    /**
     * charts configuration
     */
    changed: boolean = false;
    fontColor: string;
    fontSize: number;
    showContextLabels: boolean;

    /**
     *  Create an instance of the config object
     */
    constructor() {
        this.series = {};
        this.seriesNames = [];
        let dEnd: DateTime = DateTime.now();
        let dStart: DateTime = dEnd.plus({ days: -5 });
        this.startDate = dStart.toISODate();
        this.endDate = dEnd.toISODate();
        this.startTime = dStart.toLocaleString(DateTime.TIME_24_SIMPLE);
        this.endTime = dEnd.toLocaleString(DateTime.TIME_24_SIMPLE);
        this.fillArea = false;
        this.fitAxis = false;
        this.chartUnit = 'minute';
        this.showContext = false;
        this.realtime = false;
        this.refreshPeriodMinutes = 5;
        this.eventSymbolStart = {};
        this.eventSymbolEnd = {};
        this.eventSymbolSize = "18";
        this.eventSymbolStartColor = "#FF0000";
        this.eventSymbolEndColor = "#00FF00";
        this.eventLineStartColor = "#FF0000";
        this.eventLineEndColor = "#00FF00";


        //default 5 days
        this.periodUnit = "day";
        this.periodValue = 5;

        //context labels
        this.fontColor = "#000000";
        this.fontSize = 10;
        this.showContextLabels = true;
        this.proxy = 'https://democenter.gateway.webmethodscloud.com/gateway/TrendMinerProxy/1.0/restv2/tmproxy/';
        //console.log("THIS", this);
    }

    getChartConfig() {
        return this.chartConfig;
    }

    /**
     *
     * @returns true if series exist
     */
    hasSeries() {
        return Object.keys(this.series).length > 0;
    }

    /**
     * Checks to see if series held are still valid,
     * or if new series need to be added.
     *
     * @param l is the current list of series selected
     */
    clearSeries() {
        if (Object.keys(this.series).length > 0) {
            let temp = this.series;
            this.series = {};
            this.seriesNames.forEach((selected) => {
                if (selected.name in temp) this.series[selected.name] = temp[selected.name];
            });
        }
    }

    /**
     * Used in the config form to display the
     * series settings and allow them to be changed.
     *
     * @returns the series held for display
     */
    seriesKeys(): Array<string> {
        return Object.keys(this.series);
    }

    //add a series
    addSeries(id: string, name: string, color: string, ownAxis: boolean) {
        if (!(name in this.series)) {
            this.series[name] = { id: id, name: name, color: color, ownAxis: ownAxis };
        }
    }


}
