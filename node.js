nodes_dic = {};
knobs_dic = {};
edges_dic = {};
function reset_data()
{
  nodes_dic = {};
  knobs_dic = {};
  edges_dic = {};
  nodes=[];
}

function load_data(nodes_data)
{
  reset_data();
  for(var i=0; i< nodes_data.length;i++)
  {
    var node = new Node(
      nodes_data[i].x, nodes_data[i].y, nodes_data[i].w, nodes_data[i].h, 
      nodes_data[i].index, nodes_data[i].uuid, 
      nodes_data[i].knob1.uuid, nodes_data[i].knob2.uuid, 
      nodes_data[i].detail);
    nodes.push(node);
    nodes_dic[nodes_data[i]] = node;
  }
  for(var i=0; i< nodes_data.length;i++)
  {
    for(var j=0; j< nodes_data[i].knob2.edges.length;j++)
    {
      var edge = new Edge(
        knobs_dic[nodes_data[i].knob2.edges[j].input],
        knobs_dic[nodes_data[i].knob2.edges[j].output],
        nodes_data[i].knob2.edges[j].uuid
      ); 
      
      nodes_dic[nodes_data[i].uuid].knob2.edges.push(edge);
      edges_dic[edge.uuid] = edge;
    }
  }
}
class Base{
  constructor(uuid=null)
  {
    if (!uuid)
    {
      this.uuid = uuidv4();
    }
    else{
      this.uuid = uuid;
    }
  }
}

class Node extends Base{

    constructor(x, y, w, h, index, uuid=null, knob1_uuid=null , knob2_uuid=null, detail=null)
    {
      super(uuid);
      nodes_dic[this.uuid] = this;
      this.detail = new Detail(this, "node_" + index, '', detail=detail);
      this.index = index;
      this.x = x;
      this.y = y;
      this.w = w;
      this.h = h;
      this.hover = false;
      this.pressed = false;
      this.selected = false;
      this.title_height = 20;
      this.knob_size = 20;
      this.knob1 = new Knob(this, 0, 0, 20, 20, KnobType.input, knob1_uuid);
      this.knob2 = new Knob(this, 0, 0, 20, 20, KnobType.output, knob2_uuid);
      this.knob_rect1 = [0, 0, 0, 0];
      this.knob_rect2 = [0, 0, 0, 0];
      this.knob_hover = 0;
    }

    render(){
      noStroke();
      fill(this.selected ? [255, 0, 0] : this.hover ? [0, 0, 255] : this.pressed ? [0, 255, 0] : 50);
      rect(this.x, this.y, this.w, this.h);
      
      fill(255);
      // textAlign(CENTER, CENTER);
      text(this.detail.title, this.x + 5, this.y, this.w - 5, this.title_height);
      
      this.knob1.set_rect(this.x - this.knob_size, this.y + this.title_height + this.knob_size, this.knob_size, this.knob_size);
      this.knob2.set_rect(this.x + this.w, this.y + this.title_height + this.knob_size, this.knob_size, this.knob_size);
      
      noStroke();
      this.knob1.render();
      this.knob2.render();
      
    }
    
    is_hover(x, y)
    {
      this.hover = this.rect_check(x, y, this.x, this.y, this.w, this.h);
      return this.hover;
    }

    is_pressed(x, y)
    {
      this.pressed = this.rect_check(x, y, this.x, this.y, this.w, this.h);
      return this.pressed;
    }

    is_selected()
    {
      this.selected = this.hover;
      return this.selected;
    }
    
    intersect(left, top, right, bottom)
    {
      [left, right] = right < left ? [right, left] : [left, right];
      [top, bottom] = bottom < top ? [bottom, top] : [top, bottom];
      this.hover = this.x > left && this.x + this.w < right && this.y > top && this.y + this.h < bottom;
      return this.hover;
    }
    
    rect_check(xin, yin, x, y, w, h)
    {
      return (xin > x && xin < x + w && yin > y && yin < y + h);
    }
    
    is_inside(x, y)
    {
      
      this.knob1.hover = this.rect_check(x, y, this.knob1.x, this.knob1.y,  this.knob1.w, this.knob1.h);
      this.knob2.hover = this.rect_check(x, y, this.knob2.x, this.knob2.y,  this.knob2.w, this.knob2.h);
      
      return this.hover;
    }
  }
  var KnobType = {
    input: 'input',
    output:'output'
  }


  class Knob extends Base{
    
    constructor(node, x, y, w, h, type, uuid=null)
    {
      super(uuid);
      knobs_dic[this.uuid] = this;
      this.node = node.uuid;
      this.x = x;
      this.y = y;
      this.w = w;
      this.h = h;
      this.type = type;
      this.hover = false;
      this.pressed = false;
      this.edges = [];
      this.center = new vector(x + (this.type == KnobType.input ? 0 : w), y + (h/2));
    }
    
    set_rect(x, y, w, h)
    {
      this.x = x;
      this.y = y;
      this.w = w;
      this.h = h;
      this.center.set(x + (this.type == KnobType.input ? 0 : w), y + (h/2));
    }
    
    render()
    {
      for (let i=0; i < this.edges.length; i++)
      {
        // var _edge = this.edges[i];
        // let r = (edge=_edge) => {_edge.render();}
        // layer1.push(r);
        this.edges[i].render();
      }
      noStroke();
      fill(this.pressed ? [255, 0, 0, 50] : this.hover ? 170 : [100, 100, 100, 50]);
      rect(this.x, this.y, this.w, this.h);
    }
  }
  
  class Edge extends Base
  {
    constructor(input, output, uuid=null)
    {
      super(uuid);
      edges_dic[this.uuid] = this;
      this.input = input.uuid;
      this.output = output.uuid;
      print(this.input, this.output);
    }
    
    render()
    {
      noFill();
      stroke(255, 0, 0);
      curve(
        knobs_dic[this.output].center.x-250, 
        knobs_dic[this.output].center.y, 
        knobs_dic[this.output].center.x, 
        knobs_dic[this.output].center.y,
        knobs_dic[this.input].center.x, 
        knobs_dic[this.input].center.y, 
        knobs_dic[this.input].center.x+250, 
        knobs_dic[this.input].center.y 
      )
      stroke(0, 0, 255);
    }
  }