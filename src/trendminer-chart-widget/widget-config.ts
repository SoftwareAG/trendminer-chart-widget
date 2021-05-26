/** @format */

import { NgbDateStruct, NgbTimeStruct } from "@ng-bootstrap/ng-bootstrap";
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

/**
 * This class will contain all the bespoke config for the widget
 */
export class WidgetConfig {

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

    startDate: NgbDateStruct;
    endDate: NgbDateStruct;
    startTime: NgbTimeStruct;
    endTime: NgbTimeStruct;
    series: { [key: string]: SeriesDetail; } = {};
    seriesNames: any[];
    colours: string[];
    fitAxis: boolean;
    fillArea: boolean;
    proxy: string;

    /**
     * charts configuration
     */
    changed: boolean = false;

    /**
     *  Create an instance of the config object
     */
    constructor() {
        this.series = {};
        this.seriesNames = [];
        let dEnd = DateTime.now();
        let dStart = dEnd.plus({ days: -5 });
        this.startDate = { year: dStart.year, month: dStart.month, day: dStart.day };
        this.startTime = { hour: dStart.hour, minute: dStart.minute, second: 0 };
        this.endDate = { year: dEnd.year, month: dEnd.month, day: dEnd.day };
        this.endTime = { hour: dEnd.hour, minute: dEnd.minute, second: 0 };
        this.fillArea = false;
        this.fitAxis = false;
        this.proxy = 'https://kalpshekhargupta.gateway.webmethodscloud.de/gateway/TrendMinerProxy/1.0/restv2/tmproxy/';
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
