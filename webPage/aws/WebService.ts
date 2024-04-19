let aws = require("aws-sdk");

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

class generateApiCall {
    getApiCall(year: number, genreCode: number){
        const apiKey = "d7204be26def126261b0578c44bc824f";
        let apiUrl = "https://api.themoviedb.org/3/discover/movie?api_key="+apiKey+
        "&with_genres="+genres[genreCode].code+
        "&primary_release_date.gte="+year+"-01-01"+
        "&primary_release_date.lte="+year+"-12-30";
        return apiUrl;
    }
}

class WebService {
    apiCall: string;
    year: number;

    constructor(apiCall: string, year: number){
        this.apiCall = apiCall;
        this.year = year;
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

    async logData(genreCode: number){
        let genreObj = await this.getData(this.apiCall);
        let date: Date = await new Date();
        let curTime = date.getTime();
        let params = {
            TableName: "no_of_movies",
            Item: {
                "nom_id": curTime,
                "genre": genres[genreCode].genre,
                "amount": genreObj.total_results,
                "year": this.year
            }
        }

        documentClient.put(params, (err,data) => {
            if(err){
                console.log("Error."+JSON.stringify(err));
            }else{
                console.log("Successful.");
            }
        });
    }
}

class Main{
    async runWebservice(){
        let initialYear: number = 2000;
        let endYear: number = 2023;
        let genreCode: number = 0;
        for(genreCode; genreCode<5; genreCode++){
            for(let year = initialYear; year<=endYear; year++){
                let genApiCall: generateApiCall = new generateApiCall();
                let apiUrl = genApiCall.getApiCall(year,genreCode);
                let webservice: WebService = new WebService(apiUrl, year);
                await webservice.logData(genreCode);
            }
        }
    }
}

let main: Main = new Main();
main.runWebservice();
