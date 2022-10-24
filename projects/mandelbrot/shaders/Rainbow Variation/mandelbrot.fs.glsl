precision highp float;

#define PI 3.14159265359;

uniform vec2 viewportDimensions;
uniform float minI;
uniform float maxI;
uniform float minR;
uniform float maxR;

void main(){
    vec2 c = vec2(
        minR + (maxR - minR) * gl_FragCoord.x / viewportDimensions.x,
        minI + (maxI - minI) * gl_FragCoord.y / viewportDimensions.y
    );

    vec2 z = c;
    float iterations = 0.0;
    int iterationsInt = 0;
    float maxIterations = 5000.0;
    const int maxIterationsInt = 5000;
    vec4 prevColor = vec4(1.0, 1.0, 1.0,1.0);

    for(int i = 0; i < maxIterationsInt; i++){
        float t = 2.0 * z.x * z.y + c.y;
        z.x = z.x * z.x - z.y * z.y + c.x;
        z.y = t;

        if(z.x * z.x + z.y * z.y > 4.0){
            break;
        }

        gl_FragColor = mix(prevColor,vec4(z.x,z.y,z.x*z.y,1.0),iterations / maxIterations);
        prevColor = gl_FragColor;

        iterations += 1.0;
        iterationsInt += 1;
    }

    if(iterations >= maxIterations){
        discard;
    }
}