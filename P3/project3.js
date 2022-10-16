// [TO-DO] Complete the implementation of the following class and the vertex shader below.


class CurveDrawer {
	constructor()
	{
		this.prog   = InitShaderProgram( curvesVS, curvesFS );
		//  Other initializations should be done here.
		this.mvp = gl.getUniformLocation(this.prog,'mvp');
		this.tPos = gl.getAttribLocation(this.prog,'t');
		this.p0 = gl.getUniformLocation(this.prog,'p0');
		this.p1 = gl.getUniformLocation(this.prog,'p1');
		this.p2 = gl.getUniformLocation(this.prog,'p2');
		this.p3 = gl.getUniformLocation(this.prog,'p3');
		//  This is a good place to get the locations of attributes and uniform variables.
		
		// Initialize the attribute buffer
		this.steps = 100;
		var tv = [];
		for ( var i=0; i<this.steps; ++i ) {
			tv.push( i / (this.steps-1) );
		}
		//  This is where you can create and set the contents of the vertex buffer object
		// for the vertex attribute we need.
		
		this.buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(tv),gl.STATIC_DRAW);
	}
	setViewport( width, height )
	{
		//  This is where we should set the transformation matrix.
		//  Do not forget to bind the program before you set a uniform variable value.
		var trans = [ 2/width,0,0,0,  0,-2/height,0,0, 0,0,1,0, -1,1,0,1 ];
		gl.useProgram( this.prog );	// Bind the program
		gl.uniformMatrix4fv( this.mvp, false, trans );
	}
	updatePoints( pt )
	{
		//  The control points have changed, we must update corresponding uniform variables.
		//  Do not forget to bind the program before you set a uniform variable value.
		gl.useProgram( this.prog );
		//  We can access the x and y coordinates of the i^th control points using
		// var x = pt[i].getAttribute("cx");
		// var y = pt[i].getAttribute("cy");
		for ( var i=0; i<4; ++i ) {
			var x = pt[i].getAttribute("cx");
			var y = pt[i].getAttribute("cy");
			gl.uniform2fv(this['p'+i],new Float32Array([x,y]));
		}

	}
	draw()
	{
		//  This is where we give the command to draw the curve.
		//  Do not forget to bind the program and set the vertex attribute.

		gl.useProgram( this.prog );
		gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer);
		gl.vertexAttribPointer(this.tPos,1,gl.FLOAT,false,0,0);
		gl.enableVertexAttribArray(this.tPos);
		gl.drawArrays( gl.LINE_STRIP, 0, 100 );
	}
}

// Vertex Shader

// 3阶贝塞尔
// (1-t)^3 p0 + 3(1-t)^2*t P1 + 3(1-t)*t^2 P2 + t^3 P3

// https://www.khronos.org/files/webgl/webgl-reference-card-1_0.pdf

// pow(x,y)=>x^y

var curvesVS = `
	attribute float t;
	uniform mat4 mvp;
	uniform vec2 p0;
	uniform vec2 p1;
	uniform vec2 p2;
	uniform vec2 p3;
	void main()
	{
		float rev = 1.0-t;
		vec2 pos = pow(rev,3.0)*p0 + 3.0*pow(rev,2.0)*t*p1 + 3.0*rev*t*t*p2 + pow(t,3.0)*p3;
		gl_Position = mvp*vec4(pos,0,1);
	}
`;

// Fragment Shader
var curvesFS = `
	precision mediump float;
	void main()
	{
		gl_FragColor = vec4(1,0,0,1);
	}
`;

// inspired by https://hakkerbarry.com/