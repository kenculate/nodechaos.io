let zoom = 1; // scaleFactor
var nodes = [];
var selected_node;
var input_knob;
var output_knob;
var offsetX;
var offsetY;
var mouse_pressX;
var mouse_pressY;
var last_mousex;
var last_mousey;
var panx = 0;
var pany = 0;
var dragging = false;
var panning = false;
var layer1 = [];

function rand(min, max)
{
  return Math.random() * (max-min) + min;
}

function setup() {
  createCanvas(10000, 10000);
  
  nodes.push(new Node(100, 100, 150, 150, "node1"));
  nodes.push(new Node(350, 10, 150, 150, "node2"));
}

function add_nodes()
{
  for(let i=0; i<1000; i++)
  {
    nodes.push(new Node(Math.random()*10000, Math.random()*10000, 150, 150, "node" + i));
  }
  for(let i=0; i<1000; i++)
  {
    let ri = int(Math.random()*(nodes.length));
    let node = nodes[int(Math.random()*(nodes.length))];
    let knob = node.knob2;
    knob.edges.push(
      new Edge(
        nodes[int(Math.random()*(nodes.length))].knob1, 
        nodes[int(Math.random()*(nodes.length))].knob2));
  }
}

function transposex(v){
  return (v - panx)/ zoom ;
}

function transposey(v){
  return (v - pany)/ zoom ;
}

function draw() {
  background(220);
  if (panning)
  {
    
  }
  translate(panx, pany);
  scale(zoom);
  
  for (let i=0; i < layer1.length; i++)
  {
    layer1[i]();
  }
  while(layer1.length>0)
  {
    layer1.pop();
  }
  for (let i=0; i < nodes.length; i++)
  {
    if (!dragging)
    {
      nodes[i].is_inside(transposex(mouseX), transposey(mouseY));
    }
    else
    {
      if (nodes[i].intersect(transposex(mouse_pressX), transposey(mouse_pressY), transposex(mouseX), transposey(mouseY)))
      {
        nodes[i].hover = true;
      }
    }
    
    
    nodes[i].render();
  }
  
  if (!selected_node && dragging)
  {
    noFill();
    stroke(10);
    rect(transposex(mouse_pressX), transposey(mouse_pressY), (mouseX - mouse_pressX) / zoom, (mouseY - mouse_pressY) / zoom);
  }
  scale(1/zoom);
  translate(-panx, -pany);
  
  fill(255, 0, 0);
  textSize(20);
  text("fps:" + int(frameRate()), 10, 10, 200, 50);
}

function mousePressed(event) {
  mouse_pressX = mouseX;
  mouse_pressY = mouseY;
    
  if (mouseButton === CENTER)
  {
    panning = true;
    last_mousex = mouseX;
    last_mousey = mouseY;
  }
  else
  {
    panning = false;
    dragging = true;
    if (output_knob != undefined)
    {
      output_knob.pressed = false;
    }
    var knob_clicked = false;
    for (let i=nodes.length-1; i >= 0; i--)
    {
      if (nodes[i].is_pressed())
      {
        selected_node = nodes[i];
        offsetX = ((mouseX / zoom) - nodes[i].x);
        offsetY = ((mouseY / zoom) - nodes[i].y);
        break;
      }
      if (output_knob != undefined)
      {
        if (nodes[i].knob1.hover)
        {
          input_knob = nodes[i].knob1;
          output_knob.edges.push(new Edge(input_knob, output_knob));

          output_knob.pressed = false;
          input_knob = undefined;
          output_knob = undefined;
          break;
        }
      }
      else
      {
        if (nodes[i].knob2.hover)
        {
          output_knob = nodes[i].knob2;
          output_knob.pressed = true;
          knob_clicked = true;
          break;
        }  
      }
    }
    if (!knob_clicked)
    {
      if (output_knob != undefined)
      {
        output_knob.pressed = false;
        output_knob = undefined;
      }
    }
  }
}

