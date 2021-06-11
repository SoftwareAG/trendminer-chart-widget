/**
 * /*
 * Copyright (c) 2019 Software AG, Darmstadt, Germany and/or its licensors
 *
 * SPDX-License-Identifier: Apache-2.0
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @format
 */

import { Component, Input, OnDestroy, ViewChild, OnInit } from "@angular/core";
import { Realtime, InventoryService } from "@c8y/client";
import { Chart, ChartDataSets, ChartOptions, ChartPoint, ChartType, TimeUnit } from "chart.js";
import { ThemeService, BaseChartDirective, Label } from "ng2-charts";
import { TrendMinerService } from "./trendminer-service";
import { DateTime } from 'luxon';
import { WidgetHelper } from "./widget-helper";
import { AnnotationDetail, WidgetConfig } from './widget-config';
import { BehaviorSubject, combineLatest } from "rxjs";
import * as _ from 'lodash';


export function scaleValue(scale, value, fallback) {
    value = typeof value === 'number' ? value : DateTime.fromISO(value).toMillis();
    return isFinite(value) ? scale.getPixelForValue(value) : fallback;
}

const chartStates = new Map();


var FontAwesomeAnnotationPlugin = {
    id: 'FontAwesomeAnnotationPlugin',
    beforeUpdate(_chart, _options) {
        console.log("UPDATE");
        this.areas = {};
    },
    areas: {},
    hatchRect: function (ctx, x1, y1, dx, dy, delta, color) {
        ctx.rect(x1, y1, dx, dy);
        ctx.save();
        ctx.clip();
        var majorAxe = _.max([dx, dy]);
        ctx.strokeStyle = color;

        _.each(_.range(-1 * (majorAxe), majorAxe, delta), function (n, i) {
            ctx.beginPath();
            ctx.moveTo(n + x1, y1);
            ctx.lineTo(dy + n + x1, y1 + dy);
            ctx.stroke();
        });
        ctx.restore();
    },
    avoidCollision: function (x1: number, iconY: number) {
        //console.log("Y=", iconY, this.areas);
        let colliding: boolean = true;
        //check collisions
        while (colliding) {
            colliding = false;
            console.log(this.areas, x1, iconY);
            for (const area in this.areas) {
                if (Object.prototype.hasOwnProperty.call(this.areas, area)) {
                    const element = this.areas[area];
                    if (x1 >= element.x1 && x1 <= element.x2 && iconY >= element.y1 && iconY <= element.y2) {
                        iconY = element.y2 + 1;
                        colliding = true;
                        console.log("COLIDED", element, x1, iconY);
                        break;
                    }
                }
            }
        }
        return iconY;
    },
    drawFontAwesomeAnnotation: function (chartInstance, position) {

        let context = chartInstance.chart.ctx;
        const xScale = chartInstance.scales['x-axis-0'];
        const yScale = chartInstance.scales[chartInstance.data.datasets[0].yAxisID];

        if (chartInstance.data.datasets.length > 0) {
            let annotationsToDraw = chartInstance.data.datasets[0].annotations.sort((a, b) => DateTime.fromISO(a.startValue).toMillis() - DateTime.fromISO(b.startValue).toMillis());
            annotationsToDraw.forEach((element: AnnotationDetail) => {
                if (element.position === position) {
                    //properties - weight, size and colour
                    context.font = `600 ${element.iconSize}px "FontAwesome"`;

                    //start and end event
                    let startCode = parseInt(`0x${element.startCode}`);
                    let endCode = parseInt(`0x${element.endCode}`);
                    let x1 = scaleValue(xScale, element.startValue, undefined);
                    let x2 = scaleValue(xScale, element.endValue, undefined);
                    let y1 = scaleValue(yScale, 0, undefined);

                    //start and end lines for event
                    if (x1 !== undefined && !(element.tooltip in this.areas)) {
                        // draw line
                        context.beginPath();
                        context.strokeStyle = element.startLineColor;
                        context.moveTo(x1, yScale.top);
                        context.lineTo(x1, y1);
                        context.stroke();

                        let thesum: number = yScale.top + parseInt(element.iconSize);
                        let iconY: number = this.avoidCollision(x1, thesum);

                        let iconTxt = String.fromCharCode(startCode);
                        let iconSz = context.measureText(iconTxt).width;
                        let textSz = 0; //if off no width

                        //icon
                        context.fillStyle = element.startColor;
                        context.fillText(iconTxt, x1, iconY);
                        if (element.showContextLabels) {
                            context.font = `600 ${element.fontSize}px "FontAwesome"`;
                            context.fillStyle = element.fontColor;
                            let txt = ` ${element.tooltip}`;
                            textSz = context.measureText(txt).width; //store width
                            context.fillText(txt, x1 + iconSz, iconY);
                        }

                        //stop collisions
                        this.areas[element.tooltip] = { x1: x1, y1: iconY, x2: x1 + iconSz + textSz, y2: iconY + iconSz };
                    }
                    if (x2 !== undefined && !(`${element.tooltip}-end` in this.areas)) {
                        // reset font
                        context.font = `600 ${element.iconSize}px "FontAwesome"`;
                        context.beginPath();
                        context.strokeStyle = element.endLineColor;
                        context.moveTo(x2, yScale.top);
                        context.lineTo(x2, y1);
                        context.stroke();
                        context.fillStyle = element.endColor;

                        let iconTxt = String.fromCharCode(endCode);
                        let iconSz = context.measureText(iconTxt).width;
                        let iconY = this.avoidCollision(x2, yScale.top + parseInt(element.iconSize));
                        context.fillText(iconTxt, x2, iconY);

                        //stop collisions
                        this.areas[`${element.tooltip}-end`] = { x1: x2, y1: iconY, x2: x2 + iconSz, y2: iconY + iconSz };
                    }

                }
            });

        }
    },

    // draw the image in front of most chart elements
    afterDraw: function (chartInstance) {
        console.log("UPDATE");
        this.areas = {};
        this.drawFontAwesomeAnnotation(chartInstance, "front");
    }
};

