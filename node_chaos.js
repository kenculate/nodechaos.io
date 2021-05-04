
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
var canvas_size = new vector(screen.width, screen.height);
var item_deleted = false;
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
var mouse_in = false;
function setup() {
  var canvas = createCanvas(canvas_size.x, canvas_size.y);
  canvas.parent('canvasdiv');
  canvas.mouseOut(mouseOut);
  canvas.mouseOver(mouseOver);
  nodes.push(new Node(100, 100, 300, 150, 1));
  tinymce.init({
    selector: 'textarea',
    // menubar: false,              
    plugins: 'directionality fullscreen link autolink wordcount lists media table ',
    toolbar1: 'aligncenter alignjustify alignleft alignnone alignright blockquote backcolor forecolor fontselect fontsizeselect bold italic underline indent outdent code ltr rtl link checklist media pageembed wordcount fullscreen ',
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

function draw_grid(){
  
  let substep = 10;
  let step = 100;
  stroke(200);
  for(let y=0;y<canvas_size.y;y+=substep){
    line(0, y, canvas_size.x, y);
  }
  for(let x=0;x<canvas_size.x;x+=substep){
    line(x, 0, x, canvas_size.y);
  }

  stroke(50);
  for(let y=0;y<canvas_size.y;y+=step){
    line(0, y, canvas_size.x, y);
  }
  for(let x=0;x<canvas_size.x;x+=step){
    line(x, 0, x, canvas_size.y);
  }

}

function draw() {
  background(220);
  textSize(20);
  textFont("Arial");

  draw_grid();
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
  
  noStroke();

  fill(255, 0, 0);
  textSize(20);
  text("fps:" + int(frameRate()), 10, 10, 200, 20);
  
  fill(255, 100, 0);
  text("press N to add node", 10, 30, 200, 20);
  text("double click on nodes to edit", 10, 50, 300, 20);
  
  textFont("Arial Black");
  textSize(60);
  fill(50, 50, 50, 50);
  text("NODE CHAOS", 200, 0, 1200, 200);

}
function mouseOut()
{
  mouse_in = false;
}


function mouseOver()
{
  mouse_in = true;
}


function draw_selected_edge()
{
  if (output_knob != undefined)
  {
    stroke(0, 0, 255);
    line(output_knob.__center.x, output_knob.__center.y, transposex(mouseX), transposey(mouseY));
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
    if (!item_deleted){

      nodes[i].is_hover(transposex(mouseX), transposey(mouseY));
      if (!dragging)
      {
        nodes[i].is_inside(transposex(mouseX), transposey(mouseY));
      }
      else
      {
        if (nodes[i].intersect(transposex(mouse_press.x), transposey(mouse_press.y), transposex(mouseX), transposey(mouseY)))
        {
          nodes[i].__hover = true;
        }
      }
      nodes[i].render();
    }
    else{
      item_deleted = false;
      return;
    }
  }
}

function check_deselect()
{
  deselect = true;
  for (let i=0; i < selected_nodes.length; i++)
  {
    if (selected_nodes[i].__hover)
    {
      deselect = false;
    }
  }
  if (deselect)
  {
    for (let i=0; i < selected_nodes.length; i++)
    {
      selected_nodes[i].__hover = false;
      selected_nodes[i].__pressed = false;
      selected_nodes[i].__selected = false;
    }
    selected_nodes = [];
  }
  return deselect;
}

function mousePressed(event) {
  if (!mouse_in) return;
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
    dragging = check_deselect();
    if (dragging){
      editing_node = undefined;
      toggle_item_entries(true);
    }
    panning = false;
    if (output_knob != undefined)
    {
      output_knob.__pressed = false;
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
        if (nodes[i].knob2.__hover)
        {
          output_knob = nodes[i].knob2;
          output_knob.__pressed = true;
          knob_clicked = true;
          break;
        }  
      }
    }

    if (!knob_clicked)
    {
      if (output_knob != undefined)
      {
        output_knob.__pressed = false;
        output_knob = undefined;
      }
    }
  }
}


function mouseDragged() {
  if (!mouse_in) return;

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
    if (nodes[i].__pressed)
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
    selected_nodes[i].x += transposex(mouseX)-transposex(mouse_last.x);
    selected_nodes[i].y += transposey(mouseY)-transposey(mouse_last.y);
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
  if (!mouse_in) return;
  // 46 == delete
  if (keyCode == 46)
  {
    if (editing_node)
    {
      let index = nodes.indexOf(editing_node);
      print(index);
      if (index>=0){
        print(nodes, nodes.length);
        nodes.splice(index, 1);
        item_deleted = true;
        editing_node = undefined;
        print(nodes, nodes.length);
      }
    }
  }
  // 78 == n
  else if (keyCode == 78)
  {
    let index = nodes.length > 0 ? nodes[nodes.length-1].index+1 : 1;
    let node = new Node(transposex(mouseX), transposey(mouseY), 300, 150, index);
    nodes.push(node);
    print(nodes);
  }
}


window.addEventListener("wheel", function(e) {
  if (!mouse_in) {
    return;
  }
  applyScale(e.deltaY < 0 ? 1.05 : 0.95);
});

function on_node_selected(node)
{

  editing_node = node;
  toggle_item_entries(false);

  document.getElementById("txt_title").value = node.detail.title;
  tinymce.get("textarea").setContent(node.detail.text?node.detail.text:'');
  let table = document.getElementById("edge_table");
  let count = table.rows.length;
  for(let i=0; i< count;i++)
  {
    table.deleteRow(0);
  }
  for(let i=0; i< node.knob2.edges.length;i++)
  {
    let row = table.insertRow(table.rows.length);
    let output = nodes_dic[knobs_dic[node.knob2.edges[i].input_id].node_id];
    
    let cell = row.insertCell(0);
    let title = output.detail.title;
    let lock = false;
    for(let key in output.detail.items){
      if (inventory.items[key].__stock < output.detail.items[key].require)
      {
        lock = true;
        title += '(LOCK)';
        break;
      }
    }
    let newText = document.createTextNode(title);
    cell.appendChild(newText);
    if (!lock){
      cell.classList.add("btn");
      row.onclick = (event, selected_node=output) => {
        load_next_node(selected_node);
      }
    }
  }
}

function load_next_node(node)
{
  for(var key in node.detail.items)
  {
    let detail_item = node.detail.items[key];
    if (detail_item.acquire > 0){
      if (!inventory.items[key].infinite)
      {
        inventory.items[key].__stock += detail_item.acquire - detail_item.__acquire;
        detail_item.__acquire = detail_item.acquire;
      }
      else
      {
        inventory.items[key].__stock += detail_item.acquire;
        document.getElementById(key + '__stock').value = inventory.items[key].__stock;
      }
      document.getElementById(key + '__stock').value = inventory.items[key].__stock;
    }
  }
  on_node_selected(node);
}


function save_clicked()
{
  editing_node.detail.title = document.getElementById("txt_title").value;
  editing_node.detail.text = tinymce.get("textarea").getContent();
  editing_node.detail.short_text = tinymce.get("textarea").getContent({ format: 'text' }).substring(0, 160) + '..';
}


function openbook_clicked()
{
  document.getElementById("file").click();
}


function savebook_clicked()
{
  var fileName = 'nodechaos_book.json';
  let data = {
    nodes: nodes,
    inventory: inventory
  }
  var fileToSave = new Blob([JSON.stringify(data, function(key, value){
    if (!key.includes('__'))
      return value;
  })], {
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
