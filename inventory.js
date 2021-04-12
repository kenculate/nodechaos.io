
var ItemType = {
  Require : 'require',
  Acquire : 'acquire',
  Stock : 'stock'
};
var toggle_inventory = false;


function reset_stocks(){
  for(let i=0;i<nodes.length;i++){
    for (let item in nodes.detail.items){
      nodes.detail.items[item].__stock = 0;
      nodes.detail.items[item].__acquire = 0;
    }
  }
}
class Inventory{
  constructor(inventory_data=null)
  {
    this.items = {};
    if (inventory_data){
      for(let key in inventory_data.items){
        this.items[key] = new Item(key, inventory_data.items[key]);
      }
    }
  }
}
var inventory = new Inventory();

class Item extends Base{
  constructor(uuid=null, item=null)
  {
    super(uuid);
    this.name = '';
    this.infinite = false;
    
    if (item){
      this.name = item.name;
      this.infinite = item.infinite;
    }

    this.__stock = 0;

    let table = document.getElementById("inventory_table");
    let count = table.rows.length;
    let row = table.insertRow(table.rows.length);
    row.innerHTML = `
    <td><i class="fa fa-trash p-0 m-0"></i></td>
    <td class="px-0 mx-0"><input id='` + this.uuid + `__name' class="w-100" type="text" onchange=item_onchange('` + this.uuid + `__name') value=` + this.name + `></td>
    <td class="px-0 mx-0"><input id='` + this.uuid + `__infinite' class="w-100" type="checkbox" onchange=item_onchange('` + this.uuid + `__infinite') checked=` + this.infinite + `></td>
    <td class="px-0 mx-0"><input id='` + this.uuid + `__require' class="w-100" type="number" onchange=item_onchange('` + this.uuid + `__require') value=0></td>
    <td class="px-0 mx-0"><input id='` + this.uuid + `__acquire' class="w-100" type="number" onchange=item_onchange('` + this.uuid + `__acquire') value=0></td>
    <td class="px-0 mx-0"><input id='` + this.uuid + `__stock' class="w-100" type="number" onchange=item_onchange('` + this.uuid + `__stock') value=0></td>
  `;
  }

  update_view(){
  }
}

function add_item_clicked()
{
  let item = new Item();
  inventory.items[item.uuid] = item;
}

function toggle_item_entries(toggle)
{
  document.getElementById('txt_title').disabled = toggle;
  tinymce.activeEditor.mode.set(toggle ? "readonly" : "design");
  
 
  for(let key in inventory.items)
  {
    let require = document.getElementById(inventory.items[key].uuid + "__require");
    require.disabled = editing_node == undefined ? true : false;
    if (require.disabled){
      require.value = 0;
    }
    
    let acquire = document.getElementById(inventory.items[key].uuid + "__acquire");
    acquire.disabled = editing_node == undefined ? true : false;
    if (acquire.disabled){
      acquire.value = 0;
    }

    
    if (editing_node)
    {
      let item = editing_node.detail.items[inventory.items[key].uuid];
      if (item)
      {
        require.value = editing_node.detail.items[inventory.items[key].uuid].require;
        acquire.value = editing_node.detail.items[inventory.items[key].uuid].acquire;
      }else{
        require.value = 0;
        acquire.value = 0;
      }
    }
  }
}


function item_onchange(element)
{
  let item_uuid = element.split('__')[0];
  inventory.items[item_uuid].name = document.getElementById(item_uuid + '__name').value; 
  inventory.items[item_uuid].infinite = document.getElementById(item_uuid + '__infinite').checked; 
  if (editing_node != undefined)
  {
    if (editing_node.detail.items[item_uuid] === undefined)
    {
      editing_node.detail.items[item_uuid] = new DetailItem(item_uuid);
    }
    editing_node.detail.items[item_uuid].require = int(document.getElementById(item_uuid + '__' +ItemType.Require).value); 
    editing_node.detail.items[item_uuid].acquire = int(document.getElementById(item_uuid + '__' +ItemType.Acquire).value); 
  }
}