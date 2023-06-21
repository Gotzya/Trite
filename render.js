let canvas, gl, width, height, defaultColor;

class Render {
    constructor(Givencanvas) {
        defaultColor = [0, 0, 0];
        canvas = Givencanvas;
        gl = canvas.getContext("webgl2");
        width = canvas.width;
        height = canvas.height;
        if (!gl) {
            gl = canvas.getContext("experimental-webgl");
            console.log("WebGL not supported, falling back on experimental-webgl");
        }
        else {
            console.log(gl.getParameter(gl.SHADING_LANGUAGE_VERSION));
            console.log(`%cRunning...`, "color: #46e06f;")
        }
        gl.viewport(0, 0, width, height);
        gl.clearColor(0, 0, 0, 1.0);
    }

    clear() { gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT) }
    setClearColor(r, b, g) { gl.clearColor(r / 255, b / 255, g / 255, 1.0) }
    setDefaultColor(r, g, b) { defaultColor = [r/255, g/255, b/255] }
}

class Triangle {
    constructor(x1, y1, x2, y2, x3, y3) {
        this.vertexShaderText = `
            precision mediump float;
            attribute vec2 vertPosition;
            attribute vec3 vertColor;
            varying vec3 fragColor;
            
            void main() {
                fragColor = vertColor;
                gl_Position = vec4(vertPosition, 0.0, 1.0);
            }
        `;

        this.fragmentShaderText = `
            precision mediump float;
            varying vec3 fragColor;

            void main() {
                gl_FragColor = vec4(fragColor, 1.0);
            }
        `;

        // Create shader objects and compile the shaders
        this.vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(this.vertexShader, this.vertexShaderText);
        gl.compileShader(this.vertexShader);

        this.fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(this.fragmentShader, this.fragmentShaderText);
        gl.compileShader(this.fragmentShader);

        // Create and link the shader program
        this.program = gl.createProgram();
        gl.attachShader(this.program, this.vertexShader);
        gl.attachShader(this.program, this.fragmentShader);
        gl.linkProgram(this.program);
        gl.useProgram(this.program);

        this.positionAttributeLocation = gl.getAttribLocation(this.program, "vertPosition");
        this.colorAttributeLocation = gl.getAttribLocation(this.program, "vertColor");
        
        // detects if the constructor is empty (batch mode)
        this.triangleVertices = []
        this.emptyClass = true
        if (x1 === undefined && y1 === undefined) return;
        
        this.emptyClass = false
        this.triangleColor = { r: defaultColor[0], g: defaultColor[1], b: defaultColor[2] }
        this.vertexColor1 = this.triangleColor;
        this.vertexColor2 = this.triangleColor;
        this.vertexColor3 = this.triangleColor;
        let halfHeight = height / 2
        let halfWidth = width / 2
        this.vertexPosition1 = { x: (x1 - halfWidth) / (halfWidth), y: (y1 - halfHeight) / (-halfHeight) };
        this.vertexPosition2 = { x: (x2 - halfWidth) / (halfWidth), y: (y2 - halfHeight) / (-halfHeight) };
        this.vertexPosition3 = { x: (x3 - halfWidth) / (halfWidth), y: (y3 - halfHeight) / (-halfHeight) };

        this.triangleVertices =
            [//                      X,                      Y, R, B, G
                this.vertexPosition1.x, this.vertexPosition1.y, this.vertexColor1.r, this.vertexColor1.g, this.vertexColor1.b,
                this.vertexPosition2.x, this.vertexPosition2.y, this.vertexColor2.r, this.vertexColor2.g, this.vertexColor2.b,
                this.vertexPosition3.x, this.vertexPosition3.y, this.vertexColor3.r, this.vertexColor3.g, this.vertexColor3.b
            ];
    }

