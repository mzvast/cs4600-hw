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
		this.mv = gl.getUniformLocation( this.prog, 'mv' );
		this.swap = gl.getUniformLocation( this.prog, 'swap');
		this.sampler = gl.getUniformLocation( this.prog, 'tex');
		this.showTexturePos = gl.getUniformLocation( this.prog, 'showTexture');
		
		this.lightDir = gl.getUniformLocation( this.prog, 'lightDir');
		this.shininess = gl.getUniformLocation( this.prog, 'shininess');
		this.uCameraPos = gl.getUniformLocation( this.prog, 'uCameraPos');
		this.matrixNormalPos = gl.getUniformLocation( this.prog, 'matrixNormal');
		
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
		
		// ????????????????????????
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
		// ???vertPos??????buffer
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertPosBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW );
		// ???texCoords??????buffer
		gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordsBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW );
		// ???normals??????buffer
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
			// ??????
			gl.uniformMatrix4fv( this.swap, false, new Float32Array(
				[1,0,0,0,
				0,0,1,0,
				0,1,0,0,
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
		gl.uniformMatrix4fv( this.mv, false, matrixMV );

		gl.uniformMatrix3fv(this.matrixNormalPos, false, matrixNormal);

		let mv =matrixMV;
		// vec3(mv*vec4[0,0,1,1])
		gl.uniform3fv( this.uCameraPos,new Float32Array([mv[8]+mv[12],mv[9]+mv[13],mv[10]+mv[14]]));

		// ???vertPos???Attrib
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertPosBuffer);	
		gl.vertexAttribPointer(this.vertPos,3,gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray(this.vertPos);

		// ???textCords???Attrib
		gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordsBuffer);
		gl.vertexAttribPointer(this.txcPos, 2, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray(this.txcPos);

		// ???normals???Attrib
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
		// ????????????
		// gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); // ????????????
		// gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); // ???????????????
		
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
		gl.uniform3fv(this.lightDir, [x,y,z]);
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
precision mediump float;
attribute vec3 pos;
attribute vec2 txc;
attribute vec3 normal;

uniform mat4 mvp;
uniform mat4 mv;
uniform mat4 swap;
uniform mat3 matrixNormal; // ??????????????????

varying vec2 vTexCoord;
varying vec3 vPosition;
varying vec3 vNormal;

void main() {
	gl_Position = mvp * swap * vec4(pos, 1);

	vTexCoord = txc;
	vNormal = matrixNormal * normal;
	vPosition = vec3(mv * swap * vec4(pos, 1));
}
`

const meshFS = /*glsl*/`
precision mediump float;
uniform bool showTexture;
uniform mat4 mv;
uniform sampler2D tex;
uniform vec3 lightDir; // ?????????????????????????????????
uniform float shininess; // ????????? 

uniform vec3 uCameraPos;// ????????????

varying vec2 vTexCoord;
varying vec3 vNormal; // ??????
varying vec3 vPosition;

void main() {
	vec3 norm = normalize(vNormal);
	vec3 camDir = normalize(vPosition - uCameraPos); // ????????????
	vec4 light_color = vec4(1.0, 1.0, 1.0, 1.0);
	vec4 white = vec4(1, 1, 1, 1);
	vec4 material_color; // ????????????
	if(showTexture) {
		material_color = texture2D(tex, vTexCoord);
	} else {
		material_color = white;
	}

	float costheta = max(0.0, dot(norm, lightDir));
	vec4 diffuse = light_color * material_color * costheta;

	vec3 h = normalize(lightDir + camDir);
	float cosphi = max(0.0, dot(norm, h));
	vec4 specular = light_color * pow(cosphi, shininess);

	gl_FragColor = diffuse + specular;
}
`;

// inspired by https://sourcegraph.com/github.com/photonstorm/phaser/-/blob/src/renderer/webgl/shaders/Mesh-frag.js?L44:35