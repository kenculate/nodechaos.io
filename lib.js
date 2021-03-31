class vector
{
  constructor(x=0, y=0, z=0, w=0)
  {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }

  set(x=0, y=0, z=0, w=0)
  {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }
}

function rand(min, max)
{
  return Math.random() * (max-min) + min;
}