    setColor(r, g, b) {
        if (this.emptyClass) { console.warn("setColor is not used for batched primitives"); return; }
        this.triangleColor = { r: r / 255, g: g / 255, b: b / 255 };
        this.vertexColor1 = this.triangleColor;
        this.vertexColor2 = this.triangleColor;
        this.vertexColor3 = this.triangleColor;

        this.triangleVertices = [
            //                   X,                      Y,                   R,                   B,                   G
            this.vertexPosition1.x, this.vertexPosition1.y, this.vertexColor1.r, this.vertexColor1.g, this.vertexColor1.b,
            this.vertexPosition2.x, this.vertexPosition2.y, this.vertexColor2.r, this.vertexColor2.g, this.vertexColor2.b,
            this.vertexPosition3.x, this.vertexPosition3.y, this.vertexColor3.r, this.vertexColor3.g, this.vertexColor3.b
        ];
    }

    add(x1, y1, x2, y2, x3, y3, red, green, blue) {
        this.triangleColor = { r: 0, b: 0, g: 0 };
        if (red !== undefined) this.triangleColor = { r: red / 255, g: green / 255, b: blue / 255 };

        this.vertexColor1 = this.triangleColor;
        this.vertexColor2 = this.triangleColor;
        this.vertexColor3 = this.triangleColor;
        this.vertexPosition1 = { x: (x1 - width / 2) / (width / 2), y: (y1 - height / 2) / (height / -2) };
        this.vertexPosition2 = { x: (x2 - width / 2) / (width / 2), y: (y2 - height / 2) / (height / -2) };
        this.vertexPosition3 = { x: (x3 - width / 2) / (width / 2), y: (y3 - height / 2) / (height / -2) };

        this.triangleVertices.push(
            //                   X,                      Y,                   R,                   B,                   G
            this.vertexPosition1.x, this.vertexPosition1.y, this.vertexColor1.r, this.vertexColor1.g, this.vertexColor1.b,
            this.vertexPosition2.x, this.vertexPosition2.y, this.vertexColor2.r, this.vertexColor2.g, this.vertexColor2.b,
            this.vertexPosition3.x, this.vertexPosition3.y, this.vertexColor3.r, this.vertexColor3.g, this.vertexColor3.b
        );
    }

    clearArray() {
        this.triangleVertices = []
    }

    draw() {
        // Create and bind a buffer for the triangle vertices
        let triangleVertexBufferObject = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObject);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(this.triangleVertices),
            gl.DYNAMIC_DRAW
        );

        gl.enableVertexAttribArray(this.positionAttributeLocation);
        gl.enableVertexAttribArray(this.colorAttributeLocation);

        // Set up attribute pointers
        gl.vertexAttribPointer(
            this.positionAttributeLocation,
            2,
            gl.FLOAT,
            false,
            5 * Float32Array.BYTES_PER_ELEMENT,
            0
        );

        gl.vertexAttribPointer(
            this.colorAttributeLocation,
            3,
            gl.FLOAT,
            false,
            5 * Float32Array.BYTES_PER_ELEMENT,
            2 * Float32Array.BYTES_PER_ELEMENT
        );

        // Draw all triangles in a single call
        gl.drawArrays(gl.TRIANGLES, 0, this.triangleVertices.length / 5);
    }
}

