precision mediump float;

uniform float time;
uniform float width;
uniform float height;

const float pi = 3.141592653589793;
const float tau = pi * 2.0;
const float hpi = pi * 0.5;

const float seventh = 1.0/7.0;

float atan2(in float y, in float x)
{
    return abs(x) > abs(y) ? hpi - atan(x,y) : atan(y,x);
}

//////// HSL ////////////////////

float hue2rgb(float f1, float f2, float hue) {
    if (hue < 0.0)
    hue += 1.0;
    else if (hue > 1.0)
    hue -= 1.0;
    float res;
    if ((6.0 * hue) < 1.0)
    res = f1 + (f2 - f1) * 6.0 * hue;
    else if ((2.0 * hue) < 1.0)
    res = f2;
    else if ((3.0 * hue) < 2.0)
    res = f1 + (f2 - f1) * ((2.0 / 3.0) - hue) * 6.0;
    else
    res = f1;
    return res;
}

vec3 hsl2rgb(vec3 hsl) {
    vec3 rgb;

    if (hsl.y == 0.0) {
        rgb = vec3(hsl.z); // Luminance
    } else {
        float f2;

        if (hsl.z < 0.5)
        f2 = hsl.z * (1.0 + hsl.y);
        else
        f2 = hsl.z + hsl.y - hsl.y * hsl.z;

        float f1 = 2.0 * hsl.z - f2;

        rgb.r = hue2rgb(f1, f2, hsl.x + (1.0/3.0));
        rgb.g = hue2rgb(f1, f2, hsl.x);
        rgb.b = hue2rgb(f1, f2, hsl.x - (1.0/3.0));
    }
    return rgb;
}

vec3 hsl2rgb(float h, float s, float l) {
    return hsl2rgb(vec3(h, s, l));
}



//	Simplex 3D Noise
//	by Ian McEwan, Ashima Arts
//
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

float snoise(vec3 v){
    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

    // First corner
    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 =   v - i + dot(i, C.xxx) ;

    // Other corners
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );

    //  x0 = x0 - 0. + 0.0 * C
    vec3 x1 = x0 - i1 + 1.0 * C.xxx;
    vec3 x2 = x0 - i2 + 2.0 * C.xxx;
    vec3 x3 = x0 - 1. + 3.0 * C.xxx;

    // Permutations
    i = mod(i, 289.0 );
    vec4 p = permute( permute( permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

    // Gradients
    // ( N*N points uniformly over a square, mapped onto an octahedron.)
    float n_ = 1.0/7.0; // N=7
    vec3  ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z *ns.z);  //  mod(p,N*N)

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );

    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);

    //Normalise gradients
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    // Mix final noise value
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
    dot(p2,x2), dot(p3,x3) ) );
}

const float interval = 50000.0;
const float third = 1.0/3.0;
const vec3 mid= vec3(0.5,0.5,0.5);
const vec3 black = vec3(0,0,0);
const vec3 white = vec3(1,1,1);


void main(void) {

    float hw = width * 0.5;
    float hh = width * 0.5;

    float diagonal = sqrt(hw*hw+hh*hh);


    float size = min(width, height);

    float xOff = (sin(time * 0.0004) + sin(time * 0.0003)) * size / 6.0;
    float yOff = (sin(time * 0.0002) - sin(time * 0.0005)) * size / 6.0;


    float tx = ((gl_FragCoord.x + xOff) / size) * 2.0 - 1.0;
    float ty = 1.0 - ((gl_FragCoord.y + yOff) / size) * 2.0;

    if (width < height)
    {
        ty -= (height - width) / size;
    }
    else
    {
        tx -= (width - height) / size;
    }

    float a = fract(((atan2(ty,tx) + pi) / tau) + mod(time * 0.8,  interval) / interval);

    float d = sqrt( tx * tx + ty * ty);


    float a2 = (mod(a, seventh) / seventh);

    a2 = a2 < 0.5 ? a2 * 2.0 : 1.0 - (a2 - 0.5) * 2.0;

    //d = d < 1.0 ? d: 1.0 - (d - 1.0);
    float n = snoise(vec3(a2 * 0.6, pow(d,0.4) * 4.0 - time * 0.0002, time * 0.00007));

    vec3 color = hsl2rgb(
        fract(time * 0.00005 + (sin(a * pi) * 0.25 + snoise(vec3(a2 * 0.9,  d * 2.5,time * 0.0004)) * seventh) + (n < 0.0 ? 0.0 : third)),
        0.5 + cos(a*tau + time * 0.001) * 0.4,
        0.5
    );


    float darken = pow(d, 2.0) * 0.02;

    gl_FragColor = vec4(mod(n, 0.5) < 0.4 - darken /*&& a2 > 0.01 && a2 < 0.99 && mod(d, third) < third * 0.98*/ ? color: black, 1);
}