Chart.pluginService.register(FontAwesomeAnnotationPlugin);

@Component({
    selector: "lib-trendminer-chart-widget",
    templateUrl: "./trendminer-chart-widget.component.html",
    styleUrls: ["./trendminer-chart-widget.component.css"],
    providers: [ThemeService, TrendMinerService]
})
export class TrendminerChartWidget implements OnDestroy, OnInit {
    widgetHelper: WidgetHelper<WidgetConfig>;

    driverObs: any;
    sub: any[] = [];
    hasData: boolean = false;
    errorMessage: any;
    testVal: BehaviorSubject<string>;
    startDate$: BehaviorSubject<string>;
    endDate$: BehaviorSubject<string>;
    startTime$: BehaviorSubject<string>;
    endTime$: BehaviorSubject<string>;
    proxy$: BehaviorSubject<string>;
    changed$: BehaviorSubject<boolean>;

    timerVar: any;

    @Input() config;
    /**
     * Gain access to chart object so we can call update
     * under certain circumstance
     */
    @ViewChild(BaseChartDirective, { static: false })
    chartElement: BaseChartDirective;

    constructor(private realtime: Realtime, private invSvc: InventoryService, private trendminer: TrendMinerService) {
        this.testVal = new BehaviorSubject("");
    }

    emitValues() {
        this.startDate$.next(this.widgetHelper.getWidgetConfig().startDate);
        this.endDate$.next(this.widgetHelper.getWidgetConfig().endDate);
        this.startTime$.next(this.widgetHelper.getWidgetConfig().startTime);
        this.endTime$.next(this.widgetHelper.getWidgetConfig().endTime);
    }

