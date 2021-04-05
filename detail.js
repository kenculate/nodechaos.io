class Detail
{
    constructor(node, title='', text='', detail=null)
    {
        this.node = node.uuid;
        this.short_text = '';
        if (detail)
        {
            this.title = detail.title;
            this.text = detail.text;
            this.short_text = detail.short_text;
        }
        else{
            this.title = title;
            this.text = text;
        }
    }
}