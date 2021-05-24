/** @format */

import { NgbDateStruct, NgbTimeStruct } from "@ng-bootstrap/ng-bootstrap";
import { DateTime } from 'luxon';

//
// Helper classes and interfaces
//


/**
 * This class will contain all the bespoke config for the widget
 */
export class WidgetConfig {
    startDate: NgbDateStruct;
    endDate: NgbDateStruct;
    startTime: NgbTimeStruct;
    endTime: NgbTimeStruct;
    series: string[];
    colours: string[];
    /**
     * charts configuration
     */
    changed: boolean = false;

    /**
     *  Create an instance of the config object
     */
    constructor() {
        this.series = [];
        let dEnd = DateTime.now();
        let dStart = dEnd.plus({ days: -5 });
        this.startDate = { year: dStart.year, month: dStart.month, day: dStart.day };
        this.startTime = { hour: dStart.hour, minute: dStart.minute, second: 0 };
        this.endDate = { year: dEnd.year, month: dEnd.month, day: dEnd.day };
        this.endTime = { hour: dEnd.hour, minute: dEnd.minute, second: 0 };
    }

}
