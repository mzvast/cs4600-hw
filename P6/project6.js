var raytraceFS = /*glsl */`

struct Ray {
	vec3 pos; // 位置
	vec3 dir; // 方向
};

struct Material {
	vec3  k_d;	// diffuse coefficient 漫反射颜色
	vec3  k_s;	// specular coefficient 高光颜色
	float n;	// specular exponent 光洁度系数
};

struct Sphere {
	vec3     center; // 中心点
	float    radius; // 半径
	Material mtl; // 材质
};

struct Light {
	vec3 position;
	vec3 intensity;
};


// 碰撞信息
struct HitInfo {
	float    t;
	vec3     position; // 碰撞点
	vec3     normal; // 碰撞点的法线
	Material mtl; // 材质
};

uniform Sphere spheres[ NUM_SPHERES ];
uniform Light  lights [ NUM_LIGHTS  ];
uniform samplerCube envMap;
uniform int bounceLimit;

bool IntersectRay( inout HitInfo hit, Ray ray );

// Shades the given point and returns the computed color.
vec3 Shade( Material mtl, vec3 position, vec3 normal, vec3 view )
{
	vec3 color = vec3(0,0,0); // 阴影色
	for ( int i=0; i<NUM_LIGHTS; ++i ) {
		// Check for shadows
		Light light = lights[i];
		// 光源和这个点之间是否有遮挡
		HitInfo hit;
		Ray ray;
		ray.pos = position;
		ray.dir = light.position - position;

		if(IntersectRay(hit,ray)) { continue; }
		// TO-DO: If not shadowed, perform shading using the Blinn model
		vec3 n_light = normalize(light.position - position);
		vec3 n_normal = normalize(normal);
		float nDotL = max(0.,dot(n_light, n_normal));

		vec3 n_view = normalize(view);
		vec3 h = normalize((n_light + n_view));

		float nDotH = max(0.,dot(n_normal, h));

		color += lights[i].intensity*(nDotL* mtl.k_d + mtl.k_s* pow(nDotH, mtl.n));	// change this line
	}
	return color;
}

// Intersects the given ray with all spheres in the scene
// and updates the given HitInfo using the information of the sphere
// that first intersects with the ray.
// Returns true if an intersection is found.
bool IntersectRay( inout HitInfo hit, Ray ray )
{
	hit.t = 1e30; // 最大值
	float epsilon = 0.000001; // 允许误差，避免水波纹
	bool foundHit = false;
	// 求一个最近的交点
	for ( int i=0; i<NUM_SPHERES; ++i ) {
		Sphere sphere = spheres[i];
		// Test for ray-sphere intersection
		float a = dot(ray.dir,ray.dir);
		float b = 2.*dot(ray.dir,ray.pos - sphere.center);
		float c = dot(ray.pos - sphere.center,ray.pos - sphere.center) - sphere.radius * sphere.radius;
		float delta = b*b - 4.*a*c;
		if(delta<0.) { continue;} // 无交点
		// If intersection is found, update the given HitInfo
		float t = (-b-sqrt(delta)) / (2.*a); // 较为近的交点
		if(t<hit.t && t> epsilon){
			foundHit = true;
			hit.t = t;
			// 计算碰撞的其他信息
			hit.position = ray.pos + t*ray.dir; // 碰撞点
			hit.normal = normalize(hit.position - sphere.center);// 从球心指向碰撞点
			hit.mtl = sphere.mtl;// 材质
		}
		
		
	}
	return foundHit;
}

// Given a ray, returns the shaded color where the ray intersects a sphere.
// If the ray does not hit a sphere, returns the environment color.
vec4 RayTracer( Ray ray )
{
	HitInfo hit;
	if ( IntersectRay( hit, ray ) ) {
		vec3 view = normalize( -ray.dir );
		vec3 clr = Shade( hit.mtl, hit.position, hit.normal, view );
		
		// Compute reflections
		vec3 k_s = hit.mtl.k_s;
		for ( int bounce=0; bounce<MAX_BOUNCES; ++bounce ) {
			if ( bounce >= bounceLimit ) break;
			if ( hit.mtl.k_s.r + hit.mtl.k_s.g + hit.mtl.k_s.b <= 0.0 ) break; // 完全不反射
			
			Ray r;	// this is the reflection ray
			HitInfo h;	// reflection hit info
			
			// Initialize the reflection ray
			r.pos = hit.position;
			// vec3 n = normalize(hit.normal);
			r.dir =  normalize(reflect(-view, hit.normal)); // 等价于 r.dir =-view + 2.*dot(n,view)*n;
			if ( IntersectRay( h, r ) ) {
				// Hit found, so shade the hit point
				clr += k_s * Shade(h.mtl, h.position, h.normal, -r.dir);
				// Update the loop variables for tracing the next reflection ray
				hit = h;
				view = -r.dir;
				k_s *= h.mtl.k_s; // 叠加反射系数
			} else {
				// The refleciton ray did not intersect with anything,
				// so we are using the environment color
				clr += k_s * textureCube( envMap, r.dir.xzy ).rgb;
				break;	// no more reflections
			}
		}
		return vec4( clr, 1 );	// return the accumulated color, including the reflections
	} else {
		return vec4( textureCube( envMap, ray.dir.xzy ).rgb, 0 );	// return the environment color
	}
}
`;