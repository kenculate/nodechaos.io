class Detail
{
    constructor(node, title='', text='', detail=null)
    {
        this.node = node.uuid;
        this.items = {};
        
        this.short_text = '';
        if (detail)
        {
            this.title = detail.title;
            this.text = detail.text;
            this.short_text = detail.short_text;
            this.items = detail.items;
        }
        else{
            this.title = title;
            this.text = text;
        }
    }
}

class DetailItem extends Base{
    constructor(item, uuid=null)
    {
        super(uuid);
        this.item = item;
        this.require = 0;
        this.acquire = 0;
    }
}