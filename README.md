# ⚡ Trite ⚡

A small and simple 2D graphics library. Supports all modern browsers and uses the HTML canvas to draw. However, all rendering is done with WebGL. This GitHub page is basically for storage, so there is nothing on here to get this working. 🎨📦


## Features

#### Primitives:
- Circles 🟠
- Triangles 🔺
- Rectangles 🟦
- Lines ➖

#### Render Features:
- Batching / Batched rendering 🎯
- Reusable arrays 🔄

## Installation

I think this npm package works. My nuked projects folder says otherwise. GL 👍

```bash
  npm install @gotzya/trite
```
    
## Running Tests ▶️

If you somehow were able to install this library without any directions, first of all, good job! 👏 Secondly, I needed to host the module file on localhost to get around a silly Chrome error. Change as needed. This is a simple test that exercises all the features:
```javascript
import { Render, Triangle, Line, Circle, Rectangle } from "http://127.0.0.1:5500/WebGL/lib/render.js";

let canvas = document.getElementById("canvas");
let render = new Render(canvas);
render.setClearColor(23, 23, 23)

let color = [27, 208, 178]
let batchColor = [237, 134, 55]

render.clear()
let rectangle = new Rectangle(10, 10, 50, 100)
rectangle.setColor(...color)
rectangle.draw()

let triangle = new Triangle(90, 20, 145, 50, 120, 100)
triangle.setColor(...color)
triangle.draw()

let line = new Line(320, 30, 450, 120) 
line.setColor(...color)
line.setWidth(6)
line.draw()

let circle = new Circle(240, 70, 40)
circle.setColor(...color)
circle.draw()

// batches
let batchRectangle = new Rectangle()
batchRectangle.add(10, 10 + 140, 50, 100, ...batchColor)
batchRectangle.add(10, 10 + 280, 50, 100, ...batchColor)
batchRectangle.draw()

let batchTriangle = new Triangle()
batchTriangle.add(90, 20 + 140, 145, 50 + 140, 120, 100 + 140, ...batchColor)
batchTriangle.add(90, 20 + 140 * 2, 145, 50 + 140 * 2, 120, 100 + 140 * 2, ...batchColor)
batchTriangle.draw()

let batchLine = new Line() 
batchLine.add(320, 30 + 140, 450, 120 + 140, 6, ...batchColor)
batchLine.add(320, 30 + 140*2, 450, 120 + 140*2, 6, ...batchColor)
batchLine.draw()

let batchCircle = new Circle()
batchCircle.add(240, 70+ 140, 40, ...batchColor)
batchCircle.add(240, 70+ 140*2, 40, ...batchColor)
batchCircle.draw()

```

## Documentation 📖

Does not exist. I have no clue how anybody has the will power to create documentation for larger code projects. Might make one later if I feel like it. In the mean while, use this link below to get to the download page of PixiJS instead which does have documenation and far more features; of course, disguised as my documentation.

[📚 [Documentation]](https://github.com/pixijs/pixijs/releases)