class Line {
    constructor(x1, y1, x2, y2) {
        this.x1 = x1
        this.y1 = y1
        this.x2 = x2
        this.y2 = y2

        this.vertexShaderText = `
            precision mediump float;
            attribute vec2 vertPosition;
            attribute vec3 vertColor;
            varying vec3 fragColor;
            
            void main() {
              fragColor = vertColor;
              gl_Position = vec4(vertPosition, 0.0, 1.0);
            }
        `

        this.fragmentShaderText = `
            precision mediump float;
            varying vec3 fragColor;

            void main() {
              gl_FragColor = vec4(fragColor, 1.0);
            }
        `

        // Create shader objects and compile the shaders
        this.vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(this.vertexShader, this.vertexShaderText);
        gl.compileShader(this.vertexShader);

        this.fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(this.fragmentShader, this.fragmentShaderText);
        gl.compileShader(this.fragmentShader);

        // Create and link the shader program
        this.program = gl.createProgram();
        gl.attachShader(this.program, this.vertexShader);
        gl.attachShader(this.program, this.fragmentShader);
        gl.linkProgram(this.program);
        gl.useProgram(this.program);

        this.positionAttributeLocation = gl.getAttribLocation(this.program, "vertPosition");
        this.colorAttributeLocation = gl.getAttribLocation(this.program, "vertColor");

        gl.enableVertexAttribArray(this.positionAttributeLocation);
        gl.enableVertexAttribArray(this.colorAttributeLocation);
        
        // detects if the constructor is empty (batch mode)
        this.triangleVertices = [];
        this.triangleColor = { r: 0, g: 0, b: 0 }
        this.emptyClass = true;
        if (x1 === undefined && y1 === undefined) return;

        this.emptyClass = false;

        // Precompute triangle color if it remains the same
        this.triangleColor = { r: defaultColor[0], g: defaultColor[1], b: defaultColor[2] };

        // Precompute common values
        this.directionX = x2 - x1;
        this.directionY = y2 - y1;
        this.magnitude = Math.sqrt(this.directionX * this.directionX + this.directionY * this.directionY);
        this.normalX = -this.directionY / this.magnitude;
        this.normalY = this.directionX / this.magnitude;

        this.halfWidth = width / 2;
        this.inverseWidth = 1 / this.halfWidth;

        // Calculate vertex positions
        this.point0X = (this.normalX * 0.5 + x1 - this.halfWidth) * this.inverseWidth;
        this.point0Y = (this.normalY * 0.5 + y1 - this.halfWidth) * -this.inverseWidth;
        this.point1X = (this.normalX * 0.5 + x2 - this.halfWidth) * this.inverseWidth;
        this.point1Y = (this.normalY * 0.5 + y2 - this.halfWidth) * -this.inverseWidth;
        this.point2X = (this.normalX * -0.5 + x1 - this.halfWidth) * this.inverseWidth;
        this.point2Y = (this.normalY * -0.5 + y1 - this.halfWidth) * -this.inverseWidth;
        this.point3X = (this.normalX * -0.5 + x2 - this.halfWidth) * this.inverseWidth;
        this.point3Y = (this.normalY * -0.5 + y2 - this.halfWidth) * -this.inverseWidth;

        // Assign vertex positions to the triangleVertices array directly
        this.triangleVertices = [
            this.point0X, this.point0Y, this.triangleColor.r, this.triangleColor.g, this.triangleColor.b,
            this.point1X, this.point1Y, this.triangleColor.r, this.triangleColor.g, this.triangleColor.b,
            this.point2X, this.point2Y, this.triangleColor.r, this.triangleColor.g, this.triangleColor.b,
            this.point1X, this.point1Y, this.triangleColor.r, this.triangleColor.g, this.triangleColor.b,
            this.point2X, this.point2Y, this.triangleColor.r, this.triangleColor.g, this.triangleColor.b,
            this.point3X, this.point3Y, this.triangleColor.r, this.triangleColor.g, this.triangleColor.b,
        ];
    }


    setColor(r, g, b) {
        if (this.emptyClass) { console.warn("setColor is not used for batched primitives"); return; }

        this.triangleColor.r = r/255
        this.triangleColor.g = g/255
        this.triangleColor.b = b/255

        this.triangleVertices = [
            this.point0X, this.point0Y, this.triangleColor.r, this.triangleColor.g, this.triangleColor.b,
            this.point1X, this.point1Y, this.triangleColor.r, this.triangleColor.g, this.triangleColor.b,
            this.point2X, this.point2Y, this.triangleColor.r, this.triangleColor.g, this.triangleColor.b,
            this.point1X, this.point1Y, this.triangleColor.r, this.triangleColor.g, this.triangleColor.b,
            this.point2X, this.point2Y, this.triangleColor.r, this.triangleColor.g, this.triangleColor.b,
            this.point3X, this.point3Y, this.triangleColor.r, this.triangleColor.g, this.triangleColor.b,
        ];
    }

