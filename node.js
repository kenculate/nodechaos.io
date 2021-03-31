
class Node{

    constructor(x, y, w, h, title)
    {
      this.detail = new Detail(this, title);
      this.x = x;
      this.y = y;
      this.w = w;
      this.h = h;
      this.hover = false;
      this.pressed = false;
      this.selected = false;
      this.title_height = 20;
      this.knob_size = 20;
      print(Knob);
      this.knob1 = new Knob(0, 0, 20, 20, KnobType.input);
      this.knob2 = new Knob(0, 0, 20, 20, KnobType.output);
      this.knob_rect1 = [0, 0, 0, 0];
      this.knob_rect2 = [0, 0, 0, 0];
      this.knob_hover = 0;
      print(this);
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
        let r = (edge=this.edges[i]) => {edge.render();}
        layer1.push(r);
        // this.edges[i].render();
      }
      noStroke();
      fill(this.pressed ? [255, 0, 0, 50] : this.hover ? 170 : [100, 100, 100, 50]);
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
      noFill();
      stroke(255, 0, 0);
      curve(this.output.center.x-150, this.output.center.y, this.output.center.x, this.output.center.y,
        this.input.center.x, this.input.center.y, this.input.center.x+150, this.input.center.y 
      )
      stroke(0, 0, 255);
      // line(this.output.center.x, this.output.center.y, this.input.center.x, this.input.center.y);
    }
  }