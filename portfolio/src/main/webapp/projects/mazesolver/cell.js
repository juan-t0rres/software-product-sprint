// Cell object class.
// Cells can either be walkable or a wall.
// Stores location and f cost.

function cell(r,c,size){
  this.r = r;
  this.c = c;
  this.x = c*(size);
  this.y = r*(size);
  this.f = Number.MAX_SAFE_INTEGER;
  this.g = Number.MAX_SAFE_INTEGER;
  this.h = Number.MAX_SAFE_INTEGER;
  this.parent = null;
  this.walkable = true;
  this.col = color(255);

  this.makeWall = function() {
    var px = mouseX - this.x;
    var py = mouseY - this.y;
    if(px >= 0 && px < size && py >= 0 && py < size){
      this.col = color(0);
      this.walkable = false;
    }
  }

  this.removeWall = function() {
    var px = mouseX - this.x;
    var py = mouseY - this.y;
    if(px >= 0 && px < size && py >= 0 && py < size){
      this.col = color(255);
      this.walkable = true;
    }
  }

  this.display = function() {
      stroke(0);
      fill(this.col);
      rect(this.x,this.y,size,size);
  }
}