    setWidth(givenLineWidth) {
        if (this.emptyClass) { console.warn("setWidth is not used for batched primitives"); return; }

        // Precompute common values
        this.lineWidth = givenLineWidth / 2

        this.halfWidth = width / 2;
        this.invWidth = 1 / this.halfWidth;

        // Calculate vertex positions
        this.point0X = (this.normalX * this.lineWidth + this.x1 - this.halfWidth) * this.invWidth;
        this.point0Y = (this.normalY * this.lineWidth + this.y1 - this.halfWidth) * -this.invWidth;
        this.point1X = (this.normalX * this.lineWidth + this.x2 - this.halfWidth) * this.invWidth;
        this.point1Y = (this.normalY * this.lineWidth + this.y2 - this.halfWidth) * -this.invWidth;
        this.point2X = (this.normalX * -this.lineWidth + this.x1 - this.halfWidth) * this.invWidth;
        this.point2Y = (this.normalY * -this.lineWidth + this.y1 - this.halfWidth) * -this.invWidth;
        this.point3X = (this.normalX * -this.lineWidth + this.x2 - this.halfWidth) * this.invWidth;
        this.point3Y = (this.normalY * -this.lineWidth + this.y2 - this.halfWidth) * -this.invWidth;

        // Assign vertex positions to the triangleVertices array directly
        this.triangleVertices = [
            this.point0X, this.point0Y, this.triangleColor.r, this.triangleColor.g, this.triangleColor.b,
            this.point1X, this.point1Y, this.triangleColor.r, this.triangleColor.g, this.triangleColor.b,
            this.point2X, this.point2Y, this.triangleColor.r, this.triangleColor.g, this.triangleColor.b,
            this.point1X, this.point1Y, this.triangleColor.r, this.triangleColor.g, this.triangleColor.b,
            this.point2X, this.point2Y, this.triangleColor.r, this.triangleColor.g, this.triangleColor.b,
            this.point3X, this.point3Y, this.triangleColor.r, this.triangleColor.g, this.triangleColor.b
        ];
    }

    add(x1, y1, x2, y2, LineWidth, r, g, b) {

        // Precompute common values
        this.triangleColor.r = r/255
        this.triangleColor.g = g/255
        this.triangleColor.b = b/255
        this.lineWidth = LineWidth / 2
        this.directionX = x2 - x1;
        this.directionY = y2 - y1;
        this.magnitude = Math.sqrt(this.directionX * this.directionX + this.directionY * this.directionY);
        this.normalX = -this.directionY / this.magnitude;
        this.normalY = this.directionX / this.magnitude;

        this.halfWidth = width / 2;
        this.invWidth = 1 / this.halfWidth;

        // Calculate vertex positions
        this.point0X = (this.normalX * this.lineWidth + x1 - this.halfWidth) * this.invWidth;
        this.point0Y = (this.normalY * this.lineWidth + y1 - this.halfWidth) * -this.invWidth;
        this.point1X = (this.normalX * this.lineWidth + x2 - this.halfWidth) * this.invWidth;
        this.point1Y = (this.normalY * this.lineWidth + y2 - this.halfWidth) * -this.invWidth;
        this.point2X = (this.normalX * -this.lineWidth + x1 - this.halfWidth) * this.invWidth;
        this.point2Y = (this.normalY * -this.lineWidth + y1 - this.halfWidth) * -this.invWidth;
        this.point3X = (this.normalX * -this.lineWidth + x2 - this.halfWidth) * this.invWidth;
        this.point3Y = (this.normalY * -this.lineWidth + y2 - this.halfWidth) * -this.invWidth;

        this.triangleVertices.push(
            this.point0X, this.point0Y, this.triangleColor.r, this.triangleColor.g, this.triangleColor.b,
            this.point1X, this.point1Y, this.triangleColor.r, this.triangleColor.g, this.triangleColor.b,
            this.point2X, this.point2Y, this.triangleColor.r, this.triangleColor.g, this.triangleColor.b,
            this.point1X, this.point1Y, this.triangleColor.r, this.triangleColor.g, this.triangleColor.b,
            this.point2X, this.point2Y, this.triangleColor.r, this.triangleColor.g, this.triangleColor.b,
            this.point3X, this.point3Y, this.triangleColor.r, this.triangleColor.g, this.triangleColor.b
        );
    }

