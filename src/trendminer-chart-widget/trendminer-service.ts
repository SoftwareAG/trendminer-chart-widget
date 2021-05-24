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

    getDataForId(startDate: DateTime, endDate: DateTime, ids: string[], intervals: number = 150, shiftVal: number = 0) {

        let sUrl = 'https://kalpshekhargupta.gateway.webmethodscloud.de/gateway/TrendMinerProxy/1.0/restv2/tmproxy/compute/newFocusChart';

        let bodyVal = {
            "request": {
                "timePeriod": {
                    "startDate": `${startDate.toISO()}`,//"2019-05-04T16:30:00.000Z",
                    "endDate": `${endDate.toISO()}`,//"2019-05-04T22:00:00.000Z"
                },
                "queries": [],
                "parameters": {
                    "numberOfIntervals": `${intervals}`
                }
            }
        };

        ids.forEach(id => {
            bodyVal.request.queries.push({
                "id": id,
                "interpolationType": "linear",
                "shift": `${shiftVal}`
            });
        });

        return this.http.post(sUrl, bodyVal);
    }

    searchIds(searchTerm: string) {
        let sUrl = 'https://kalpshekhargupta.gateway.webmethodscloud.de/gateway/TrendMinerProxy/1.0/restv2/tmproxy/ds/timeseries/search?page=0&size=20&sort=name%2Casc';
        let bodyVal = {
            "request":
            {
                "query": `(name=='*${searchTerm}*' or description=='*${searchTerm}*') and datasource.id=in=('11111111-1111-1111-1111-111111111113','11111111-1111-1111-1111-111111111114','11111111-1111-1111-1111-111111111112','11111111-1111-1111-1111-111111111115','11111111-1111-1111-1111-111111111116')`
            }
        };
        console.log(bodyVal);
        return this.http.post(sUrl, bodyVal).pipe(map((item: any) => item.content.map(v => v.name)));
    }

}

