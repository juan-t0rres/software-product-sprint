var size = 450;
var N = 9;
var solved = false;

var grid;
var clearButton;
var solveButton;
var inp;

// Sets up the grid so the user can input a sudoku board.
function setup() {
  createCanvas(size, size+30);

  solveButton = createButton('solve');
  solveButton.position(165,455);
  solveButton.mousePressed(solve);

  clearButton = createButton('clear');
  clearButton.position(235,455);
  clearButton.mousePressed(clearScreen);

  inp = new Array(N);
  for(var i = 0; i < N; i++){
    inp[i] = new Array(N);
    for(var j = 0; j < N; j++){
      inp[i][j] = createInput('');
      inp[i][j].size(size/(5*N));
      var x = j*(size/N);
      var y = i*(size/N);
      inp[i][j].position(x+18,y+15);
    }
  }
}

// Updates the board. If the board has been solved displays a correct solution.
function draw() {
  textSize(20);
  background(255);
  stroke(0);
  strokeWeight(1);
  for(var i = 0; i < N; i++){
    for(var j = 0; j < N; j++){
      var x = j*(size/N);
      var y = i*(size/N);
      fill(255);
      rect(x,y,size/N,size/N);
      if(solved){
        fill(0);
        text(grid[i][j],x+20,y+30);
      }
    }
  }
  drawLayout();
}

// Checks if you can place num at index (row,col).
function canPlace(num, row, col){
  // check row
  for(var i = 0; i < N; i++){
    if(i == row)
      continue;
    if(num == grid[i][col])
      return false;
  }
  // check col
  for(var i = 0; i < N; i++){
    if(i == col)
      continue;
    if(num == grid[row][i])
      return false;
  }
  // check box
  var r = (Math.floor(row/3)) * 3;
  var c = (Math.floor(col/3)) * 3;
  for(var i = r; i < r + 3; i++){
    for(var j = c; j < c + 3; j++){
      if(i == row && j == col)
        continue;
      if(grid[i][j] == num)
        return false;
    }
  }
  return true;
}

// The helper function for solve.
// This function tries to place numbers 1 to N at each spot, backtracking at incorrect states.
function helper(r, c){
  if(r == N)
    return true;

  var nextC = c + 1;
  var nextR = r;
  if(nextC == N){
    nextC = 0;
    nextR++;
  }

  if(grid[r][c] != 0)
    return helper(nextR,nextC);

  var solved = false;
  for(var i = 1; i <= N; i++){
    if(canPlace(i,r,c)){
      grid[r][c] = i;
      solved = helper(nextR,nextC);
    }
    if(solved)
      break;
    grid[r][c] = 0;
  }
  return solved;
}

// Solves the board, alerts the user if the board cannot be solved.
function solve(){
  solved = true;
  grid = new Array(N);
  for(var i = 0; i < N; i++){
    grid[i] = new Array(N);
    for(var j = 0; j < N; j++){
      inp[i][j].hide();
      grid[i][j] = 0;
      if(inp[i][j].value() != 0)
        grid[i][j] = parseInt(inp[i][j].value());
      if(inp[i][j].value() < 0 || inp[i][j].value() > 9)
        solved = false;
    }
  }

  if(!solved){
    alert("You have entered an invalid number!");
    clearScreen();
    return;
  }

  for(var i = 0; i < N; i++){
    for(var j = 0; j < N; j++){
      if(grid[i][j] == 0)
        continue;
      if(!canPlace(grid[i][j], i, j)){
        alert("The board you have entered cannot be solved!");
        solved = false;
        clearScreen();
        return;
      }
    }
  }
  solved = helper(0,0);
  if(!solved){
    alert("The board you have entered cannot be solved!");
    clearScreen();
  }
}

// Clears the board.
function clearScreen(){
  for(var i = 0; i < N; i++){
    for(var j = 0; j < N; j++){
      grid[i][j] = 0;
      inp[i][j].value('');
      inp[i][j].show();
    }
  }
}

// Draws the lines to make the board look like a sudoku board.
function drawLayout(){
  stroke(50);
  strokeWeight(3);
  line(0,0,450,0);
  line(450,0,450,450);
  line(0,0,0,450);
  line(0,450,450,450);
  line(size/3,0,size/3,size-2);
  line(2*(size/3),0,2*(size/3),size-2);
  line(0,size/3,size-2,size/3);
  line(0,2*(size/3),size-2,2*(size/3));
}