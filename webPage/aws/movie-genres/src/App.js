import './css/App.css';
import iconAction from "./css/img/icons8-action-100.png";
import iconAnimation from "./css/img/icons8-movie-100.png";
import iconComedy from "./css/img/icons8-comedy-100.png";
import iconHorror from "./css/img/icons8-horror-100.png";
import iconSciFi from "./css/img/icons8-sci-fi-96.png";
import iconSynth from "./css/img/icons8-artificial-100.png";
import { genreSelect, synthGraph, synthOff } from "./js/Functionality.js";
import { Render3dObj } from './js/ThreeJsFunction.js';

// HEADER BUTTONS
function genreButton(genreName,genreImg,genrePick){
  return(
    <div className="bttnDiv">
      <div className="bttnContainer">
        <button type="button" className="bttnObj" onClick={
          () => genreSelect(genrePick)
        }>
          <img src={genreImg} alt={genreName}></img>
          <div className="bttnGenreName">{genreName}</div>
        </button>
        <div className="bttnSelectText">selected</div>
        <div className="bttnBar"></div>
      </div>
    </div>
  )
}

function App() {
  return (
    <div id="App">
      <body>
        {/* BACKGROUND TEXT */}
        <div className="bgText" id="numericText">NUMERIC</div>
        <div className="bgText" id="predText">PREDICTIONS</div>
        <div className="bgText" id="synthText">SENTIMENT</div>
        <div id="pageContent">
          <div id="synthGraph">
            <button onClick={
              () => synthOff()
            }>Close</button>
            <div id="synthCont"></div>
          </div>
          <div id="section_container">
            <div id="section_top">
              {genreButton("Action",iconAction,0)}
              {genreButton("Animation",iconAnimation,1)}
              {genreButton("Comedy",iconComedy,2)}
              {genreButton("Horror",iconHorror,3)}
              {genreButton("Science Fiction", iconSciFi,4)}
              <div className="bttnDiv">
              <div className="bttnContainer">
                <button type="button" className="bttnObj" onClick={
                  () => synthGraph()
                }>
                  <img src={iconSynth} alt="Synthetic"></img>
                  <div className="bttnGenreName">Synthetic</div>
                </button>
                <div className="bttnSelectText">selected</div>
                <div className="bttnBar"></div>
              </div>
            </div>
            </div>
            {/* NUMERIC/PREDICTION GRAPHS */}
            <div id="section_middle">
              <div className="graphs">
                <div className='graph'></div>
              </div>
              <div className="graphs">
                <div className='graph'></div>
              </div>
            </div>
            {/* SENTIMENT GRAPH */}
            <div id="section_bottom">
              <div className="graphs">
                <div>
                  <div id="sent_chart"></div>
                  <Render3dObj />
                </div>
              </div>
            </div>
          </div>
        </div>
      </body>
    </div>
  );
}

export default App;
