precision mediump float;

uniform float time;
uniform float width;
uniform float height;

const float pi = 3.141592653589793;
const float tau = pi * 2.0;
const float hpi = pi * 0.5;

const float ninth = 1.0/9.0;

float atan2(in float y, in float x)
{
    return abs(x) > abs(y) ? hpi - atan(x,y) : atan(y,x);
}

// Simplex 2D noise
//
vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
    -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
    + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
    dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
}

const float interval = 50000.0;
const float third = 1.0/3.0;
const vec4 black = vec4(0,0,0,1);
const vec4 white = vec4(1,1,1,1);


void main(void) {

    float hw = width * 0.5;
    float hh = width * 0.5;

    float diagonal = sqrt(hw*hw+hh*hh);


    float size = min(width, height);

    float tx = (gl_FragCoord.x / size) * 2.0 - 1.0;
    float ty = 1.0 - (gl_FragCoord.y / size) * 2.0;

    if (width < height)
    {
        ty -= (height - width) / size;
    }
    else
    {
        tx -= (width - height) / size;
    }

    float a = fract(((atan2(ty,tx) + pi) / tau) + mod(time,  interval) / interval);

    float a2 = mod(a, ninth) / ninth;

    a2 = a2 < 0.5 ? a2 * 2.0 : 1.0 - (a2 - 0.5) * 2.0;


    float d = sqrt( tx * tx + ty * ty);

    d = d < 1.0 ? d: 1.0 - (d - 1.0);

    vec3 color = vec3(a2,d,0);

    gl_FragColor = vec4(abs(snoise(vec2(a2 * 0.7 + time * 0.0002,d * 6.0 - time * 0.0005))) > 0.25 /*&& a2 > 0.01 && a2 < 0.99 && mod(d, third) < third * 0.98*/ ? color: color * 0.25, 1);
}