    clearArray() {
        this.triangleVertices = []
    }

    draw() {
        // Create and bind a buffer for the triangle vertices
        let triangleVertexBufferObject = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObject);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(this.triangleVertices),
            gl.STATIC_DRAW
        );

        // Set up attribute pointers
        gl.vertexAttribPointer(
            this.positionAttributeLocation,
            2,
            gl.FLOAT,
            false,
            5 * Float32Array.BYTES_PER_ELEMENT,
            0
        );

        gl.vertexAttribPointer(
            this.colorAttributeLocation,
            3,
            gl.FLOAT,
            false,
            5 * Float32Array.BYTES_PER_ELEMENT,
            2 * Float32Array.BYTES_PER_ELEMENT
        );

        // Draw all triangles in a single call
        gl.drawArrays(gl.TRIANGLES, 0, this.triangleVertices.length / 5);
    }
}

class Circle {
    constructor(x1, y1, radius) {
        this.vertexShaderSource = `
        precision mediump float;
        uniform vec2 screenDimension;
        attribute vec2 position;
        attribute float radius;
        attribute vec3 color;
        varying vec2 circlePosition;
        varying float circleRadius;
        varying vec3 fragColor;

        void main() {
            float screenX = (1.0 + position.x) * screenDimension.x * 0.5;
            float screenY = (1.0 + position.y) * screenDimension.y * 0.5;
            circlePosition = vec2(screenX, screenY);
            circleRadius = radius;
            fragColor = color;

            gl_Position = vec4(position, 0.0, 1.0);
            gl_PointSize = radius * 2.0;
        }
        `;

        this.fragmentShaderSource = `
        precision mediump float;
        varying vec2 circlePosition;
        varying float circleRadius;
        varying vec3 fragColor;
    
        void main() {
            if (distance(circlePosition.xy, gl_FragCoord.xy) >= circleRadius ) discard;
            gl_FragColor = vec4(fragColor.rgb, 1.0); // Set the color of the point (red)
        }
        `;

        // Create and compile the vertex shader
        this.vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(this.vertexShader, this.vertexShaderSource);
        gl.compileShader(this.vertexShader);
        // keeping for programmable shaders
        if (!gl.getShaderParameter(this.vertexShader, gl.COMPILE_STATUS)) {
            console.error('ERROR compiling vertex shader!', gl.getShaderInfoLog(this.vertexShader));
        }

        // Create and compile the fragment shader
        this.fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(this.fragmentShader, this.fragmentShaderSource);
        gl.compileShader(this.fragmentShader);
        // keeping for programmable shaders
        if (!gl.getShaderParameter(this.fragmentShader, gl.COMPILE_STATUS)) {
            console.error('ERROR compiling fragment shader!', gl.getShaderInfoLog(this.fragmentShader));
        }

        // Create the shader program
        this.shaderProgram = gl.createProgram();
        gl.attachShader(this.shaderProgram, this.vertexShader);
        gl.attachShader(this.shaderProgram, this.fragmentShader);
        gl.linkProgram(this.shaderProgram);
        gl.useProgram(this.shaderProgram);

        this.positionAttributeLocation = gl.getAttribLocation(this.shaderProgram, 'position');
        this.radiusAttributeLocation = gl.getAttribLocation(this.shaderProgram, 'radius');
        this.colorAttributeLocation = gl.getAttribLocation(this.shaderProgram, 'color');
        this.screenDimensionUniform = gl.getUniformLocation(this.shaderProgram, "screenDimension")

        gl.enableVertexAttribArray(this.positionAttributeLocation);
        gl.enableVertexAttribArray(this.radiusAttributeLocation);
        gl.enableVertexAttribArray(this.colorAttributeLocation);
        gl.uniform2f(this.screenDimensionUniform, width, height)

        // detects if the constructor is empty (batch mode)
        this.pointVertices = [];
        this.emptyClass = true;
        if (x1 === undefined && y1 === undefined) return;

        this.emptyClass = false;
        this.x1 = (x1 - width / 2) / (width / 2);
        this.y1 = (y1 - height / 2) / (height / -2);
        this.radius = radius;
        this.color = {r: defaultColor[0], g: defaultColor[1], b: defaultColor [2]};
        this.updatevertices();
    }