function mouseDragged() {
  if (selected_node)
  {
    selected_node.x = ((mouseX / zoom) - offsetX);
    selected_node.y = ((mouseY / zoom) - offsetY);
  }
  if (panning)
  {
    panx += mouseX - last_mousex;
    pany += mouseY - last_mousey;
    last_mousex = mouseX;
    last_mousey = mouseY;
  }
}

function mouseReleased() {
  dragging = false;
  panning = false;
  if (selected_node != undefined)
  {
    selected_node.pressed = false;
    
  }
  mouse_pressX = 0;
  mouse_pressY = 0;
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
    this.knob1 = new Knob(0, 0, 20, 20);
    this.knob2 = new Knob(0, 0, 20, 20);
    this.knob_rect1 = [0, 0, 0, 0];
    this.knob_rect2 = [0, 0, 0, 0];
    this.knob_hover = 0;
  }
  
  render(){
    noStroke();
    fill(this.pressed ? 150 : this.hover ? 100 : 50);
    rect(this.x, this.y, this.w, this.h);
    
    fill(255);
    // textAlign(CENTER, CENTER);
    text(this.title, this.x + 5, this.y, this.w - 5, this.title_height);
    
    this.knob1.set_rect(this.x - this.knob_size, this.y + this.title_height + this.knob_size, this.knob_size, this.knob_size);
    this.knob2.set_rect(this.x + this.w, this.y + this.title_height + this.knob_size, this.knob_size, this.knob_size);
    
    noStroke();
    this.knob1.render();
    this.knob2.render();
    
  }
  
  is_pressed()
  {
    this.pressed = this.hover;
    return this.pressed;
  }
  
  intersect(left, top, right, bottom)
  {
    
    // [right, left] = right<left ? [left, right] : [right, left];
    // [top, bottom] = top < bottom ? [bottom, top] : [top, bottom];
    // if(right<left)
    // {
    //   [right, left] = [left, right];
    // }
    // if (top < bottom)
    // {
    //   [top, bottom] = [bottom, top];
    // }
    // rect(left, top, right - left, bottom - top);
    return this.x > left && this.x + this.w < right && this.y > top && this.y + this.h < bottom;
  }
  
  rect_check(xin, yin, x, y, w, h)
  {
    return (xin > x && xin < x + w && yin > y && yin < y + h);
  }
  
  is_inside(x, y)
  {
    this.hover = this.rect_check(x, y, this.x, this.y, this.w, this.h);
    
    this.knob1.hover = this.rect_check(x, y, this.knob1.x, this.knob1.y,  this.knob1.w, this.knob1.h);
    this.knob2.hover = this.rect_check(x, y, this.knob2.x, this.knob2.y,  this.knob2.w, this.knob2.h);
    
    return this.hover;
  }
}

class Knob{
  constructor(x, y, w, h, type)
  {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.type = type;
    this.hover = false;
    this.pressed = false;
    this.edges = [];
  }
  
  set_rect(x, y, w, h)
  {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }
  
  render()
  {
    for (let i=0; i < this.edges.length; i++)
    {
      let r = (edge=this.edges[i]) => {edge.render();}
      layer1.push(r);
      // this.edges[i].render();
    }
    noStroke();
    fill(this.pressed ? [255, 0, 0] : this.hover ? 170 : 100);
    rect(this.x, this.y, this.w, this.h);
  }
}

class Edge
{
  constructor(input, output)
  {
    this.input = input;
    this.output = output;
  }
  
  render()
  {
    stroke(0, 0, 255);
    line(this.output.x + (this.output.w /2), this.output.y + (this.output.h /2), 
         this.input.x + (this.input.w /2), this.input.y + (this.input.w /2));
  }
}



window.addEventListener("wheel", function(e) {
  if (e.deltaY < 0)
    zoom *= 1.05;
  else
    zoom *= 0.95;
});