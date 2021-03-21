class Connection {
  constructor(cell1, cell2) {
    this.cell1 = cell1;
    this.cell2 = cell2;
    
    this.flags = {
      hover : false,
      dragging : false,
    };
  }
  
  render() {
    this.render_line();
  }
  
  render_line() {
    stroke(0);
    strokeWeight(2);
    if (this.flags.hover) {
      stroke(200, 0, 0);
      strokeWeight(3);
    }
    if (this.flags.dragging) {
      fill(100, 255, 255);
    }
    
    line(this.cell1.x, this.cell1.y, this.cell2.x, this.cell2.y);
  }
  
  isInside(x, y) {
    const d1 = dist(this.cell1.x, this.cell1.y, x, y);
    const d2 = dist(this.cell2.x, this.cell2.y, x, y);
    
    if (d1 <= this.cell1.radius || d2 <= this.cell2.radius) return false;
    
    const length = dist(this.cell1.x, this.cell1.y, this.cell2.x, this.cell2.y);
    
    const cond1 = (d1 + d2)-0.5 <= length;
    const cond2 = (d1 + d2)+0.5 >= length;
    
    return cond1 && cond2;
  }
  
}