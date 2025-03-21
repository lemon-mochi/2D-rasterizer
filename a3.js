import { Framebuffer } from './framebuffer.js';
import { Rasterizer } from './rasterizer.js';
// DO NOT CHANGE ANYTHING ABOVE HERE

////////////////////////////////////////////////////////////////////////////////
// TODO: Implement functions drawLine(v1, v2) and drawTriangle(v1, v2, v3) below.
////////////////////////////////////////////////////////////////////////////////

// take two vertices defining line and rasterize to framebuffer
Rasterizer.prototype.drawLine = function(v1, v2) {
  const [x1, y1, [r1, g1, b1]] = v1;
  const [x2, y2, [r2, g2, b2]] = v2;

  // TODO/HINT: use this.setPixel(x, y, color) in this function to draw line
  this.setPixel(Math.floor(x1), Math.floor(y1), [r1, g1, b1]);
  this.setPixel(Math.floor(x2), Math.floor(y2), [r2, g2, b2]);

  var m = (y2 - y1) / (x2 - x1);
  var i = 0;
  var value1; // how close it is to v1
  var value2; // how close it is to v2

  //if the slope is steep, it makes more sense to go through the y-values
  if (Math.abs(m) > 1) { 
    m = (x2 - x1) / (y2 - y1); // calculate the slope for change in x
    var x = x1;
    const count = Math.abs(y2 - y1);

    for (var y = y1; y <= y2; y++) {
      x += m;
      value2 = i / count;
      value1 = (count - i) / count
      this.setPixel(Math.floor(x), Math.floor(y), [value2*r2 + value1*r1, value2*g2 + value1*g1, value2*b2 + value1*b1]);
      i++;
    }

    for (var y = y2; y <= y1; y++) {
      x += m;
      value1 = i / count;
      value2 = (count - i) / count
      this.setPixel(Math.floor(x), Math.floor(y), [value2*r2 + value1*r1, value2*g2 + value1*g1, value2*b2 + value1*b1]);
      i++;
    }
  } else {
    var y = y1;
    // idea keep track of how many pixels are used to do the interpolation
    const count = Math.abs(x2 - x1);

    for (var x = x1; x <= x2; x++) {
      y += m;
      value2 = i / count;
      value1 = (count - i) / count
      this.setPixel(Math.floor(x), Math.floor(y), [value2*r2 + value1*r1, value2*g2 + value1*g1, value2*b2 + value1*b1]);
      i++;
    }

    for (x = x2; x <= x1; x++) { // this should handle the case where x1 > x2
      y += m;
      value1 = i / count;
      value2 = (count - i) / count
      this.setPixel(Math.floor(x), Math.floor(y), [value2*r2 + value1*r1, value2*g2 + value1*g1, value2*b2 + value1*b1]);
      i++;
    }
  }
}

function pointIsInsideTriangle(v0, v1, v2, p, ymin, xmin) {
  const [x, y] = p;
  const [x0, y0, [r0, g0, b0]] = v0;
  const [x1, y1, [r1, g1, b1]] = v1;
  const [x2, y2, [r2, g2, b2]] = v2;

  // idea: top edge will have both y's equal to min y
  // idea: find minimum x in v's. The edges that use this are the left edges.

  var a = y1 - y0;
  var b = x0 - x1;
  var c = x1 * y0 - x0 * y1;

  var check = a * x + b * y + c;

  // not top edge or left edge
  if ((y1 != y0 || y1 != ymin) && (x1 != xmin && x0 != xmin)) {
    if (check <= 0) return false;
  }
  else {
    if (check < 0) return false;
  }

  a = y2 - y1;
  b = x1 - x2;
  c = x2 * y1 - x1 * y2;

  check = a * x + b * y + c;

  if ((y2 != y1 || y2 != ymin) && (x2 != xmin && x1 != xmin)) {
    if (check <= 0) return false;
  }
  else {
    if (check < 0) return false;
  }

  a = y0 - y2;
  b = x2 - x0;
  c = x0 * y2 - x2 * y0;

  check = a * x + b * y + c;

  if ((y0 != y2 || y0 != ymin) && (x0 != xmin && x2 != xmin)) {
    if (check <= 0) return false;
  }
  else {
    if (check < 0) return false;
  }

  return true;
}

