
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
