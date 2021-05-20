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
import { ChartDataSets, ChartOptions, ChartType } from "chart.js";
import { ThemeService, BaseChartDirective, Label, Color } from "ng2-charts";
import { TrendMinerService } from "./trendminer-service";
import { DateTime } from 'luxon';

@Component({
    selector: "lib-trendminer-chart-widget",
    templateUrl: "./trendminer-chart-widget.component.html",
    styleUrls: ["./trendminer-chart-widget.component.css"],
    providers: [ThemeService, TrendMinerService]
})
export class TrendminerChartWidget implements OnDestroy, OnInit {
    widgetConfiguration: any;

    @Input() set config(newConfig: any) {
        this.widgetConfiguration = newConfig;
    }

    constructor(private realtime: Realtime, private invSvc: InventoryService, private trendminer: TrendMinerService) { }

    async ngOnInit(): Promise<void> {
        let data: any = this.trendminer.getDataForId(["TM-TSP-FI1056", "[SD]power"]);
        data.forEach(element => {
            let name = element.tag.id;
            let labels = element.values.map(v => DateTime.fromISO(v.ts).toLocaleString());
            let vals = element.values.map(v => v.value);
            this.lineChartData.push({ data: vals, label: name, yAxisID: `y-${element.tag.id}` });
            this.lineChartLabels = labels;
            this.lineChartOptions.scales.yAxes.push({
                id: `y-${element.tag.id}`,
                position: 'left',
            },
            );
        });
    }

    ngOnDestroy(): void { }


    public lineChartData: ChartDataSets[] = [];
    public lineChartLabels: Label[] = [];
    public lineChartOptions: ChartOptions = {
        //        public lineChartOptions: (ChartOptions & { annotation: any; }) = {
        responsive: true,
        scales: {
            // We use this empty structure as a placeholder for dynamic theming.
            xAxes: [{}],
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
        // annotation: {
        //     annotations: [
        //         {
        //             type: 'line',
        //             mode: 'vertical',
        //             scaleID: 'x-axis-0',
        //             value: 'March',
        //             borderColor: 'orange',
        //             borderWidth: 2,
        //             label: {
        //                 enabled: true,
        //                 fontColor: 'orange',
        //                 content: 'LineAnno'
        //             }
        //         },
        //     ],
        // },
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
