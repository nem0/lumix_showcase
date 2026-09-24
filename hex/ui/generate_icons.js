// Rebuild the hex game control icons: node hex/ui/generate_icons.js
// Self-contained RGBA PNG writer; no external packages required.
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const W = 32, H = 32;
const C = {
  ink: '#352d30', deep: '#514047', shadow: '#765651', wood: '#986b4d',
  woodLight: '#c39060', cream: '#eed4a0', light: '#fff0c1',
  roof: '#a95046', roofLight: '#d47758', roofDark: '#753f42',
  stone: '#80888a', stoneLight: '#b4b7ab', stoneDark: '#596569',
  grass: '#527b54', leaf: '#75a562', leafLight: '#a3c87a',
  gold: '#e8b755', goldLight: '#ffe19a', water: '#5096a8',
  waterLight: '#91d0d0', iron: '#637580', ironLight: '#b0c4bf',
};
function rgba(hex) { return [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)); }
let pixels;
function dot(x, y, col) {
  x = Math.round(x); y = Math.round(y);
  if (x < 0 || x >= W || y < 0 || y >= H) return;
  const p = (y * W + x) * 4, rgb = rgba(col);
  pixels[p] = rgb[0]; pixels[p+1] = rgb[1]; pixels[p+2] = rgb[2]; pixels[p+3] = 255;
}
function rect(x, y, w, h, col) {
  for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) dot(i, j, col);
}
function poly(points, col) {
  let ys = points.map(p => p[1]);
  for (let y = Math.min(...ys); y <= Math.max(...ys); y++) {
    let xs = [];
    for (let i = 0; i < points.length; i++) {
      let [x1,y1] = points[i], [x2,y2] = points[(i+1)%points.length];
      if ((y1 <= y && y2 > y) || (y2 <= y && y1 > y)) xs.push(x1 + (y - y1) * (x2 - x1) / (y2 - y1));
    }
    xs.sort((a,b) => a-b);
    for (let i=0; i+1<xs.length; i+=2) for (let x=Math.ceil(xs[i]); x<=Math.floor(xs[i+1]); x++) dot(x,y,col);
  }
}
function line(x1,y1,x2,y2,col,weight=1) {
  let n = Math.max(Math.abs(x2-x1), Math.abs(y2-y1));
  for (let i=0;i<=n;i++) {
    let x=Math.round(x1+(x2-x1)*i/(n||1)), y=Math.round(y1+(y2-y1)*i/(n||1));
    rect(x-Math.floor(weight/2),y-Math.floor(weight/2),weight,weight,col);
  }
}
function ellipse(cx,cy,rx,ry,col) {
  for(let y=Math.ceil(cy-ry);y<=cy+ry;y++) for(let x=Math.ceil(cx-rx);x<=cx+rx;x++)
    if(((x-cx)/rx)**2+((y-cy)/ry)**2<=1) dot(x,y,col);
}
function frame(x,y,w,h,fill,border=C.ink) { rect(x-1,y-1,w+2,h+2,border); rect(x,y,w,h,fill); }
function ground() { ellipse(16,27,11,2,C.deep); rect(9,28,14,1,C.shadow); }
function roof(x1,y1,peakX,peakY,x2,y2,bottomY) {
  poly([[x1,y1],[peakX,peakY],[x2,y2],[x2,bottomY],[x1,bottomY]],C.ink);
  poly([[x1+2,y1],[peakX,peakY+2],[peakX,bottomY-2],[x1+2,bottomY-2]],C.roofLight);
  poly([[peakX,peakY+2],[x2-2,y2],[x2-2,bottomY-2],[peakX,bottomY-2]],C.roof);
  line(x1+2,bottomY-2,x2-2,bottomY-2,C.roofDark);
}
const icons = {
  axe() {
    line(9,26,22,7,C.ink,5); line(9,26,22,7,C.woodLight,3);
    line(11,23,19,11,C.cream); rect(7,24,4,3,C.wood);
    poly([[18,9],[21,6],[26,7],[25,11],[21,14],[18,13]],C.ink);
    poly([[20,9],[22,7],[25,8],[24,11],[21,12]],C.ironLight);
    line(23,8,25,8,C.light);
  },
  house() {
    ground(); frame(7,15,18,12,C.wood); rect(9,17,14,9,C.cream);
    rect(9,23,14,3,C.woodLight); line(9,22,22,22,C.wood);
    roof(4,16,16,5,28,16,19);
    line(7,16,16,8,C.light); line(16,8,25,16,C.roofDark);
    frame(14,19,5,8,C.deep); rect(15,20,3,6,C.wood); dot(17,23,C.goldLight);
    frame(9,18,3,4,C.water); dot(10,19,C.waterLight);
    rect(23,12,2,5,C.ink); rect(23,11,2,4,C.stoneLight);
  },
  field() {
    ground(); poly([[4,23],[22,21],[29,27],[11,29]],C.ink);
    poly([[6,24],[22,22],[27,26],[11,28]],C.wood);
    line(10,26,26,24,C.woodLight); line(15,28,19,22,C.shadow);
    for (let [x,y] of [[9,18],[15,14],[21,17],[25,12]]) {
      line(x,y+7,x,y-4,C.grass); line(x,y+3,x-3,y,C.grass); line(x,y+1,x+3,y-2,C.grass);
      rect(x-1,y-6,3,5,C.ink); rect(x,y-5,2,4,C.gold);
      dot(x,y-6,C.goldLight); dot(x-2,y-3,C.gold); dot(x+2,y-2,C.goldLight);
    }
  },
  well() {
    ground(); rect(9,11,2,12,C.ink); rect(10,12,2,10,C.woodLight);
    rect(23,11,2,12,C.ink); rect(23,12,1,10,C.woodLight);
    roof(7,12,17,6,27,12,15); line(11,12,17,8,C.light);
    line(13,18,21,18,C.wood); line(17,15,17,22,C.ink);
    ellipse(17,22,11,5,C.ink); ellipse(17,21,9,3,C.stoneLight);
    ellipse(17,21,7,2,C.water); line(12,21,18,21,C.waterLight);
    rect(7,22,4,4,C.stone); rect(12,24,5,3,C.stoneDark);
    rect(18,24,5,3,C.stone); rect(24,22,3,4,C.stoneDark);
    line(8,24,12,24,C.cream); line(19,25,22,25,C.stoneLight);
  },
  mine() {
    ground(); poly([[3,26],[8,15],[13,12],[20,15],[26,26]],C.ink);
    poly([[6,25],[10,16],[14,14],[18,17],[23,25]],C.stone);
    poly([[16,25],[22,13],[28,17],[30,26]],C.ink);
    poly([[18,24],[22,15],[27,18],[28,25]],C.stoneLight);
    poly([[9,26],[11,19],[16,16],[21,19],[23,26]],C.ink);
    poly([[12,25],[13,20],[16,18],[20,20],[21,25]],C.deep);
    line(10,26,13,19,C.woodLight,2); line(21,26,19,19,C.woodLight,2);
    line(12,19,20,19,C.woodLight,2);
    line(5,23,8,21,C.stoneLight); line(23,17,25,18,C.light);
    line(13,28,16,23,C.ironLight); line(19,28,17,23,C.ironLight);
    rect(15,23,3,2,C.gold); dot(16,23,C.goldLight);
  },
  lumbermill() {
    ground();
    // Large saw blade behind a pair of cut logs.
    ellipse(19,14,9,9,C.ink); ellipse(19,14,7,7,C.ironLight);
    for(let a=0;a<360;a+=30) {
      let r=a*Math.PI/180;
      line(19+8*Math.cos(r),14+8*Math.sin(r),19+11*Math.cos(r),14+11*Math.sin(r),C.ironLight,2);
    }
    ellipse(19,14,3,3,C.iron); dot(19,14,C.ink);
    rect(4,21,23,7,C.ink); rect(5,22,21,5,C.wood);
    line(6,23,24,23,C.woodLight); line(6,26,24,26,C.shadow);
    ellipse(25,24,3,4,C.ink); ellipse(25,24,2,3,C.woodLight); dot(25,24,C.deep);
    line(6,28,25,28,C.deep);
  },
  tavern() {
    // Foaming tankard with a sturdy handle.
    ellipse(24,17,6,8,C.ink); ellipse(24,17,3,5,C.cream);
    rect(6,10,19,17,C.ink); rect(8,13,15,12,C.woodLight);
    rect(9,15,4,8,C.gold); rect(15,15,3,9,C.cream);
    line(8,25,23,25,C.shadow); line(8,26,24,26,C.ink);
    ellipse(10,10,5,4,C.ink); ellipse(10,9,4,3,C.light);
    ellipse(16,9,5,5,C.ink); ellipse(16,8,4,4,C.light);
    ellipse(22,10,4,4,C.ink); ellipse(22,9,3,3,C.light);
    rect(8,11,15,3,C.light); dot(14,13,C.cream);
  },
  blacksmith() {
    ground();
    // Hammer over an anvil, with a single forge spark.
    line(8,7,21,20,C.ink,5); line(8,7,21,20,C.woodLight,3);
    line(9,8,18,17,C.cream);
    poly([[4,7],[9,3],[17,10],[13,14]],C.ink);
    poly([[6,7],[9,5],[15,10],[13,12]],C.ironLight);
    line(9,5,14,10,C.light);
    poly([[5,20],[26,20],[28,23],[23,25],[20,25],[20,28],[11,28],[11,25],[8,24]],C.ink);
    poly([[7,21],[25,21],[24,23],[19,23],[18,26],[13,26],[12,23],[9,23]],C.iron);
    line(8,21,24,21,C.ironLight); line(13,27,18,27,C.stoneLight);
    dot(24,14,C.goldLight); dot(26,16,C.gold); dot(23,17,C.roofLight);
  },
  windmill() {
    ground(); poly([[10,26],[12,13],[20,13],[23,26]],C.ink);
    poly([[12,25],[14,15],[19,15],[21,25]],C.cream);
    line(13,19,13,24,C.stoneLight); line(20,19,21,24,C.woodLight);
    roof(10,15,16,8,22,15,17);
    frame(15,22,3,5,C.wood); dot(17,23,C.gold);
    // Four cloth sails attached to a dark central hub.
    poly([[15,15],[11,6],[12,3],[18,13]],C.ink);
    poly([[15,13],[12,6],[12,5],[17,13]],C.cream);
    poly([[18,14],[25,9],[29,9],[20,17]],C.ink);
    poly([[20,15],[25,11],[27,10],[20,16]],C.cream);
    poly([[19,18],[23,26],[23,29],[16,20]],C.ink);
    poly([[20,20],[22,25],[22,27],[18,20]],C.cream);
    poly([[14,18],[6,22],[3,22],[13,15]],C.ink);
    poly([[12,17],[6,20],[5,21],[13,18]],C.cream);
    ellipse(17,17,3,3,C.ink); ellipse(17,17,1,1,C.goldLight);
  },
  market() {
    ground(); rect(5,16,2,11,C.ink); rect(25,16,2,11,C.ink);
    rect(6,18,20,7,C.woodLight); rect(7,19,18,5,C.cream);
    poly([[4,15],[8,8],[24,8],[28,15],[27,19],[24,18],[21,20],[17,18],[13,20],[9,18],[5,19]],C.ink);
    poly([[6,15],[9,9],[13,9],[11,17],[8,17]],C.roofLight);
    poly([[13,9],[17,9],[17,17],[12,18]],C.cream);
    poly([[18,9],[23,9],[25,17],[18,17]],C.roofLight);
    poly([[23,9],[27,15],[26,17],[24,17]],C.cream);
    rect(6,25,20,2,C.ink); rect(7,24,18,2,C.wood);
    ellipse(12,23,3,2,C.grass); dot(12,21,C.leafLight);
    ellipse(20,23,3,2,C.gold); dot(20,21,C.goldLight);
  },
  next_turn() {
    // A full-size forward arrow with a warm sun disc behind it.
    ellipse(14,16,12,12,C.ink); ellipse(14,16,10,10,C.gold);
    ellipse(14,16,7,7,C.deep); ellipse(14,16,5,5,C.wood);
    line(7,13,9,10,C.goldLight); line(11,8,15,7,C.goldLight);
    poly([[12,13],[20,13],[20,9],[30,16],[20,23],[20,19],[12,19]],C.ink);
    poly([[13,14],[21,14],[21,11],[28,16],[21,21],[21,18],[13,18]],C.goldLight);
    line(14,15,21,15,C.light);
  },
};
function crc32(buf) {
  let c = 0xffffffff;
  for (let v of buf) { c ^= v; for (let k=0;k<8;k++) c = (c>>>1) ^ ((c&1) ? 0xedb88320 : 0); }
  return (c^0xffffffff)>>>0;
}
function chunk(type,data) {
  let name=Buffer.from(type), size=Buffer.alloc(4), crc=Buffer.alloc(4);
  size.writeUInt32BE(data.length); crc.writeUInt32BE(crc32(Buffer.concat([name,data])));
  return Buffer.concat([size,name,data,crc]);
}
function png(data) {
  let ihdr=Buffer.alloc(13); ihdr.writeUInt32BE(W,0); ihdr.writeUInt32BE(H,4); ihdr[8]=8; ihdr[9]=6;
  let rows=[];
  for(let y=0;y<H;y++) rows.push(Buffer.from([0]),data.subarray(y*W*4,(y+1)*W*4));
  return Buffer.concat([Buffer.from('89504e470d0a1a0a','hex'),chunk('IHDR',ihdr),chunk('IDAT',zlib.deflateSync(Buffer.concat(rows))),chunk('IEND',Buffer.alloc(0))]);
}
for (const [name, draw] of Object.entries(icons)) {
  pixels=Buffer.alloc(W*H*4); draw();
  fs.writeFileSync(path.join(__dirname, name+'.png'),png(pixels));
  console.log(name+'.png');
}
