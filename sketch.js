let zoom = 0.1; // scaleFactor
var nodes = [];
var selected_node;
var input_knob;
var output_knob;
var offsetX;
var offsetY;
var mouse_pressX;
var mouse_pressY;
var dragging = false;
var layer1 = [];
function setup() {
  createCanvas(8000, 6000);
  for(let i=0; i<1000; i++)
  {
    nodes.push(new Node(Math.random()*7000, Math.random()*5000, 150, 150, "node" + i));
  }
  nodes.push(new Node(100, 10, 150, 150, "node1"));
  nodes.push(new Node(350, 10, 150, 150, "node2"));
}

function draw() {
  background(220);
  scale(zoom);
  
  // for (let i=0; i < layer1.length; i++)
  // {
  //   layer1[i]();
  // }
  // while(layer1.length>0)
  // {
  //   layer1.pop();
  // }
  for (let i=0; i < nodes.length; i++)
  {
    nodes[i].is_inside(mouseX / zoom, mouseY / zoom);
    nodes[i].render();
  }
  if (!selected_node && dragging)
  {
    noFill();
    stroke(10);
    rect(mouse_pressX / zoom, mouse_pressY / zoom, (mouseX - mouse_pressX) / zoom, (mouseY - mouse_pressY) / zoom);
  }
  
}

function mousePressed() {
  dragging = true;
  mouse_pressX = mouseX;
  mouse_pressY = mouseY;
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

function mouseDragged() {
  if (selected_node)
  {
    selected_node.x = ((mouseX / zoom) - offsetX);
    selected_node.y = ((mouseY / zoom) - offsetY);
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
    this.knob1 = new Knob(0, 0, 20, 20);
    this.knob2 = new Knob(0, 0, 20, 20);
    this.knob_rect1 = [0, 0, 0, 0];
    this.knob_rect2 = [0, 0, 0, 0];
    this.knob_hover = 0;
  }
  
  render(){
    // stroke(150);
    noStroke();
    fill(this.pressed ? 150 : this.hover ? 100 : 50);
    rect(this.x, this.y, this.w, this.h);
    
    fill(255);
    // textAlign(CENTER, CENTER);
    text(this.title, this.x + 5, this.y, this.w - 5, this.title_height);
    line(this.x, this.y + this.title_height, this.x + this.w, this.y + this.title_height);
    
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
      // let r = (edge=this.edges[i]) => {edge.render();}
      // layer1.push(r);
      this.edges[i].render();
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