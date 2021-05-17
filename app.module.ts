/** @format */

import { NgModule } from "@angular/core";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterModule as NgRouterModule } from "@angular/router";
import { UpgradeModule as NgUpgradeModule } from "@angular/upgrade/static";
import { CoreModule, HOOK_COMPONENTS, RouterModule } from "@c8y/ngx-components";
import { DashboardUpgradeModule, UpgradeModule, HybridAppModule, UPGRADE_ROUTES } from "@c8y/ngx-components/upgrade";
import { AssetsNavigatorModule } from "@c8y/ngx-components/assets-navigator";
import { CockpitDashboardModule } from "@c8y/ngx-components/context-dashboard";
import { ReportsModule } from "@c8y/ngx-components/reports";
import { SensorPhoneModule } from "@c8y/ngx-components/sensor-phone";
import { TrendminerChartWidgetConfig } from "./src/trendminer-chart-widget/trendminer-chart-widget.config.component";
import { TrendminerChartWidget } from "./src/trendminer-chart-widget/trendminer-chart-widget.component";
import { ChartsModule } from "ng2-charts";

@NgModule({
    imports: [
        BrowserAnimationsModule,
        RouterModule.forRoot(),
        NgRouterModule.forRoot([...UPGRADE_ROUTES], { enableTracing: false, useHash: true }),
        CoreModule.forRoot(),
        AssetsNavigatorModule,
        ReportsModule,
        NgUpgradeModule,
        DashboardUpgradeModule,
        CockpitDashboardModule,
        SensorPhoneModule,
        UpgradeModule,
        ChartsModule
    ],
    declarations: [TrendminerChartWidget, TrendminerChartWidgetConfig],
    entryComponents: [TrendminerChartWidget, TrendminerChartWidgetConfig],
    providers: [
        {
            provide: HOOK_COMPONENTS,
            multi: true,
            useValue: [
                {
                    id: "com.softwareag.globalpresales.trendminer.chart.widget",
                    label: "TrendMiner Chart",
                    description: "Allows display of TrendMiner Chart data",
                    component: TrendminerChartWidget,
                    configComponent: TrendminerChartWidgetConfig,
                    previewImage: require("./assets/img-preview.png"),
                    data: {
                        ng1: {
                            options: {
                                noDeviceTarget: true,
                                noNewWidgets: false,
                                deviceTargetNotRequired: true,
                                groupsSelectable: true
                            },
                        }
                    }
                },
            ],
        },

    ],
})
export class AppModule extends HybridAppModule {
    constructor(protected upgrade: NgUpgradeModule) {
        super();
    }
}