    async ngOnInit(): Promise<void> {
        this.widgetHelper = new WidgetHelper(this.config, WidgetConfig); //default access through here
        console.log("INIT", this.widgetHelper.getWidgetConfig());

        this.changed$ = new BehaviorSubject(this.widgetHelper.getWidgetConfig().changed);
        this.startDate$ = new BehaviorSubject(this.widgetHelper.getWidgetConfig().startDate);
        this.endDate$ = new BehaviorSubject(this.widgetHelper.getWidgetConfig().endDate);
        this.startTime$ = new BehaviorSubject(this.widgetHelper.getWidgetConfig().startTime);
        this.endTime$ = new BehaviorSubject(this.widgetHelper.getWidgetConfig().endTime);
        this.proxy$ = new BehaviorSubject(this.widgetHelper.getWidgetConfig().proxy);

        if (this.sub.length > 0) {
            this.sub.forEach(s => s.unsubscribe());
        }

        if (this.driverObs) {
            this.driverObs.unsubscribe();
        }

        this.changed$.subscribe((v) => {
            this.widgetHelper.getWidgetConfig().changed = false;
            this.forceRefresh(this);
        });

        this.driverObs = combineLatest([this.proxy$, this.startDate$, this.endDate$, this.startTime$, this.endTime$]).subscribe(
            ([p, s, e, st, et]) => {
                console.log([p, s, e, st, et]);
                this.getData(p, s, e, st, et);
                this.lineChartOptions = this.widgetHelper.getWidgetConfig().getChartConfig();
            }
        );


        if (this.widgetHelper.getWidgetConfig().realtime) {
            this.startRefresh();
        }

    }

    getRefresh() {
        return this.widgetHelper.getWidgetConfig().realtime;
    }


    toggleRefresh() {
        this.widgetHelper.getWidgetConfig().realtime = !this.widgetHelper.getWidgetConfig().realtime;
        if (this.widgetHelper.getWidgetConfig().realtime) {
            console.log("Setting Refresh");
            this.startRefresh();
        } else {
            console.log("Clearing Refresh");
            clearInterval(this.timerVar);
            this.timerVar = undefined;
        }
    }


    startRefresh() {
        this.widgetHelper.getWidgetConfig().realtime = true;
        if (this.timerVar) { clearInterval(this.timerVar); }
        this.timerVar = setInterval(this.forceRefresh, this.widgetHelper.getWidgetConfig().refreshPeriodMinutes * 60 * 1000, this);
    }

    forceRefresh(comp: TrendminerChartWidget) {
        let multiplier = comp.widgetHelper.getWidgetConfig().unitVal[comp.widgetHelper.getWidgetConfig().units.findIndex((v) => v === comp.widgetHelper.getWidgetConfig().periodUnit)];
        let secondsBackInTime = multiplier * comp.widgetHelper.getWidgetConfig().periodValue;
        let startDate = DateTime.now().minus({ seconds: secondsBackInTime });
        let endDate = DateTime.now();
        console.log("Refresh Data", multiplier, secondsBackInTime, startDate, endDate);

        comp.widgetHelper.getWidgetConfig().endDate = endDate.toISODate();
        comp.widgetHelper.getWidgetConfig().endTime = endDate.toLocaleString(DateTime.TIME_24_SIMPLE);
        comp.widgetHelper.getWidgetConfig().startDate = startDate.toISODate();
        comp.widgetHelper.getWidgetConfig().startTime = startDate.toLocaleString(DateTime.TIME_24_SIMPLE);
        comp.emitValues();
    }

    ngOnDestroy(): void {
        this.sub.forEach(s => s.unsubscribe());
        this.driverObs.unsubscribe();
        if (this.timerVar) { clearInterval(this.timerVar); }
    }

