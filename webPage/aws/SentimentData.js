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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
let aws = require("aws-sdk");
const axios_1 = __importDefault(require("axios"));
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
    getReviewCall(movie_id) {
        const apiKey = "d7204be26def126261b0578c44bc824f";
        let apiUrl = "https://api.themoviedb.org/3/movie/" + movie_id + "/reviews?api_key=" + apiKey;
        return apiUrl;
    }
    getMovieCall(year, genreCode) {
        const apiKey = "d7204be26def126261b0578c44bc824f";
        let apiUrl = "https://api.themoviedb.org/3/discover/movie?api_key=" + apiKey +
            "&with_genres=" + genres[genreCode].code +
            "&primary_release_date.gte=" + year + "-01-01" +
            "&primary_release_date.lte=" + year + "-12-30";
        return apiUrl;
    }
}
class SentimentService {
    constructor(apiCall, year) {
        this.apiCall = apiCall;
        this.year = year;
    }
    getSentimentValue(review) {
        return __awaiter(this, void 0, void 0, function* () {
            let apiUrl = "http://text-processing.com/api/sentiment/";
            let response = yield axios_1.default.post(apiUrl, `text=${encodeURIComponent(review)}`, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
            return response.data;
        });
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
    logData(genreCode, year) {
        return __awaiter(this, void 0, void 0, function* () {
            let count;
            let moviesObj = yield this.getData(this.apiCall);
            for (count = 0; count < 10; count++) {
                try {
                    let movieId = moviesObj.results[count].id;
                    let genApiCall = new generateApiCall();
                    let apiUrl = genApiCall.getReviewCall(movieId);
                    let reviewObj = yield this.getData(apiUrl);
                    let reviewText = reviewObj.results[0].content;
                    let date = yield new Date();
                    let curTime = date.getTime();
                    let reviewValues = yield this.getSentimentValue(reviewText);
                    let params = {
                        TableName: "sentiment_data",
                        Item: {
                            "sent_id": curTime,
                            "review": reviewText,
                            "genre": genres[genreCode].genre,
                            "year": year,
                            "neg": reviewValues.probability.neg,
                            "neurtal": reviewValues.probability.neutral,
                            "pos": reviewValues.probability.pos
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
                }
                catch (err) {
                    console.log("Issue with getting movie ids: " + err);
                }
            }
        });
    }
}
class Main {
    getSentiment() {
        return __awaiter(this, void 0, void 0, function* () {
            let initialYear = 2000;
            let endYear = 2022;
            let genreCode = 0;
            for (genreCode; genreCode < 5; genreCode++) {
                for (let year = initialYear; year <= endYear; year++) {
                    let genApiCall = new generateApiCall();
                    let apiUrl = genApiCall.getMovieCall(year, genreCode);
                    let ss = new SentimentService(apiUrl, year);
                    yield ss.logData(genreCode, year);
                }
            }
        });
    }
}
let main = new Main();
main.getSentiment();