    updatevertices() {
        this.pointVertices = [this.x1, this.y1, this.radius, this.color.r, this.color.g, this.color.b];
    }

    setColor(r, g, b) {
        if (this.emptyClass) { console.warn("setColor is not used for batched primitives"); return; }

        this.color.r = r/255;
        this.color.g = g/255;
        this.color.b = b/255;
        this.updatevertices();
    }

    add(x1, y1, radius, r, g, b) {
        this.x1 = (x1 - width / 2) / (width / 2)
        this.y1 = (y1 - height / 2) / (height / -2)
        this.r = r/255
        this.b = b/255
        this.g = g/255
        this.radius = radius

        this.pointVertices.push(this.x1, this.y1, this.radius, this.r, this.g, this.b)
    }

    clearArray() {
        this.pointVertices = []
    }

    draw() {
        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.pointVertices), gl.STATIC_DRAW);

        gl.vertexAttribPointer(
            this.positionAttributeLocation,
            2,
            gl.FLOAT,
            false,
            6 * Float32Array.BYTES_PER_ELEMENT,
            0
        );

        gl.vertexAttribPointer(
            this.radiusAttributeLocation,
            1,
            gl.FLOAT,
            false,
            6 * Float32Array.BYTES_PER_ELEMENT,
            2 * Float32Array.BYTES_PER_ELEMENT
        );

        gl.vertexAttribPointer(
            this.colorAttributeLocation,
            3,
            gl.FLOAT,
            false,
            6 * Float32Array.BYTES_PER_ELEMENT,
            3 * Float32Array.BYTES_PER_ELEMENT
        );

        // Draw the point
        gl.drawArrays(gl.POINTS, 0, this.pointVertices.length / 6);
    }
}

class Rectangle {
    constructor(x1, y1, width_, height_) {
        this.width = width_
        this.height = height_
        this.red
        this.blue
        this.green

        this.vertexShaderText = `
            precision mediump float;
            
            attribute vec2 vertPosition;
            attribute vec3 vertColor;
            varying vec3 fragColor;
            
            void main() {
              fragColor = vertColor;
              gl_Position = vec4(vertPosition, 0.0, 1.0);
            }
        `

        this.fragmentShaderText = `
            precision mediump float;
            
            varying vec3 fragColor;
            void main() {
              gl_FragColor = vec4(fragColor, 1.0);
            }
        `

        // Create shader objects and compile the shaders
        this.vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(this.vertexShader, this.vertexShaderText);
        gl.compileShader(this.vertexShader);

        this.fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(this.fragmentShader, this.fragmentShaderText);
        gl.compileShader(this.fragmentShader);

        // Create and link the shader program
        this.program = gl.createProgram();
        gl.attachShader(this.program, this.vertexShader);
        gl.attachShader(this.program, this.fragmentShader);
        gl.linkProgram(this.program);
        gl.useProgram(this.program);

        this.positionAttributeLocation = gl.getAttribLocation(this.program, "vertPosition");
        this.colorAttributeLocation = gl.getAttribLocation(this.program, "vertColor");

        gl.enableVertexAttribArray(this.positionAttributeLocation);
        gl.enableVertexAttribArray(this.colorAttributeLocation);
        
        // detects if the constructor is empty (batch mode)
        this.triangleVertices = [];
        this.emptyClass = true;
        if (x1 === undefined && y1 === undefined) return;

        this.emptyClass = false;
        let halfWidth = width / 2
        let halfHeight = height / 2
        this.point1x = (x1 - halfWidth) / (halfWidth);
        this.point1y = (y1 - halfHeight) / (-halfHeight)
        this.point2x = (x1 - halfWidth) / (halfWidth);
        this.point2y = (y1 + this.height - halfHeight) / (-halfHeight)
        this.point3x = (x1 + this.width - halfWidth) / (halfWidth);
        this.point3y = (y1 + this.height - halfHeight) / (-halfHeight)
        this.point4x = (x1 + this.width - halfWidth) / (halfWidth);
        this.point4y = (y1 - halfHeight) / (-halfHeight)

        // Assign vertex positions to the triangleVertices array directly with default color black
        this.triangleVertices = [
            this.point1x, this.point1y, ...defaultColor,
            this.point2x, this.point2y, ...defaultColor,
            this.point3x, this.point3y, ...defaultColor,
            this.point1x, this.point1y, ...defaultColor,
            this.point3x, this.point3y, ...defaultColor,
            this.point4x, this.point4y, ...defaultColor,
        ];
    }
    
