precision highp float;

uniform vec2 viewportDimensions;
uniform float minI;
uniform float maxI;
uniform float minR;
uniform float maxR;
uniform float colorMultiplier;
uniform float colorType;

void main(){
    vec2 c = vec2(
        minR + (maxR - minR) * gl_FragCoord.x / viewportDimensions.x,
        minI + (maxI - minI) * gl_FragCoord.y / viewportDimensions.y
    );

    vec2 z = c;
    float iterations = 0.0;
    float maxIterations = 2500.0;
    const int maxIterationsInt = 2500;

    for(int i = 0; i < maxIterationsInt; i++){
        float t = 2.0 * z.x * z.y + c.y;
        z.x = z.x * z.x - z.y * z.y + c.x;
        z.y = t;

        if(z.x * z.x + z.y * z.y > 4.0){
            break;
        }

        if(colorType == 1.){
            gl_FragColor = vec4((iterations / maxIterations) * colorMultiplier, 0.0,0.0, 1.0);
        } else if(colorType == 2.){
            gl_FragColor = vec4(0.0,(iterations / maxIterations) * colorMultiplier,0.0, 1.0);
        } else{
            gl_FragColor = vec4(0.0,0.0,(iterations / maxIterations) * colorMultiplier, 1.0);
        }

        iterations += 1.0;
    }

    if(iterations >= maxIterations){
        discard;
    }
}