// Returns a 3x3 transformation matrix as an array of 9 values in column-major order.
// The transformation first applies scale, then rotation, and finally translation.
// The given rotation value is in degrees.
function GetTransform( positionX, positionY, rotation, scale )
{
	const scaleMat = [
		scale,0,0,
		0,scale,0,
		0,0,1
	]

	const rad = rotation/180*Math.PI;
	const rotationMat = [
		Math.cos(rad),Math.sin(rad),0,
		-Math.sin(rad),Math.cos(rad),0,
		0,0,1
	]

	const translateMat = [
		1,0,0,
		0,1,0,
		positionX,positionY,1
	]

	let t = ApplyTransform(scaleMat,rotationMat);
	t = ApplyTransform(t,translateMat);

	return t;
}

// Returns a 3x3 transformation matrix as an array of 9 values in column-major order.
// The arguments are transformation matrices in the same format.
// The returned transformation first applies trans1 and then trans2.
function ApplyTransform( trans1, trans2 )
{
	let t1 = trans1,t2 = trans2;

	return [
		t2[0]*t1[0]+t2[3]*t1[1]+t2[6]*t1[2],// 0
		t2[1]*t1[0]+t2[4]*t1[1]+t2[7]*t1[2],// 1
		t2[2]*t1[0]+t2[5]*t1[1]+t2[8]*t1[2],// 2

		t2[0]*t1[3]+t2[3]*t1[4]+t2[6]*t1[5],// 3
		t2[1]*t1[3]+t2[4]*t1[4]+t2[7]*t1[5],// 4
		t2[2]*t1[3]+t2[5]*t1[4]+t2[8]*t1[5],// 5
		
		t2[0]*t1[6]+t2[3]*t1[7]+t2[6]*t1[8],// 6
		t2[1]*t1[6]+t2[4]*t1[7]+t2[7]*t1[8],// 7
		t2[2]*t1[6]+t2[5]*t1[7]+t2[8]*t1[8],// 8
		]
}
