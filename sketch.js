

let zoom = 1; // scaleFactor
var nodes = [];
var selected_nodes = [];
var editing_node;
var input_knob;
var output_knob;
var mouse_press = new vector();
var mouse_last = new vector();
var pan = new vector();
var offset = new vector();


var dragging = false;
var panning = false;
var layer1 = [];

var MouseState = {
  None : 'None',
  Press : 'Press',
  Drag : 'Drag',
  Release : 'Release'
};
var mouse_state = MouseState.None;

function setup() {
  var canvas = createCanvas(10000, 10000);
  canvas.parent('canvasdiv');
  nodes.push(new Node(100, 100, 150, 150, 1));
  tinymce.init({
    selector: 'textarea',
    plugins: 'a11ychecker advcode casechange formatpainter linkchecker autolink lists checklist media mediaembed pageembed permanentpen powerpaste table advtable tinycomments tinymcespellchecker',
    toolbar: 'a11ycheck addcomment showcomments casechange checklist code formatpainter pageembed permanentpen table',
    toolbar_mode: 'floating',
    tinycomments_mode: 'embedded',
    tinycomments_author: 'Author name',
    height: '800px',
});
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
  return (v - pan.x)/ zoom ;
}

function transposey(v){
  return (v - pan.y)/ zoom ;
}

function draw() {
  background(220);
  
  translate(pan.x, pan.y);
  scale(zoom);
  
  for (let i=0; i < layer1.length; i++)
  {
    layer1[i]();
  }
  while(layer1.length>0)
  {
    layer1.pop();
  }
  draw_selected_edge();

  draw_nodes();
  draw_selection();

  scale(1/zoom);
  translate(-pan.x, -pan.y);
  
  fill(255, 0, 0);
  textSize(20);
  text("fps:" + int(frameRate()), 10, 10, 200, 50);
}

function draw_selected_edge()
{
  if (output_knob != undefined)
  {
    stroke(0, 0, 255);
    line(output_knob.center.x, output_knob.center.y, mouseX, mouseY);
  }
}
function draw_selection()
{
  if (dragging)
  {
    noFill();
    stroke(10);
    rect(transposex(mouse_press.x), transposey(mouse_press.y), (mouseX - mouse_press.x) / zoom, (mouseY - mouse_press.y) / zoom);
  }
}
function draw_nodes()
{

  for (let i=0; i < nodes.length; i++)
  {
      nodes[i].is_hover(transposex(mouseX), transposey(mouseY));
      if (!dragging)
      {
        nodes[i].is_inside(transposex(mouseX), transposey(mouseY));
      }
      else
      {
        if (nodes[i].intersect(transposex(mouse_press.x), transposey(mouse_press.y), transposex(mouseX), transposey(mouseY)))
        {
          nodes[i].hover = true;
        }
      }
    nodes[i].render();
  }
}

function check_deselect()
{
  deselect = true;
  for (let i=0; i < selected_nodes.length; i++)
  {
    if (selected_nodes[i].hover)
    {
      deselect = false;
    }
  }
  if (deselect)
  {
    for (let i=0; i < selected_nodes.length; i++)
    {
      selected_nodes[i].hover = false;
      selected_nodes[i].pressed = false;
      selected_nodes[i].selected = false;
    }
    selected_nodes = [];
  }
  return deselect;
}

function mousePressed(event) {
  deselect = check_deselect();
  mouse_state = MouseState.Press;
  mouse_press.x = mouseX;
  mouse_press.y = mouseY;

  mouse_last.x = mouseX;
  mouse_last.y = mouseY;
    
  if (mouseButton === CENTER)
  {
    panning = true;
    mouse_last.x = mouseX;
    mouse_last.y = mouseY;
  }
  else
  {
    panning = false;
    dragging = deselect;
    if (output_knob != undefined)
    {
      output_knob.pressed = false;
    }
    var knob_clicked = false;
    for (let i=0; i < nodes.length; i++)
    {
      nodes[i].is_pressed(transposex(mouseX), transposey(mouseY));

      // check input/output knob pressed
      if (output_knob != undefined)
      {
        if (nodes[i].knob1.hover)
        {
          input_knob = nodes[i].knob1;
          output_knob.edges.push(new Edge(input_knob, output_knob));

          output_knob.pressed = false;
          input_knob = undefined;
          output_knob = undefined;
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
  mouse_state = MouseState.Drag;
  for (let i=0; i < nodes.length; i++)
  {
    if (nodes[i].pressed)
    {
      dragging = false;
      if (!selected_nodes.includes(nodes[i]))
      {
        selected_nodes.push(nodes[i]);
      } 
    }
    nodes[i].intersect(transposex(mouse_press.x), transposey(mouse_press.y), transposex(mouseX), transposey(mouseY));
  }
  for (let i=0; i < selected_nodes.length; i++)
  {
    selected_nodes[i].x += ((mouseX-mouse_last.x));
    selected_nodes[i].y += ((mouseY-mouse_last.y));
  }
  if (panning)
  {
    pan.x += mouseX - mouse_last.x;
    pan.y += mouseY - mouse_last.y;
  }
  mouse_last.x = mouseX;
  mouse_last.y = mouseY;
}

function mouseReleased() {
  mouse_state = MouseState.Release;
  if (selected_nodes.length <=1)
  {
    selected_nodes=[];
    for (let i=0; i < nodes.length; i++)
    {
      if (nodes[i].is_selected())
      {
        selected_nodes.push(nodes[i]);
      }
    }
  }

  dragging = false;
  panning = false;
  mouse_press.x = 0;
  mouse_press.y = 0;
}

function doubleClicked()
{
  for (let i=0; i < nodes.length; i++)
  {
    if (nodes[i].is_hover(transposex(mouseX), transposey(mouseY)))
    {
      on_node_selected(nodes[i]);
    }
  }
}
function keyPressed() {
  // 78 == n
  if (keyCode == 78)
  {
    nodes.push(new Node(transposex(mouseX), transposey(mouseY), 150, 150, nodes[nodes.length-1].index+1));
  }
}
window.addEventListener("wheel", function(e) {
  if (e.deltaY < 0)
    zoom *= 1.05;
  else
    zoom *= 0.95;
});

function on_node_selected(node)
{
  editing_node = node;
  document.getElementById("txt_title").value = node.detail.title;
  tinymce.get("textarea").setContent(node.detail.text?node.detail.text:'');
}

function save_clicked()
{
  editing_node.detail.title = document.getElementById("txt_title").value;
  editing_node.detail.text = tinymce.get("textarea").getContent();
}

function openbook_clicked()
{
  print("open book");
}

function savebook_clicked()
{
  var fileName = 'myData.json';

  // Create a blob of the data
  var fileToSave = new Blob([JSON.stringify(nodes)], {
      type: 'application/json',
      name: fileName
  });

  // Save the file
  saveAs(fileToSave, fileName);
  // saveAs("test.txt", "testsetset testse ");
}

window.addEventListener('load', function() {
  var upload = document.getElementById('file');
  
  // Make sure the DOM element exists
  if (upload) 
  {
    upload.addEventListener('change', function() {
      // Make sure a file was selected
      if (upload.files.length > 0) 
      {
        var reader = new FileReader(); // File reader to read the file 
        
        // This event listener will happen when the reader has read the file
        reader.addEventListener('load', function() {
          var result = JSON.parse(reader.result); // Parse the result into an object 
          load_data(result);
        });
        
        reader.readAsText(upload.files[0]); // Read the uploaded file
      }
    });
  }
});

function thisFileUpload() {
  document.getElementById("file").click();
};