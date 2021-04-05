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

function convertToPlain(rtf) {
  // rtf = rtf.replace(/\\par[d]?/g, "");
  // rtf = rtf.replace(/\{\*?\\[^{}]+}|[{}]|\\\n?[A-Za-z]+\n?(?:-?\d+)?[ ]?/g, "")
  // rtf = rtf.replace(/\\'[0-9a-zA-Z]{2}/g, "").trim();
  rtf = rtf.replace(/<[/]?\w>/g, '');
  print(rtf);
  return rtf;
}