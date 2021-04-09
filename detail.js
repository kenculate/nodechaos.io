class Detail
{
    constructor(node, title='', text='', detail=null)
    {
        this.node_id = node.uuid;
        this.items = {};
        
        this.short_text = '';
        if (detail)
        {
            this.title = detail.title;
            this.text = detail.text;
            this.short_text = detail.short_text;
            this.items = detail.items;
            for(let key in detail.items){
                let item = new DetailItem(detail.items[key], key, detail.items[key])
            }
        }
        else{
            this.title = title;
            this.text = text;
        }
    }
}

class DetailItem extends Base{
    constructor(item_id, uuid=null, detail_item=null)
    {
        super(uuid);
        this.item_id = item_id;
        this.require = 0;
        this.acquire = 0;
        this.__acquire = 0;
        if (detail_item){
            this.require = detail_item.require;
            this.acquire = detail_item.acquire;
        }
    }
}