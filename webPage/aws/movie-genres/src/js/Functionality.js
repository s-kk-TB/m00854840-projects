import { createChart, createMultiLine, createSentGraph } from "./ChartsFunction.js";
import ReactDOM from 'react-dom';

/* THREEJS FUNCTION VALUES */
sessionStorage.setItem("neg",0);
sessionStorage.setItem("neutral",0);
sessionStorage.setItem("pos",0);
sessionStorage.setItem("total",0);

let conn =  new WebSocket("wss://pmwogmdt59.execute-api.us-east-1.amazonaws.com/production/");

const genres = {
    0: "Action",
    1: "Animation",
    2: "Comedy",
    3: "Horror",
    4: "Science fiction"
}

conn.onopen = function(event){
    console.log("Connected: "+JSON.stringify(event));
};

conn.onmessage = function(req){
    /* Lambda data parse */
    let reqData = JSON.parse(req.data);

    /* Numeric/Sentiment data handelling */
    if(reqData.lambdaId === 1){
        let numData = reqData.no_of_movies;
        let graphLabels = [];
        let graphData = [];
        let genrePicked;
        var count = 0;
        for(count; count<numData.length; count++){
            graphLabels.push(numData[count].year);
            graphData.push(numData[count].amount);
        }
        count = 0;
        for(count; count<5; count++){
            if(numData[0].genre === genres[count]){
                genrePicked = count;
                break;
            }
        }
        let sentData = reqData.sentiment_data;
        let neg = (sentData.neg / sentData.total) * 100;
        let pos = (sentData.pos / sentData.total) * 100;
        sessionStorage.setItem("neg", sentData.neg);
        sessionStorage.setItem("pos", sentData.pos);

        /* Graph creator */
        genreGraph(genrePicked,graphLabels,graphData,neg,pos);
    }

    /* Prediction data handelling */
    if(reqData.lambdaId === 2){
        let numPred = reqData.numPredictives;
        var graphContainers = document.getElementsByClassName("graph");

        /* Plotting graph */
        ReactDOM.render(createMultiLine(
            numPred.years,
            [
                {
                    label: '1st degree',
                    data: numPred.first,
                    borderColor: "#F2380F",
                    borderWidth: 1,
                    pointStyle: 'rectRot',
                    pointRadius: 4
                },
                {
                    label: '2nd degree',
                    data: numPred.second,
                    borderColor: "#730303",
                    borderWidth: 1,
                    pointStyle: 'rectRot',
                    pointRadius: 4
                },
                {
                    label: '3rd degree',
                    data: numPred.third,
                    borderColor: "#328C8C",
                    borderWidth: 1,
                    pointStyle: 'rectRot',
                    pointRadius: 4
                }
            ]
        ),graphContainers[1])
        }
}

conn.onerror = function(error){
    console.log("Websocket error: "+JSON.stringify(error));
}

/* Call websocket routes */
export const genreSelect = function(genrePicked){
    let genreName = genres[genrePicked];
    let genreObj = {
        action: "no_of_movies", 
        data: genreName
    };
    let synthObj = {
        action: "numPrediction", 
        data: genreName
    };
    conn.send(JSON.stringify(synthObj));
    conn.send(JSON.stringify(genreObj));
}

export const synthOff = function(){
    const synthContainer = document.getElementById("synthGraph");
    synthContainer.style.display = "none";
}

export const synthGraph = async function(){
    let synthData;
    let synthPred;
    let synthMean = [];
    let synth09 = [];
    let synth01 = [];
    const synthGraph = document.getElementById("synthGraph");
    const synthContainer = document.getElementById("synthCont");
    const synthLabels = [];
    for(let i=0; i<=550; i++){
        synthLabels.push(i)
    }

    /* Plot syntheic data & its predictions */
    fetch("/synthetic.json")
        .then((res) => {
            if(!res.ok){
                throw new Error('Response was not ok.')
            }
            return res.json();
        }).then((data) => {
            synthData = data.target;
            fetch("/predictions.json").then((res) => {
                if(!res.ok){
                    throw new Error('Response was not ok.')
                }
                return res.json();
            }).then((data) => {
                synthPred = data.predictions[0];
                for(let i=500; i<=550; i++){
                    synthMean.push(
                        {x: i, y: synthPred.mean[i-500]}
                    )
                }
                for(let i=500; i<=550; i++){
                    let tempQuartile = synthPred.quantiles["0.9"]
                    synth09.push(
                        {x: i, y: tempQuartile[i-500]}
                    )
                }
                for(let i=500; i<=550; i++){
                    let tempQuartile = synthPred.quantiles["0.1"]
                    synth01.push(
                        {x: i, y: tempQuartile[i-500]}
                    )
                }
                synthGraph.style.display = "block";
                ReactDOM.render(createMultiLine(
                    synthLabels,
                    [{
                        label: 'Original',
                        data: synthData,
                        borderColor: "#F2380F",
                        borderWidth: 1,
                        pointStyle: 'rectRot',
                        pointRadius: 2
                    },{
                        label: 'Mean',
                        data: synthMean,
                        borderColor: "#328C8C",
                        borderWidth: 1,
                        pointStyle: 'rectRot',
                        pointRadius: 2
                    },{
                        label: '0.9 Quantile',
                        data: synth09,
                        borderColor: "#730303",
                        borderWidth: 1,
                        pointStyle: 'rectRot',
                        pointRadius: 2
                    },{
                        label: '0.1 Quantile',
                        data: synth01,
                        borderColor: "#D8D9C5",
                        borderWidth: 1,
                        pointStyle: 'rectRot',
                        pointRadius: 2
                    }]
                ),synthContainer)
            }).catch((err) => {
                console.log("Unable to fetch data: "+err);
            })
        }).catch((error) => {
            console.error("Unable to fetch data: "+error);
        })
}

/* Graph creator */
const genreGraph = function(genrePicked,graphLabels,graphData,neg,pos){
    var i=0;
    var bttnContainer = document.getElementsByClassName("bttnContainer");
    var bttnSelectText = document.getElementsByClassName("bttnSelectText");
    var bttnBar = document.getElementsByClassName("bttnBar");
    bttnContainer.item(genrePicked).style.background = "linear-gradient(0deg, rgba(242,56,15,0.35) 0%, rgba(242,56,15,0) 100%)";
    bttnSelectText.item(genrePicked).style.display = "block";
    bttnBar.item(genrePicked).style.display = "block";
    for(i=0; i<5; i++){
        if(i !== genrePicked){
            bttnContainer.item(i).style.background = "none";
            bttnSelectText.item(i).style.display = "none";
            bttnBar.item(i).style.display = "none";
        }
    }

    var graphContainers = document.getElementsByClassName("graph");
    var sentContainer = document.getElementById("sent_chart");
    ReactDOM.render(createChart(genres[genrePicked],graphLabels,graphData), graphContainers[0]);
    ReactDOM.render(createSentGraph(neg,pos),sentContainer);
}