function barycentricCoordinates(v0, v1, v2, p) {
  const [x0, y0, [r0, g0, b0]] = v0;
  const [x1, y1, [r1, g1, b1]] = v1;
  const [x2, y2, [r2, g2, b2]] = v2;
  const [x, y] = p;
  
  var a = y2 - y1;
  var b = x1 - x2;
  var c = x2 * y1 - x1 * y2;

  var area0 = a * x + b * y + c;

  a = y0 - y2;
  b = x2 - x0;
  c = x0 * y2 - x2 * y0;

  var area1 = a * x + b * y + c;

  a = y1 - y0;
  b = x0 - x1;
  c = x1 * y0 - x0 * y1;

  var area2 = a * x + b * y + c;

  var area = area0 + area1 + area2;

  var u = area0 / area;
  var v = area1 / area;
  var w = area2 / area;
  var red = u*r0 + v*r1 + w*r2;
  var green = u*g0 + v*g1 + w*g2;
  var blue = u*b0 + v*b1 + w*b2;
  return [red, green, blue];
}

// take 3 vertices defining a solid triangle and rasterize to framebuffer
Rasterizer.prototype.drawTriangle = function(v0, v1, v2) {
  const [x0, y0, [r0, g0, b0]] = v0;
  const [x1, y1, [r1, g1, b1]] = v1;
  const [x2, y2, [r2, g2, b2]] = v2;
  // TODO/HINT: use this.setPixel(x, y, color) in this function to draw triangle
  this.setPixel(Math.floor(x0), Math.floor(y0), [r0, g0, b0]);
  this.setPixel(Math.floor(x1), Math.floor(y1), [r1, g1, b1]);
  this.setPixel(Math.floor(x2), Math.floor(y2), [r2, g2, b2]);

  const xmin = Math.ceil(Math.min(x0, x1, x2));
  const xmax = Math.ceil(Math.max(x0, x1, x2));
  const ymin = Math.ceil(Math.min(y0, y1, y2));
  const ymax = Math.ceil(Math.max(y0, y1, y2));

  for (var x = xmin; x <= xmax; x++) {
    for (var y = ymin; y <= ymax; y++) {
      if (pointIsInsideTriangle(v0, v1, v2, [x, y], ymax, xmin)) {
        var [red, green, blue] = barycentricCoordinates(v0, v1, v2, [x, y]);
        this.setPixel(Math.floor(x), Math.floor(y), [red, green, blue]);
      }
    }
  }
}

////////////////////////////////////////////////////////////////////////////////
// EXTRA CREDIT: change DEF_INPUT to create something interesting!
////////////////////////////////////////////////////////////////////////////////
// I have created artwork of a mountain behind a lake on a sunny day.
const DEF_INPUT = [
"v,0,0,0.8,0.9,1;",
"v,0,35,0,0.9,1;",
"v,63,0,0.8,0.9,1;",
"v,63,35,0,0.9,1;",
"v,63,0,0.8,0.9,1;",
"v,63,35,0,0.9,1;",
"t,0,1,2;",
"t,3,2,1;",
"l,4,5;",
"v,0,35,0.0,0.85,0.8;",
"v,30,10,0.94,1.0,1.0;",
"v,50,35,0.0,0.8,0.8;",
"t,8,7,6;",
"v,0,36,0.0,0.4,0.97;",
"v,63,36,0.0,0.4,0.97;",
"v,0,63,0.0,0.4,0.97;",
"v,63,63,0.0,0.4,0.97;",
"t,11,10,9;",
"t,12,10,11;",
"l,10,12;",
"v,34,45,0.96,0.98,0.98;",
"v,18,50,0.6,0.8,0.85;",
"v,34,60,0.96,0.98,0.98;", 
"v,50,50,0.6,0.8,0.85;",
"t,13,14,15;",
"t,13,15,16;",
"v,5,5,1,1,1;",
"v,12,5,1,1,1;",
"v,8,6,1,1,1;", 
"v,15,6,1,1,1;",
"l,17,18;",
"l,19,20;",
].join("\n");

// DO NOT CHANGE ANYTHING BELOW HERE
export { Rasterizer, Framebuffer, DEF_INPUT };