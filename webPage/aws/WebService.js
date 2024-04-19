"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
let aws = require("aws-sdk");
aws.config.update({
    region: "us-east-1",
    endpoint: "https://dynamodb.us-east-1.amazonaws.com"
});
let documentClient = new aws.DynamoDB.DocumentClient();
let genres = [
    { genre: "Action", code: 28 },
    { genre: "Animation", code: 16 },
    { genre: "Comedy", code: 35 },
    { genre: "Horror", code: 27 },
    { genre: "Science fiction", code: 878 }
];
class generateApiCall {
    getApiCall(year, genreCode) {
        const apiKey = "d7204be26def126261b0578c44bc824f";
        let apiUrl = "https://api.themoviedb.org/3/discover/movie?api_key=" + apiKey +
            "&with_genres=" + genres[genreCode].code +
            "&primary_release_date.gte=" + year + "-01-01" +
            "&primary_release_date.lte=" + year + "-12-30";
        return apiUrl;
    }
}
class WebService {
    constructor(apiCall, year) {
        this.apiCall = apiCall;
        this.year = year;
    }
    getData(apiCall) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    fetch(apiCall).then(function (tempData) {
                        resolve(tempData.json());
                    }).catch(err => {
                        console.log("Error: " + err);
                        throw (err);
                    });
                }, 3000);
            });
        });
    }
    ;
    logData(genreCode) {
        return __awaiter(this, void 0, void 0, function* () {
            let genreObj = yield this.getData(this.apiCall);
            let date = yield new Date();
            let curTime = date.getTime();
            let params = {
                TableName: "no_of_movies",
                Item: {
                    "nom_id": curTime,
                    "genre": genres[genreCode].genre,
                    "amount": genreObj.total_results,
                    "year": this.year
                }
            };
            documentClient.put(params, (err, data) => {
                if (err) {
                    console.log("Error." + JSON.stringify(err));
                }
                else {
                    console.log("Successful.");
                }
            });
        });
    }
}
class Main {
    runWebservice() {
        return __awaiter(this, void 0, void 0, function* () {
            let initialYear = 2000;
            let endYear = 2023;
            let genreCode = 0;
            for (genreCode; genreCode < 5; genreCode++) {
                for (let year = initialYear; year <= endYear; year++) {
                    let genApiCall = new generateApiCall();
                    let apiUrl = genApiCall.getApiCall(year, genreCode);
                    let webservice = new WebService(apiUrl, year);
                    yield webservice.logData(genreCode);
                }
            }
        });
    }
}
let main = new Main();
main.runWebservice();
