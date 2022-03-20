"use strict";

var canvas;
var gl;

var points = [];

var NumTimesToSubdivide = 6; // 7 아래의 숫자를 입력!

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Initialize our data for the Sierpinski Gasket
    //

    // First, initialize the corners of our gasket with three points.

    var vertices = [
        vec2( -1, -1 ), // a 0
        vec2( -1,  1 ), // b 1
        vec2( 1, 1 ), // c 2
        vec2( 1, -1 ) // d 3
    ];

    divideTriangle( vertices[0], vertices[3], vertices[2],
        NumTimesToSubdivide); // vertices가 다른 것에 유의!
    divideTriangle( vertices[0], vertices[1], vertices[2],
          NumTimesToSubdivide);


   

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU

    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    render();
};

function triangle( a, b, c )
{
    points.push( a, b, c );
}

function divideTriangle( a, d, c, count )
{//a, d, c는 각 Vertices, count는 반복 횟수

    // check for end of recursion

    if ( count === 0 ) {
        triangle( a, d, c );
    }
    else {

        //변 삼등분하기

        var ad1 = mix( a, d, 1/3 );
        var ad2 = mix( a, d, 2/3 );
        var dc1 = mix( d, c, 1/3 );
        var dc2 = mix( d, c, 2/3 );
        var ac1 = mix( a, c, 1/3 );
        var ac2 = mix( ac1, c, 1/2 );
        var h = mix(ad1, dc2, 1/2);
        

        --count;

        // 8개의 새로운 삼각형 생성, 삼각형 분할을 count가 0이 될 때까지 반복

        divideTriangle( a, ad1, ac1, count );
        divideTriangle( ad1, ac1, h, count );
        divideTriangle( ad1, ad2, h, count );
        divideTriangle( ad2, d, dc1, count );
        divideTriangle( ad2, h, dc1, count );
        divideTriangle( h, dc1, dc2, count );
        divideTriangle( h, ac2, dc2, count );
        divideTriangle( ac2, dc2, c, count );
    

        
    }
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, points.length ); // gl.TRIANGLES 사용! 독립적인 삼각형 그리기
}
