var size = 860;
var N = size/20;
var grid;

var foundPath;
var curr;

var drawMode;

var start;
var target;

function setup() {
  frameRate(15);
  createCanvas(size,size+40);
  background(220);
  drawMode = true;
  grid = new Array(N);
  for(var i = 0; i < N; i++){
    grid[i] = new Array(N);
    for(var j = 0; j < N; j++){
      grid[i][j] = new cell(i,j,size/N);
    }
  }

  var pathButton = createButton('Find Shortest Path');
  pathButton.position(size/2-40,size+5);
  pathButton.mousePressed(astar);

  var mazeButton = createButton('Generate Random Maze');
  mazeButton.position(10,size+5);
  mazeButton.mousePressed(generateMaze);

  var restartButton = createButton('Restart');
  restartButton.position(size-80,size+5);
  restartButton.mousePressed(restart);

  var drawButton = createButton('Draw');
  drawButton.position(size/4,size+5);
  drawButton.mousePressed(setDrawMode);

  var eraseButton = createButton('Erase');
  eraseButton.position(size/4+60,size+5);
  eraseButton.mousePressed(setEraseMode);

  start = grid[N-1][N-1];
  target = grid[0][0];
  target.col = color(40,130,60);
  start.col = color(190,50,50);
  curr = target;
  foundPath = false;
}

// Adds a wall if in draw mode, otherwise erases a wall.
// If the maze has been solved, then don't do anything.
function mousePressed(){
  if(foundPath)
    return;

  for(var i = 0; i < N; i++){
    for(var j = 0; j < N; j++){
      if(drawMode)
        grid[i][j].makeWall();
      else
        grid[i][j].removeWall();
    }
  }
}

// This lets the user "paint" the maze in.
function mouseDragged(){
  mousePressed();
}

// Displays the maze, if the path has been found, draw the path.
function draw() {
  for(var i = 0; i < N; i++){
    for(var j = 0; j < N; j++){
      grid[i][j].display();
    }
  }
  
  if(foundPath){
    if(curr != curr.parrent){
      curr.col = color(60,125,190);
      curr = curr.parent;
    }
  }
}

function distanceTo(a,b){
  return dist(a.x,a.y,b.x,b.y);
}

// Finds the index of the cell with the smallest F cost.
// Could have used a minheap for faster runtime, but unnecessary for the small size of maze.
function smallestF(open){
  var min = 0;
  for(var i = 0; i < open.length; i++){
    if(open[i].f < open[min].f){
      min = i;
    }
  }
  return min;
}

// Makes sure the index is valid.
function isValid(row, col){
  return row >= 0 && row < N && col >= 0 && col < N;
}

// My implementation of the A* pathfinding algorithm.
// Considers the neighbor cells of the starting cell, and always tries to visit cells with the lowest F cost.
// The F cost is the sum of the distance from the start to the cell, and from the cell to the end.
function astar() {
  if(foundPath)
    return;
  console.log("A* Pathfinding Commencing");
  start.f = 0;
  start.g = 0;
  start.h = 0;
  start.parent = start;

  open = [];
  open.push(start);
  
  while(open.length != 0){
    var posCurr = smallestF(open);
    var q = open[posCurr];
    open.splice(posCurr,1);
    
    var dc = [0,1,1,1,0,-1,-1,-1];
    var dr = [1,1,0,-1,-1,-1,0,1];

    for(var i = 0; i < dc.length; i++){
      var nextR = q.r + dr[i];
      var nextC = q.c + dc[i];
      if(!isValid(nextR,nextC) || !grid[nextR][nextC].walkable)
        continue;
      
      var next = grid[nextR][nextC];
      if(next.r == 0 && next.c == 0){
        next.parent = q;
        foundPath = true;
        console.log("Path found");
        return;
      }
      
      var ng = q.g + distanceTo(next,q);
      var nh = distanceTo(next,target);
      var nf = ng + nh;

      if(next.f == Number.MAX_SAFE_INTEGER || next.f > nf){
        next.g = ng;
        next.h = nh;
        next.f = nf;
        next.parent = q;
        open.push(next);
      }
    }
  }
  console.log("No path found");
  alert('No path found! Try another maze.');
}

// Randomizes the array of walls for maze generation.
function randomize(array) {
  array.sort(() => Math.random() - 0.5);
}

// Generates a random maze using Kruskal's MST algorithm, where every wall is an edge.
// The only modification is that it randomly visits edges instead of going through them from smallest cost.
// Uses disjoint sets to make sure there is no cycle.
function generateMaze(){
  if(foundPath)
    return;
  var walls = [];
  for(var i = 0; i < N; i++){
    for(var j = 0; j < N; j++){
      if(grid[i][j] == start || grid[i][j] == target){
        continue;
      }
      grid[i][j].walkable = false;
      grid[i][j].col = color(0);
      walls.push(grid[i][j]);
    }
  }
  randomize(walls);
  var ds = new dset(N*N);
  var dc = [0,1,1,1,0,-1,-1,-1];
  var dr = [1,1,0,-1,-1,-1,0,1];
  for(var i = 0; i < walls.length; i++){
    var q = walls[i];
    var distinct = true;
    var neighbors = [];
    for(var j = 0; j < dc.length; j++){
      var nextR = q.r + dr[j];
      var nextC = q.c + dc[j];
      if(!isValid(nextR,nextC) || !grid[nextR][nextC].walkable)
        continue;
      var parent = ds.find(nextR*N + nextC);
      if(neighbors.includes(parent)){
        distinct = false;
        break;
      }
      neighbors.push(parent);
    }
    if(!distinct)
      continue;
    q.walkable = true;
    q.col = color(255);
    for(var j = 1; j < neighbors.length; j++){
      ds.union(neighbors[j],neighbors[j-1]);
    }
  }
}

// Restarts the maze.
function restart() {
  for(var i = 0; i < N; i++){
    for(var j = 0; j < N; j++){
      grid[i][j] = new cell(i,j,size/N);
    }
  }

  start = grid[N-1][N-1];
  target = grid[0][0];
  start.col = color(190,50,50);
  target.col = color(40,130,60);

  curr = target;
  foundPath = false;
}

function setDrawMode(){
  drawMode = true;
}

function setEraseMode(){
  drawMode = false;
}