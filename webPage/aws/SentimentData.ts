let aws = require("aws-sdk");
import axios from 'axios';

aws.config.update({
    region: "us-east-1",
    endpoint: "https://dynamodb.us-east-1.amazonaws.com"
})

let documentClient = new aws.DynamoDB.DocumentClient();

let genres: Array<{ genre: string, code: number}> = [
    {genre: "Action", code: 28},
    {genre: "Animation", code: 16},
    {genre: "Comedy", code: 35},
    {genre: "Horror", code: 27},
    {genre: "Science fiction", code: 878}
];

interface SentimentResponse {
    label: string;
    probability: {
        neg: number;
        neutral: number;
        pos: number;
    };
}

class generateApiCall {
    getReviewCall( movie_id: number){
        const apiKey = "d7204be26def126261b0578c44bc824f";
        let apiUrl = "https://api.themoviedb.org/3/movie/"+movie_id+"/reviews?api_key="+apiKey;
        return apiUrl;
    }

    getMovieCall(year: number, genreCode: number){
        const apiKey = "d7204be26def126261b0578c44bc824f";
        let apiUrl = "https://api.themoviedb.org/3/discover/movie?api_key="+apiKey+
        "&with_genres="+genres[genreCode].code+
        "&primary_release_date.gte="+year+"-01-01"+
        "&primary_release_date.lte="+year+"-12-30";
        return apiUrl;
    }
}

class SentimentService {
    apiCall: string;
    year: number;

    constructor(apiCall: string, year: number){
        this.apiCall = apiCall;
        this.year = year;
    }

    async getSentimentValue(review: string): Promise<SentimentResponse> {
        let apiUrl = "http://text-processing.com/api/sentiment/";
        let response = await axios.post<SentimentResponse>(apiUrl, `text=${encodeURIComponent(review)}`, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        return response.data;
    }

    async getData(apiCall: string){
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                fetch(apiCall).then(function(tempData) {
                    resolve(tempData.json());
                }).catch(err => {
                    console.log("Error: "+err);
                    throw(err);
                })
            },3000);
        })
    };

    async logData(genreCode: number, year: number){
        let count: number;
        let moviesObj = await this.getData(this.apiCall);
        for(count = 0; count<10; count++){
            try{
                let movieId = moviesObj.results[count].id;
                let genApiCall: generateApiCall = new generateApiCall();
                let apiUrl = genApiCall.getReviewCall(movieId);
                let reviewObj = await this.getData(apiUrl);
                let reviewText = reviewObj.results[0].content;
                let date: Date = await new Date();
                let curTime = date.getTime();
                let reviewValues = await this.getSentimentValue(reviewText);
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
                }

                documentClient.put(params, (err,data) => {
                    if(err){
                        console.log("Error."+JSON.stringify(err));
                    }else{
                        console.log("Successful.");
                    }
                });
            }catch(err){
                console.log("Issue with getting movie ids: "+err);
            }
        }
    }
}

class Main{
    async getSentiment(){
        let initialYear: number = 2000;
        let endYear: number = 2022;
        let genreCode: number = 0;
        for(genreCode; genreCode<5; genreCode++){
            for(let year = initialYear; year<=endYear; year++){
                let genApiCall: generateApiCall = new generateApiCall();
                let apiUrl = genApiCall.getMovieCall(year, genreCode);
                let ss: SentimentService = new SentimentService(apiUrl, year);
                await ss.logData(genreCode, year);
            }
        }
    }
}
let main: Main = new Main();
main.getSentiment();
