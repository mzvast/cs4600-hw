// This function takes the translation and two rotation angles (in radians) as input arguments.
// The two rotations are applied around x and y axes.
// It returns the combined 4x4 transformation matrix as an array in column-major order.
// You can use the MatrixMult function defined in project5.html to multiply two 4x4 matrices in the same format.
function GetModelViewMatrix( translationX, translationY, translationZ, rotationX, rotationY )
{
	// Modify the code below to form the transformation matrix.
	const rotX =[
		1,0,0,0,
		0,Math.cos( rotationX ),Math.sin( rotationX),0,
		0,-Math.sin( rotationX ),Math.cos( rotationX),0,
		0,0,0,1
	];
	const rotY = [
		Math.cos( rotationY ),0, -Math.sin( rotationY),0,
		0, 1, 0,0,
		Math.sin( rotationY ),0, Math.cos( rotationY),0,
		0,0,0,1
	]

	 
	var trans = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		translationX, translationY, translationZ, 1
	];
	var mvp =MatrixMult( trans, rotX );
	mvp = MatrixMult( mvp, rotY );
	return mvp;
}


// Complete the implementation of the following class.

class MeshDrawer
{
	// The constructor is a good place for taking care of the necessary initializations.
	constructor()
	{
		// initializations
		// initializations
		this.prog = InitShaderProgram( meshVS, meshFS );
		
		// Get the ids of the uniform variables in the shaders
		this.mvp = gl.getUniformLocation( this.prog, 'mvp' );
		this.swap = gl.getUniformLocation( this.prog, 'swap');
		this.sampler = gl.getUniformLocation( this.prog, 'tex');
		this.showTexturePos = gl.getUniformLocation( this.prog, 'showTexture');
		
		this.lightDir = gl.getUniformLocation( this.prog, 'lightDir');
		this.shininess = gl.getUniformLocation( this.prog, 'shininess');
		this.camDir = gl.getUniformLocation( this.prog, 'camDir');
		
		// Get the ids of the vertex attributes in the shaders
		this.vertPos = gl.getAttribLocation( this.prog, 'pos' );
		this.txcPos = gl.getAttribLocation( this.prog, 'txc');
		this.normalPos = gl.getAttribLocation( this.prog, 'normal');
		// create buffers
		this.vertPosBuffer = gl.createBuffer();
		this.texCoordsBuffer = gl.createBuffer();
		this.normalBuffer = gl.createBuffer();

		// create texture
		this.texture = gl.createTexture();
		
		// 几个功能的初始值
		this.swapYZ( false); 
		this.showTexture(true);
	}
	
