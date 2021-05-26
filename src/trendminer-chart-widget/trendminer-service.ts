import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, map } from 'rxjs/operators';
import { DateTime } from 'luxon';

@Injectable({
    providedIn: 'root',
})
export class TrendMinerService {

    constructor(private http: HttpClient) {

    }

    getContextItems(baseURL: string, startDate: DateTime, endDate: DateTime, components: any[]) {
        let sUrl = `${baseURL}context/item/search?page=0&sort=startEventDate%2Cdesc&size=60&useTimeSeriesIdentifier=true`;

        let bodyVal = {
            "request": {
                "filters": [
                    {
                        "components": [
                        ],
                        "type": "COMPONENT_FILTER"
                    },
                    {
                        "startDate": `${startDate.toISO()} `,
                        "endDate": `${endDate.toISO()} `,
                        "intervalType": "EVENT",
                        "type": "INTERVAL_FILTER"
                    },
                    {
                        "type": "TYPE_FILTER",
                        "valid": true,
                        "types": [
                            "SOLAR040"
                        ]
                    }
                ],
                "viewType": "grid",
                "columnSettings": {
                    "general": [
                        {
                            "name": "startDate",
                            "order": 0
                        },
                        {
                            "name": "duration",
                            "order": 1
                        },
                        {
                            "name": "state",
                            "order": 2
                        },
                        {
                            "name": "type",
                            "order": 3
                        },
                        {
                            "name": "component",
                            "order": 4
                        },
                        {
                            "name": "description",
                            "order": 5
                        }
                    ],
                    "fields": []
                },
                "ganttSettings": {
                    "displayDensity": "REGULAR",
                    "groupBy": "TYPE",
                    "typesOverridingExpandSetting": [],
                    "fieldsOverridingExpandSetting": [],
                    "expandedByDefault": false,
                    "validationResultMessages": []
                },
                "sortSettings": [
                    {
                        "field": "startEventDate",
                        "direction": "desc"
                    }
                ]
            }
        };


        components.forEach(val => {
            bodyVal.request.filters[0].components.push({
                "identifier": val.id,
                "type": "TAG",
                "include": "SELF"
            });
        });

        return this.http.post(sUrl, bodyVal);
    }

    getDataForId(baseURL: string, startDate: DateTime, endDate: DateTime, ids: string[], intervals: number = 150, shiftVal: number = 0) {

        let sUrl = `${baseURL}/compute/newFocusChart`;

        let bodyVal = {
            "request": {
                "timePeriod": {
                    "startDate": `${startDate.toISO()} `,//"2019-05-04T16:30:00.000Z",
                    "endDate": `${endDate.toISO()} `,//"2019-05-04T22:00:00.000Z"
                },
                "queries": [],
                "parameters": {
                    "numberOfIntervals": `${intervals} `
                }
            }
        };

        ids.forEach(val => {
            console.log("ID", val);
            bodyVal.request.queries.push({
                "id": val,
                "interpolationType": "linear",
                "shift": `${shiftVal} `
            });
        });

        return this.http.post(sUrl, bodyVal);
    }

    searchIds(baseURL: string, searchTerm: string) {
        let sUrl = `${baseURL}/ds/timeseries/search?page=0&size=20&sort=name%2Casc`;
        let bodyVal = {
            "request":
            {
                "query": `(name == '*${searchTerm}*' or description == '*${searchTerm}*') and datasource.id =in=('11111111-1111-1111-1111-111111111113', '11111111-1111-1111-1111-111111111114', '11111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111115', '11111111-1111-1111-1111-111111111116')`
            }
        };
        console.log(bodyVal);
        return this.http.post(sUrl, bodyVal).pipe(map((item: any) => item.content.map(v => { return { id: v.id, name: v.name }; })));
    }

}
;
