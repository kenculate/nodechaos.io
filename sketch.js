var nodes = [];
var selected_node;
var offsetX;
var offsetY;
var mouse_pressX;
var mouse_pressY;
var dragging = false;
function setup() {
  createCanvas(800, 600);
  nodes.push(new Node(100, 10, 150, 150, "node1"));
  nodes.push(new Node(350, 10, 150, 150, "node2"));
}

function draw() {
  background(220);
  for (let i=0; i < nodes.length; i++)
  {
    nodes[i].is_inside(mouseX, mouseY);
    nodes[i].render();
  }
  if (!selected_node && dragging)
  {
    noFill();
    stroke(10);
    rect(mouse_pressX, mouse_pressY, mouseX - mouse_pressX, mouseY - mouse_pressY);
  }
}

function mousePressed() {
  dragging = true;
  mouse_pressX = mouseX;
  mouse_pressY = mouseY;
  for (let i=nodes.length-1; i >= 0; i--)
  {
    if (nodes[i].is_pressed())
    {
      selected_node = nodes[i];
      offsetX = mouseX - nodes[i].x;
      offsetY = mouseY - nodes[i].y;
      break;
    }
  }
  
}

function mouseDragged() {
  if (selected_node)
  {
    selected_node.x = mouseX - offsetX;
    selected_node.y = mouseY - offsetY;
  }
}

function mouseReleased() {
  dragging = false;
  
  if (selected_node != undefined)
  {
    selected_node.pressed = false;
  }
  selected_node = undefined;
}

class Node{
  constructor(x, y, w, h, title)
  {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.title = title;
    this.hover = false;
    this.pressed = false;
    this.title_height = 20;
    this.knob_size = 20;
  }
  
  render(){
    stroke(150);
    fill(this.pressed ? 150 : this.hover ? 100 : 50);
    rect(this.x, this.y, this.w, this.h);
    
    fill(255);
    textAlign(CENTER, CENTER);
    text(this.title, this.x + 5, this.y, this.w - 5, this.title_height);
    line(this.x, this.y + this.title_height, this.x + this.w, this.y + this.title_height);
    
    noStroke();
    fill(170);
    rect(this.x - this.knob_size, this.y + this.title_height + this.knob_size, this.knob_size, this.knob_size);
    fill(120);
    
    rect(this.x + this.w, this.y + this.title_height + this.knob_size, this.knob_size, this.knob_size);
  }
  
  is_pressed()
  {
    this.pressed = this.hover;
    return this.pressed;
  }
  
  is_inside(x, y)
  {
    this.hover = (x > this.x && x < this.x + this.w &&
        y > this.y && y < this.y + this.h);
    return this.hover;
  }
}