    getData(prox: string, startDate: string, endDate: string, startTime: string, endTime: string) {
        let startDateTime = DateTime.fromISO(`${startDate}T${startTime}`);
        let endDateTime = DateTime.fromISO(`${endDate}T${endTime}`);
        console.log("DATES", startDate, endDate);
        //clear previous before next - async calls effectively
        this.sub.forEach(s => s.unsubscribe());

        this.widgetHelper.getWidgetConfig().chartConfig.scales.yAxes.length = 0;

        this.widgetHelper.getWidgetConfig().chartConfig.scales.xAxes[0].time.unit = <TimeUnit>this.widgetHelper.getWidgetConfig().chartUnit;
        let forAnnotating = [];


        let ob1 = this.trendminer.getDataForId(prox, startDateTime.toISO(), endDateTime.toISO(), this.widgetHelper.getWidgetConfig().seriesKeys());
        let ob2 = this.trendminer.getContextItems(prox, `${startDate}T${startTime}:00Z`, `${endDate}T${endTime}:00Z`, this.widgetHelper.getWidgetConfig().seriesNames);

        this.sub.push(combineLatest([ob1, ob2]).subscribe(
            ([data, context]: [any[], any]) => {
                this.lineChartData.length = 0;
                console.log("COMBINE", [data, context]);


                data.forEach(element => {
                    let name = element.tag.id;
                    //let labels: Date[] = element.values;//.map(v => DateTime.fromISO(v.ts).toLocaleString());
                    let vals: ChartPoint[] = element.values.map(v => { return { x: Date.parse(v.ts), y: v.value }; });
                    if (vals.length) {
                        let chartSeries = {
                            data: [...vals],
                            label: name,
                            yAxisID: `y-${element.tag.id}`,
                            pointRadius: 0,
                            fill: this.widgetHelper.getWidgetConfig().fillArea,
                            spanGaps: true,
                            backgroundColor: this.widgetHelper.getWidgetConfig().series[name].color,
                            borderColor: this.widgetHelper.getWidgetConfig().series[name].color,
                            pointBackgroundColor: this.widgetHelper.getWidgetConfig().series[name].color,

                        };
                        this.lineChartData.push(chartSeries);
                        forAnnotating.push(chartSeries);
                        // this.lineChartLabels = [...new Set([...labels.map(d => d.toString()), this.lineChartLabels.map(d => d.toString())])];
                        this.widgetHelper.getWidgetConfig().chartConfig.scales.yAxes.push({
                            id: `y-${element.tag.id}`,
                            position: 'left',
                        },
                        );
                    }
                });
                this.hasData = this.lineChartData.length > 0;

                if (this.widgetHelper.getWidgetConfig().showContext) {
                    let annotations = context.content.map(c => {
                        return { name: c.shortKey, type: { ...c.type }, startDate: c.startEventDate, endDate: c.endEventDate };
                    });
                    if (this.hasData) {
                        this.lineChartData[0].annotations = [];
                        this.widgetHelper.getWidgetConfig().getChartConfig().fontAwesomeAnnotation.annotations.length = 0;
                        for (let index = 0; index < annotations.length; index++) {
                            const ann = annotations[index];


                            let newAnn: AnnotationDetail = {
                                name: `${ann.name} (${ann.type.name})`,
                                startCode: this.widgetHelper.getWidgetConfig().eventSymbolStart.code,
                                endCode: this.widgetHelper.getWidgetConfig().eventSymbolEnd.code,
                                iconSize: this.widgetHelper.getWidgetConfig().eventSymbolSize,
                                startColor: this.widgetHelper.getWidgetConfig().eventSymbolStartColor,
                                endColor: this.widgetHelper.getWidgetConfig().eventSymbolEndColor,
                                startValue: ann.startDate,
                                endValue: ann.endDate,
                                position: "front", //should default this tbh
                                startLineColor: this.widgetHelper.getWidgetConfig().eventLineStartColor,
                                endLineColor: this.widgetHelper.getWidgetConfig().eventLineEndColor,
                                tooltip: `${ann.name} (${ann.type.name})`,
                                fontColor: this.widgetHelper.getWidgetConfig().fontColor,
                                fontSize: this.widgetHelper.getWidgetConfig().fontSize,
                                showContextLabels: this.widgetHelper.getWidgetConfig().showContextLabels
                            };

                            //this.widgetHelper.getWidgetConfig().getChartConfig().fontAwesomeAnnotation.annotations.push(newAnn);
                            this.lineChartData[0].annotations.push(newAnn);
                        }

                    }
                }
            }
        ));

    }



    public lineChartData: (ChartDataSets & any)[] = [];
    public lineChartLabels: Label[] = [];
    public lineChartOptions: ChartOptions & { fontAwesomeAnnotation: { annotations: AnnotationDetail[]; }; };
    public lineChartLegend = true;
    public lineChartType: ChartType = 'line';

    @ViewChild(BaseChartDirective, { static: true }) chart: BaseChartDirective;


    /**
 * Used on the page
 *
 * @returns true if we have devices and measurements selected
 */
    verifyConfig(): boolean {
        return true;
    }

}
