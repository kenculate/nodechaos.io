
let zoomx = 0, zoomy = 0;

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

var BookState = {
  Read : 'Read',
  Edit : 'Edit'
};
var MouseState = {
  None : 'None',
  Press : 'Press',
  Drag : 'Drag',
  Release : 'Release'
};
var mouse_state = MouseState.None;
var book_state = BookState.Edit;

function setup() {
  var canvas = createCanvas(10000, 10000);
  canvas.parent('canvasdiv');
  nodes.push(new Node(100, 100, 150, 150, 1));
  tinymce.init({
    selector: 'textarea',
    // menubar: false,
    plugins: 'a11ychecker advcode casechange formatpainter linkchecker autolink lists checklist media mediaembed pageembed permanentpen powerpaste table advtable tinycomments tinymcespellchecker',
    toolbar: 'a11ycheck addcomment showcomments casechange checklist code formatpainter pageembed permanentpen table',
    toolbar_mode: 'floating',
    tinycomments_mode: 'embedded',
    tinycomments_author: 'Author name',
    height: '600px',
  });
}

function applyScale(s) {
  zoom = zoom * s;
  zoomx = mouseX * (1-s) + zoomx * s;
  zoomy = mouseY * (1-s) + zoomy * s;
}
function draw() {
  background(220);
  push();
  
  translate(zoomx, zoomy);
  scale(zoom);
  translate(pan.x, pan.y);

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
  pop();
  fill(255, 0, 0);
  textSize(20);
  text("fps:" + int(frameRate()), 10, 10, 200, 20);
  fill(255, 255, 0);
  text("press N to add node", 10, 30, 200, 20);

}

function draw_selected_edge()
{
  if (output_knob != undefined)
  {
    stroke(0, 0, 255);
    line(output_knob.center.x, output_knob.center.y, transposex(mouseX), transposey(mouseY));
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
    return;
  }
  else
  {
    deselect = check_deselect();
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
        if (nodes[i].knob1.add_edge(output_knob)){
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
  mouse_state = MouseState.Drag;
  if (!panning)
  {
    rect_select();
  
  }
  else
  {
    pan.x += (mouseX - mouse_last.x)/zoom;
    pan.y += (mouseY - mouse_last.y)/zoom;
  }
  
  mouse_last.x = mouseX;
  mouse_last.y = mouseY;
}

function rect_select()
{
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
  applyScale(e.deltaY < 0 ? 1.05 : 0.95);
});

function on_node_selected(node)
{
  editing_node = node;
  document.getElementById("txt_title").value = node.detail.title;
  tinymce.get("textarea").setContent(node.detail.text?node.detail.text:'');
  var table = document.getElementById("edge_table");
  var count = table.rows.length;
  for(var i=0; i< count;i++)
  {
    table.deleteRow(0);
  }
  for(var i=0; i< node.knob2.edges.length;i++)
  {
    var row = table.insertRow(table.rows.length);
    let output = nodes_dic[knobs_dic[node.knob2.edges[i].input].node];
    row.onclick = (event, selected_node=output) => {
      on_node_selected(selected_node);
    }
    var cell = row.insertCell(0);
    var newText = document.createTextNode(output.detail.title);
    cell.appendChild(newText);
  }
}

function save_clicked()
{
  editing_node.detail.title = document.getElementById("txt_title").value;
  editing_node.detail.text = tinymce.get("textarea").getContent();
  editing_node.detail.short_text = tinymce.get("textarea").getContent({ format: 'text' }).substring(0, 60) + '..';
}

function openbook_clicked()
{
  document.getElementById("file").click();
}

function savebook_clicked()
{
  var fileName = 'nodechaos_book.json';
  var fileToSave = new Blob([JSON.stringify(nodes)], {
      type: 'application/json',
      name: fileName
  });
  saveAs(fileToSave, fileName);
}

window.addEventListener('load', function() {
  var upload = document.getElementById('file');
  if (upload) 
  {
    upload.addEventListener('change', function() {
      if (upload.files.length > 0) 
      {
        var reader = new FileReader();
        reader.addEventListener('load', function() {
          var result = JSON.parse(reader.result); 
          load_data(result);
        });
        reader.readAsText(upload.files[0]);
      }
    });
  }
});
