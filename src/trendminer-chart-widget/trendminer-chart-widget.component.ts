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
import annotationPlugin from 'chartjs-plugin-annotation';
import { ThemeService, BaseChartDirective, Label, Color } from "ng2-charts";
import { TrendMinerService } from "./trendminer-service";
import { DateTime, Interval, DurationUnit, DurationObjectUnits } from 'luxon';
import { WidgetHelper } from "./widget-helper";
import { WidgetConfig } from "./widget-config";
import { BehaviorSubject, combineLatest, Observable, of } from "rxjs";
import { map } from "rxjs/operators";

Chart.pluginService.register(annotationPlugin);

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
        console.log(this.widgetHelper.getWidgetConfig());

        this.startDate$ = new BehaviorSubject(this.widgetHelper.getWidgetConfig().startDate);
        this.endDate$ = new BehaviorSubject(this.widgetHelper.getWidgetConfig().endDate);
        this.startTime$ = new BehaviorSubject(this.widgetHelper.getWidgetConfig().startTime);
        this.endTime$ = new BehaviorSubject(this.widgetHelper.getWidgetConfig().endTime);
        this.proxy$ = new BehaviorSubject(this.widgetHelper.getWidgetConfig().proxy);

        this.driverObs = combineLatest([this.proxy$, this.startDate$, this.endDate$, this.startTime$, this.endTime$]).subscribe(
            ([p, s, e, st, et]) => {
                console.log("CHANGE");
                this.getData(p, s, e, st, et);
            }
        );

        this.lineChartOptions = this.widgetHelper.getWidgetConfig().chartConfig;

        if (this.widgetHelper.getWidgetConfig().realtime) {
            console.log("Setting Refresh");
            this.timerVar = setInterval(this.forceRefresh, this.widgetHelper.getWidgetConfig().refreshPeriodMinutes * 60 * 1000, this);
        }

    }

    getRefresh() {
        return this.widgetHelper.getWidgetConfig().realtime;
    }


    toggleRefresh() {
        this.widgetHelper.getWidgetConfig().realtime = !this.widgetHelper.getWidgetConfig().realtime;
        if (this.widgetHelper.getWidgetConfig().realtime) {
            console.log("Setting Refresh");
            this.timerVar = setInterval(this.forceRefresh, this.widgetHelper.getWidgetConfig().refreshPeriodMinutes * 60 * 1000, this);
        } else {
            console.log("Clearing Refresh");
            clearInterval(this.timerVar);
        }
    }

    forceRefresh(comp: TrendminerChartWidget) {
        console.log("Refresh Data");
        comp.widgetHelper.getWidgetConfig().endDate = DateTime.now().toISODate();
        comp.widgetHelper.getWidgetConfig().endTime = DateTime.now().toLocaleString(DateTime.TIME_24_SIMPLE);
        comp.emitValues();
    }

    ngOnDestroy(): void {
        this.sub.forEach(s => s.unsubscribe());
        this.driverObs.unsubscribe();
    }

    getData(prox: string, startDate: string, endDate: string, startTime: string, endTime: string) {
        let startDateTime = DateTime.fromISO(`${startDate}T${startTime}`);
        let endDateTime = DateTime.fromISO(`${endDate}T${endTime}`);

        //clear previous before next - async calls effectively
        this.sub.forEach(s => s.unsubscribe());
        this.widgetHelper.getWidgetConfig().chartConfig.scales.xAxes[0].time.unit = <TimeUnit>this.widgetHelper.getWidgetConfig().chartUnit;
        this.sub.push(this.trendminer.getDataForId(prox, startDateTime.toISO(), endDateTime.toISO(), this.widgetHelper.getWidgetConfig().seriesKeys()).subscribe(
            (data: any[]) => {
                this.lineChartData = [];
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
                        // this.lineChartLabels = [...new Set([...labels.map(d => d.toString()), this.lineChartLabels.map(d => d.toString())])];
                        this.widgetHelper.getWidgetConfig().chartConfig.scales.yAxes.push({
                            id: `y-${element.tag.id}`,
                            position: 'left',
                        },
                        );
                    }
                });
                this.hasData = this.lineChartData.length > 0;
            },
            error => this.errorMessage = error
        ));


        if (this.widgetHelper.getWidgetConfig().showContext) {
            // let components = this.widgetHelper.getWidgetConfig().seriesNames.map(s => s.id);
            this.sub.push(this.trendminer.getContextItems(prox, `${this.widgetHelper.getWidgetConfig().startDate}T${this.widgetHelper.getWidgetConfig().startTime}:00Z`, `${this.widgetHelper.getWidgetConfig().endDate}T${this.widgetHelper.getWidgetConfig().endTime}:00Z`, this.widgetHelper.getWidgetConfig().seriesNames).subscribe(
                (data: any) => {
                    let annotations = data.content.map(c => {
                        return { name: c.shortKey, type: { ...c.type }, startDate: c.startEventDate, endDate: c.endEventDate };
                    }).sort((a, b) => DateTime.fromISO(a.startDate) < DateTime.fromISO(b.startDate));

                    this.lineChartOptions.annotation.annotations = [];
                    for (let index = 0; index < annotations.length; index++) {
                        const ann = annotations[index];
                        console.log(ann);
                        this.lineChartOptions.annotation.annotations.push(
                            //now add these
                            {
                                type: 'line',
                                mode: 'vertical',
                                scaleID: 'x-axis-0',
                                value: ann.startDate,
                                borderColor: 'orange',
                                borderWidth: 2,
                                label: {
                                    enabled: true,
                                    fontColor: 'orange',
                                    content: ann.name,
                                }
                            }
                        );


                    }
                    console.log(this.widgetHelper.getWidgetConfig().chartConfig.annotation.annotations);
                },
                error => this.errorMessage = error
            ));
        }
    }



    public lineChartData: ChartDataSets[] = [];
    public lineChartLabels: Label[] = [];
    public lineChartOptions: ChartOptions & { annotation: any; };
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