    setColor(r, b, g) {
        if (this.emptyClass) { console.warn("setColor is not used for batched primitives"); return; }
        this.red = r / 255
        this.blue = b / 255
        this.green = g / 255

        this.triangleVertices = [
            this.point1x, this.point1y, this.red, this.blue, this.green,
            this.point2x, this.point2y, this.red, this.blue, this.green,
            this.point3x, this.point3y, this.red, this.blue, this.green,
            this.point1x, this.point1y, this.red, this.blue, this.green,
            this.point3x, this.point3y, this.red, this.blue, this.green,
            this.point4x, this.point4y, this.red, this.blue, this.green,
        ];
    }

    add(x1, y1, width_, height_, r, g, b) {

        // Precompute common values
        this.r = r / 255
        this.b = b / 255
        this.g = g / 255

        let halfWidth = width / 2
        let halfHeight = height / 2

        // constructs rectangle points and converts screen to unit coordinates
        this.point1x = (x1 - halfWidth) / (halfWidth);
        this.point1y = (y1- halfHeight) / (-halfHeight)
        this.point2x = (x1 - halfWidth) / (halfWidth);
        this.point2y = (y1 + height_ - halfHeight) / (-halfHeight)
        this.point3x = (x1 + width_ - halfWidth) / (halfWidth);
        this.point3y = (y1 + height_ - halfHeight) / (-halfHeight)
        this.point4x = (x1 + width_ - halfWidth) / (halfWidth);
        this.point4y = (y1 - halfHeight) / (-halfHeight)

        // Assign vertex positions to the triangleVertices array directly
        this.triangleVertices.push(
            this.point1x, this.point1y, this.r, this.g, this.b,
            this.point2x, this.point2y, this.r, this.g, this.b,
            this.point3x, this.point3y, this.r, this.g, this.b,
            this.point1x, this.point1y, this.r, this.g, this.b,
            this.point3x, this.point3y, this.r, this.g, this.b,
            this.point4x, this.point4y, this.r, this.g, this.b
        );
    }

    clearArray() {
        this.triangleVertices = []
    }

    draw() {
        // Create and bind a buffer for the triangle vertices
        let triangleVertexBufferObject = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObject);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(this.triangleVertices),
            gl.STATIC_DRAW
        );

        // Set up attribute pointers
        gl.vertexAttribPointer(
            this.positionAttributeLocation,
            2,
            gl.FLOAT,
            false,
            5 * Float32Array.BYTES_PER_ELEMENT,
            0
        );

        gl.vertexAttribPointer(
            this.colorAttributeLocation,
            3,
            gl.FLOAT,
            false,
            5 * Float32Array.BYTES_PER_ELEMENT,
            2 * Float32Array.BYTES_PER_ELEMENT
        );

        // Draw all triangles in a single call
        gl.drawArrays(gl.TRIANGLES, 0, this.triangleVertices.length / 5);
    }
}

export { Render, Triangle, Line, Circle, Rectangle }
