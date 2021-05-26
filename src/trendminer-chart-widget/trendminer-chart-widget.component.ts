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
import { Chart, ChartDataSets, ChartOptions, ChartPoint, ChartType } from "chart.js";
import annotationPlugin from 'chartjs-plugin-annotation';
import { ThemeService, BaseChartDirective, Label, Color } from "ng2-charts";
import { TrendMinerService } from "./trendminer-service";
import { DateTime } from 'luxon';
import { WidgetHelper } from "./widget-helper";
import { WidgetConfig } from "./widget-config";

Chart.pluginService.register(annotationPlugin);

@Component({
    selector: "lib-trendminer-chart-widget",
    templateUrl: "./trendminer-chart-widget.component.html",
    styleUrls: ["./trendminer-chart-widget.component.css"],
    providers: [ThemeService, TrendMinerService]
})
export class TrendminerChartWidget implements OnDestroy, OnInit {
    widgetHelper: WidgetHelper<WidgetConfig>;

    sub: any;
    hasData: boolean = false;
    errorMessage: any;

    @Input() config;

    constructor(private realtime: Realtime, private invSvc: InventoryService, private trendminer: TrendMinerService) { }



    async ngOnInit(): Promise<void> {
        this.widgetHelper = new WidgetHelper(this.config, WidgetConfig); //default access through here

        console.log(this.widgetHelper.getWidgetConfig());
        let startDate = DateTime.fromObject(this.widgetHelper.getWidgetConfig().startDate);
        let endDate = DateTime.fromObject(this.widgetHelper.getWidgetConfig().endDate);

        this.sub = this.trendminer.getDataForId(this.widgetHelper.getWidgetConfig().proxy, startDate, endDate, this.widgetHelper.getWidgetConfig().seriesKeys()).subscribe(
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
                        this.lineChartOptions.scales.yAxes.push({
                            id: `y-${element.tag.id}`,
                            position: 'left',
                        },
                        );
                    }
                });
                this.hasData = this.lineChartData.length > 0;
            },
            error => this.errorMessage = error
        );
    }

    ngOnDestroy(): void {
        this.sub.unsubscribe();
    }


    public lineChartData: ChartDataSets[] = [];
    public lineChartLabels: Label[] = [];
    public lineChartOptions: (ChartOptions & { annotation: any; }) = {
        responsive: true,
        scales: {
            // We use this empty structure as a placeholder for dynamic theming.
            xAxes: [{
                type: 'time',
                time: {
                    unit: 'day'
                },
                display: true,
                scaleLabel: { labelString: "Date" },
            }],
            yAxes: [
                // {
                //     id: 'y-axis-1',
                //     position: 'right',
                //     gridLines: {
                //         color: 'rgba(255,0,0,0.3)',
                //     },
                //     ticks: {
                //         fontColor: 'red',
                //     }
                // }
            ]
        },
        annotation: {
            annotations: [
                {
                    type: 'line',
                    mode: 'vertical',
                    scaleID: 'x-axis-0',
                    value: '2021-05-23',
                    borderColor: 'orange',
                    borderWidth: 2,
                    label: {
                        enabled: true,
                        fontColor: 'orange',
                        content: 'Low Power'
                    }
                },
            ],
        },
    };
    public lineChartColors: Color[] = [
        { // grey
            backgroundColor: 'rgba(148,159,177,0.2)',
            borderColor: 'rgba(148,159,177,1)',
            pointBackgroundColor: 'rgba(148,159,177,1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(148,159,177,0.8)'
        },
        { // dark grey
            backgroundColor: 'rgba(77,83,96,0.2)',
            borderColor: 'rgba(77,83,96,1)',
            pointBackgroundColor: 'rgba(77,83,96,1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(77,83,96,1)'
        },
        { // red
            backgroundColor: 'rgba(255,0,0,0.3)',
            borderColor: 'red',
            pointBackgroundColor: 'rgba(148,159,177,1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(148,159,177,0.8)'
        }
    ];
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