	// This method is called every time the user opens an OBJ file.
	// The arguments of this function is an array of 3D vertex positions,
	// an array of 2D texture coordinates, and an array of vertex normals.
	// Every item in these arrays is a floating point value, representing one
	// coordinate of the vertex position or texture coordinate.
	// Every three consecutive elements in the vertPos array forms one vertex
	// position and every three consecutive vertex positions form a triangle.
	// Similarly, every two consecutive elements in the texCoords array
	// form the texture coordinate of a vertex and every three consecutive 
	// elements in the normals array form a vertex normal.
	// Note that this method can be called multiple times.
	setMesh( vertPos, texCoords, normals )
	{
		// Update the contents of the vertex buffer objects.
		this.numTriangles = vertPos.length / 3;
		// 把vertPos写入buffer
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertPosBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW );
		// 把texCoords写入buffer
		gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordsBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW );
		// 把normals写入buffer
		gl.bindBuffer (gl.ARRAY_BUFFER, this.normalBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW );
	}
	
	// This method is called when the user changes the state of the
	// "Swap Y-Z Axes" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	swapYZ( swap )
	{
		// Set the uniform parameter(s) of the vertex shader
		gl.useProgram( this.prog );
		if(swap){
			// 翻转
			gl.uniformMatrix4fv( this.swap, false, new Float32Array(
				[0,1,0,0,
				1,0,0,0,
				0,0,1,0,
				0,0,0,1
			]) );
		}else{
			gl.uniformMatrix4fv( this.swap, false, new Float32Array(
				[1,0,0,0,
				0,1,0,0,
				0,0,1,0,
				0,0,0,1
			]) );
		}
	}
	
	// This method is called to draw the triangular mesh.
	// The arguments are the model-view-projection transformation matrixMVP,
	// the model-view transformation matrixMV, the same matrix returned
	// by the GetModelViewProjection function above, and the normal
	// transformation matrix, which is the inverse-transpose of matrixMV.
	draw( matrixMVP, matrixMV, matrixNormal )
	{
		// Complete the WebGL initializations before drawing

		// const mvp = MatrixMult( matrixMVP, matrixMV );
		
		gl.useProgram(this.prog);
		gl.uniformMatrix4fv( this.mvp, false, matrixMVP );

		gl.uniform3fv( this.camDir,[matrixMV[2], matrixMV[6], matrixMV[8]]); // todo:???why

		// 写vertPos到Attrib
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertPosBuffer);	
		gl.vertexAttribPointer(this.vertPos,3,gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray(this.vertPos);

		// 写textCords到Attrib
		gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordsBuffer);
		gl.vertexAttribPointer(this.txcPos, 2, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray(this.txcPos);

		// 写normals到Attrib
		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
		gl.vertexAttribPointer(this.normalPos,3,gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.normalPos);

		gl.drawArrays( gl.TRIANGLES, 0, this.numTriangles );
	}
	
	// This method is called to set the texture of the mesh.
	// The argument is an HTML IMG element containing the texture data.
	setTexture( img )
	{
		// Bind the texture
		gl.activeTexture(gl.TEXTURE0); // active unit0
		gl.bindTexture(gl.TEXTURE_2D, this.texture);

		// You can set the texture image data using the following command.
		gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img );
		gl.generateMipmap(gl.TEXTURE_2D);

		// Now that we have a texture, it might be a good idea to set
		// some uniform parameter(s) of the fragment shader, so that it uses the texture.
		// 可选参数
		// gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); // 线性插值
		// gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); // 双线性插值
		
		gl.useProgram(this.prog);
		gl.uniform1i(this.sampler,0);// use unit 0	
	}
	// This method is called when the user changes the state of the
	// "Show Texture" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	showTexture( show )
	{
		// set the uniform parameter(s) of the fragment shader to specify if it should use the texture.
		gl.useProgram( this.prog );
		gl.uniform1i(this.showTexturePos,show);
	}
	
	// This method is called to set the incoming light direction
	setLightDir( x, y, z )
	{
		// set the uniform parameter(s) of the fragment shader to specify the light direction.
		gl.useProgram( this.prog);
		gl.uniform3fv(this.lightDir, [x,y,z]); // todo:??向外
	}
	
	// This method is called to set the shininess of the material
	setShininess( shininess )
	{
		// set the uniform parameter(s) of the fragment shader to specify the shininess.
		gl.useProgram( this.prog);
		gl.uniform1f(this.shininess, shininess);
	}
}

const meshVS = /*glsl*/`
attribute vec3 pos;
attribute vec2 txc;
attribute vec3 normal;
uniform mat4 mvp;
uniform mat4 swap;
varying vec2 texCoord;
varying vec3 surfaceNormal;

void main()
{
    gl_Position = mvp*swap * vec4(pos,1);
    texCoord = txc;
    surfaceNormal = normal;
}
`

const meshFS = /*glsl*/`
precision mediump float;
uniform bool showTexture;
uniform sampler2D tex;

uniform vec3 lightDir; // 光照
uniform float shininess; // 光洁度 
uniform vec3 camDir; // 相机角度

varying vec2 texCoord;
varying vec3 surfaceNormal; // 法线

void main() {
	vec4 difuss_color; // 材质颜色
	vec4 white = vec4(1,1,1,1); // 光源颜色
	if(showTexture) {
		difuss_color = texture2D(tex, texCoord);
	} else {
		difuss_color = white;
	}
	vec4 light_color = vec4(1.0, 1.0, 1.0, 1.0);

	float costheta = dot(surfaceNormal, lightDir) / (length(surfaceNormal)* length(lightDir));
	vec4 difuss_component = difuss_color * max(0.0,costheta);
	
	vec3 h = (lightDir + camDir) / length(lightDir+ camDir);
	float cosphi = dot(surfaceNormal, h) / (length(surfaceNormal) * length(h));
	vec4 sep_component = light_color * pow(max(0.0, cosphi), shininess);

	gl_FragColor = difuss_component + sep_component;
	
}
`;