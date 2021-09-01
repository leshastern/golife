import React from 'react';
import Cell from './Components/Cell'
import Axios from 'axios'
import Result from './Components/Result'
import "typeface-roboto";
import './Game.css';


const CELL_SIZE = 20;
const WIDTH = 1200;
const HEIGHT = 800;



class Game extends React.Component {

    constructor() {
        super();
        this.rows = HEIGHT / CELL_SIZE;
        this.cols = WIDTH / CELL_SIZE;

        this.board = this.makeEmptyBoard();
    }

    state = {
        cells: [],
        isRunning: false,
        isFirstStep: true,
        interval: 100,
        generations: 0,
        records: [],
        userName: "",
    }

    componentDidMount() {
        Axios.get("http://localhost:3001/api/get")
        .then ((response) => {
            this.setState({records: response.data});
        })
    }
    addRecord(gens) {
        Axios.post("http://localhost:3001/api/add", {generations: gens})
        .then(() =>{
            console.log("Ваш результат записан. Начните новую игру")
        })
    }

    checkSituation (callback) {
        if (!this.state.isFirstStep) {
            callback(this.state.generations);
        } else {
            this.setState({isFirstStep: false})
        }
    }

    makeEmptyBoard() {
        let board = [];
        for (let y = 0; y < this.rows; y++) {
            board[y] = [];
            for (let x = 0; x < this.cols; x++) {
                board[y][x] = false;
            }
        }

        return board;
    }


    makeCells() {
        let cells = [];
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                if (this.board[y][x]) {
                    cells.push({ x, y });
                }
            }
        }

        return cells;
    }


    start = () => {
        this.setState({ isRunning: true });
        this.runIteration();
    }

    stop = () => {
        this.setState({ isRunning: false });
        if (this.steps) {
            window.clearTimeout(this.steps);
            this.steps = null;
        }
    }

    runIteration() {
        let newBoard = this.makeEmptyBoard();
        this.setState({generations: this.state.generations + 1})
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                let neighbors = this.calculateNeighbors(this.board, x, y);
                if (this.board[y][x]) {
                    if (neighbors === 2 || neighbors === 3) {
                        newBoard[y][x] = true;
                    } else {
                        newBoard[y][x] = false;
                    }
                } else {
                    if (!this.board[y][x] && neighbors === 3) {
                        newBoard[y][x] = true;
                    }
                }
            }
        }

        this.board = newBoard;
        this.setState({ cells: this.makeCells() });

        this.steps = window.setTimeout(() => {
            this.runIteration();
        }, this.state.interval);
    }

    calculateNeighbors(board, x, y) {
        let neighbors = 0;
        const dirs = [[-1, -1], [-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1]];
        for (let i = 0; i < dirs.length; i++) {
            const dir = dirs[i];
            let y1 = y + dir[0];
            let x1 = x + dir[1];

            if (x1 >= 0 && x1 < this.cols && y1 >= 0 && y1 < this.rows && board[y1][x1]) {
                neighbors++;
            }
        }

        return neighbors;
    }

    clear = () => {
        this.checkSituation(this.addRecord);
        this.board = this.makeEmptyBoard();
        this.setState({ cells: this.makeCells() });
        this.setState({generations: 0});
        if (this.steps) {
            window.clearTimeout(this.steps);
            this.steps = null;
        }
    }

    generateCells = () => {
        this.checkSituation(this.addRecord);
        this.setState({generations: 0})
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                this.board[y][x] = (Math.random() >= 0.5);
            }
        }
        this.setState({ cells: this.makeCells() });
    }

    render() {
        const { cells, isRunning, records } = this.state;
        return (
            <div className="container">
                <div className="controls">
                    <div className = "controls_item">
                    <button className="button" onClick={this.generateCells}>Сгенерировать</button>
                    </div>
                    <div className = "controls_item">
                    {isRunning ?
                        <button className="button" onClick={this.stop}>Стоп</button> :
                        <button className="button" onClick={this.start}>Пуск</button>
                    }
                    </div>
                    <div className = "controls_item">
                    <button className="button" onClick={this.clear}>Отчистить</button>
                    </div>
                    
                </div>
                
                <div className = "main">
                    <div className = "main_board">
                        <div className="Board"
                            style={{ width: WIDTH, height: HEIGHT, backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`}}
                            ref={(n) => { this.boardRef = n; }}>
                            
                            {cells.map(cell => (
                            <Cell x={cell.x} y={cell.y} key={`${cell.x},${cell.y}`}/>
                            ))}
                            
                        </div>
                        <div> 
                        <p>Generations: {this.state.generations} </p>
                            </div>
                        
                        <div>
                            
                        </div>
                        </div>
                        <div className = "Results">
                        <p>Таблица рекордов: </p>
                        {records.map((record, i) => <Result number = {i} res = {record.generations} />)}
                        </div>
                </div>
                
            
            </div>
        );
    }
}


export default Game;