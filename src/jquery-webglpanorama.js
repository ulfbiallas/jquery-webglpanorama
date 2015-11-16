/*
* jquery-webglpanorama
* https://github.com/ulfbiallas/jquery-webglpanorama
*
* Copyright (c) 2014-2015 Ulf Biallas
* Licensed under the MIT license.
*/

(function ($) {

    $.fn.panorama = function (options) {
        this.each(function () {

            var optionsPresets = {
                fov : 90
            };
            $.extend(optionsPresets, options);

            var data = {
                context : '',
                vShader : '',
                fShader : '',
                pShader : '',
                animationId : 0,
                phi : -90,
                phiOld : 0,
                theta : 0,
                thetaOld : 0,
                mousedown : false,
                mousePosX : 0,
                mousePosY : 0,
                mousePosOldX : 0,
                mousePosOldY : 0,
                texture_xn : '',
                texture_xp : '',
                texture_yn : '',
                texture_yp : '',
                texture_zn : '',
                texture_zp : '',
                img_xp : '',
                img_xn : '',
                img_yp : '',
                img_yn : '',
                img_zp : '',
                img_zn : '',
                options : optionsPresets
            };

            $(this).mousemove(function (evt) {
                if (data.mousedown) {
                    data.mousePosX = evt.pageX;
                    data.mousePosY = evt.pageY;
                    data.phi = data.phiOld + 0.2 * (data.mousePosX - data.mousePosOldX);
                    data.theta = data.thetaOld - 0.2 * (data.mousePosY - data.mousePosOldY);
                    if (data.theta > 90) {data.theta = 90; }
                    if (data.theta < -90) {data.theta = -90; }
                }
            });
            $(this).mousedown(function (evt) {
                data.mousedown = true;
                data.phiOld = data.phi;
                data.thetaOld = data.theta;
                data.mousePosOldX = evt.pageX;
                data.mousePosOldY = evt.pageY;
            });
            $(this).mouseup(function () {
                data.mousedown = false;
            });
            $(this).mouseout(function () {
                data.mousedown = false;
            });

            data.context = this.getContext('experimental-webgl');

            // initialize graphics
            initWebGL(data);
            initShaders(data);
            createModel(data);

            // step into the mainloop
            data.animationId = requestAnimationFrame(function () {return draw(data); });

        });
        return this;
    }



    function initWebGL(data) {

            var gl = data.context;      
            
            data.texture_xp = gl.createTexture();
            data.img_xp = new Image();
            data.img_xp.onload = function() { handleTextureLoaded(data, data.img_xp, data.texture_xp); }
            data.img_xp.src = data.options.xp;
            
            data.texture_xn = gl.createTexture();
            data.img_xn = new Image();
            data.img_xn.onload = function() { handleTextureLoaded(data, data.img_xn, data.texture_xn); }
            data.img_xn.src = data.options.xn;
            
            data.texture_yp = gl.createTexture();
            data.img_yp = new Image();
            data.img_yp.onload = function() { handleTextureLoaded(data, data.img_yp, data.texture_yp); }
            data.img_yp.src = data.options.yp;

            data.texture_yn = gl.createTexture();
            data.img_yn = new Image();
            data.img_yn.onload = function() { handleTextureLoaded(data, data.img_yn, data.texture_yn); }
            data.img_yn.src = data.options.yn;

            data.texture_zp = gl.createTexture();
            data.img_zp = new Image();
            data.img_zp.onload = function() { handleTextureLoaded(data, data.img_zp, data.texture_zp); }
            data.img_zp.src = data.options.zp;

            data.texture_zn = gl.createTexture();
            data.img_zn = new Image();
            data.img_zn.onload = function() { handleTextureLoaded(data, data.img_zn, data.texture_zn); }
            data.img_zn.src = data.options.zn;
    }



    // Creates a WebGL texture from an Image object
    function handleTextureLoaded(data, image, texture) {
        var gl = data.context;
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }



    function getVertexShader() {
        return "\
            attribute vec4 aPosition;\
            attribute vec2 aUV;\
            uniform mat4 modelviewMatrix;\
            uniform mat4 projectionMatrix;\
            varying vec2 vUV;\
            void main() {\
                gl_Position = projectionMatrix * modelviewMatrix * aPosition;\
                vUV = aUV;\
            }\
        ";
    }



    function getFragmentShader() {
        return "\
            precision mediump float;\
            varying vec2 vUV;\
            uniform sampler2D uSampler;\
            void main() {\
                gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);\
                gl_FragColor = texture2D(uSampler, vUV);\
            }\
        ";
    }



    // Initializes the shader program
    function initShaders(data) {
        var gl = data.context;

        data.pShader = gl.createProgram();

        data.vShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(data.vShader, getVertexShader());
        gl.compileShader(data.vShader);
        gl.attachShader(data.pShader, data.vShader);

        data.fShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(data.fShader, getFragmentShader());
        gl.compileShader(data.fShader);
        gl.attachShader(data.pShader, data.fShader);

        gl.linkProgram(data.pShader);

        gl.useProgram(data.pShader);
    }



    // Creates model of a cube
    function createModel(data) {

        // Define the vertices for the cube.
        // Each line represents one vertex 
        // (x, y, z, u, v)
        var vertices = new Float32Array([ 
        -1.0, -1.0,  1.0, 0.0, 1.0,
         1.0, -1.0,  1.0, 1.0, 1.0,
         1.0,  1.0,  1.0, 1.0, 0.0,
        -1.0,  1.0,  1.0, 0.0, 0.0,

        -1.0, -1.0, -1.0, 1.0, 1.0,
        -1.0,  1.0, -1.0, 1.0, 0.0,
         1.0,  1.0, -1.0, 0.0, 0.0,
         1.0, -1.0, -1.0, 0.0, 1.0,

        -1.0,  1.0, -1.0, 0.0, 0.0,
        -1.0,  1.0,  1.0, 0.0, 1.0,
         1.0,  1.0,  1.0, 1.0, 1.0,
         1.0,  1.0, -1.0, 1.0, 0.0,

        -1.0, -1.0, -1.0, 0.0, 1.0,
         1.0, -1.0, -1.0, 1.0, 1.0,
         1.0, -1.0,  1.0, 1.0, 0.0,
        -1.0, -1.0,  1.0, 0.0, 0.0,

         1.0, -1.0, -1.0, 1.0, 1.0,
         1.0,  1.0, -1.0, 1.0, 0.0,
         1.0,  1.0,  1.0, 0.0, 0.0,
         1.0, -1.0,  1.0, 0.0, 1.0,

        -1.0, -1.0, -1.0, 0.0, 1.0,
        -1.0, -1.0,  1.0, 1.0, 1.0,
        -1.0,  1.0,  1.0, 1.0, 0.0,
        -1.0,  1.0, -1.0, 0.0, 0.0
        ]);

        // Define indices for the cube.
        // Each line represents one triangle and
        // each two lines represent one face of the cube.
        var indices = new Uint16Array([
            0, 1, 2,
            2, 3, 0,

            4, 5, 6,
            6, 7, 4,

            8, 9, 10,
            10, 11, 8,

            12, 13, 14,
            14, 15, 12,

            16, 17, 18,
            18, 19, 16,

            20, 21, 22,
            22, 23, 20
        ]);

        var gl = data.context;

        // store vertices in a buffer
        var vertexBufferObject = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObject);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        // store indices in a buffer
        var indexBufferObject = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferObject);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

        // tell shader program where to find the vertex data
        var vertexAttribLoc = gl.getAttribLocation(data.pShader, "aPosition");
        var vertexAttribLocUV = gl.getAttribLocation(data.pShader, "aUV");
        gl.enableVertexAttribArray(vertexAttribLoc);
        gl.enableVertexAttribArray(vertexAttribLocUV);
        gl.vertexAttribPointer(vertexAttribLoc, 3, gl.FLOAT, false, 5*4, 0);
        gl.vertexAttribPointer(vertexAttribLocUV, 2, gl.FLOAT, false, 5*4, 3*4);
    }



    function draw(data) {
        var gl = data.context;

        // calculate the viewing direction from the spherical coordinates
        var dirX = Math.cos(Math.PI * data.phi / 180) * Math.cos(Math.PI * data.theta / 180);
        var dirY = Math.sin(Math.PI * data.theta / 180);
        var dirZ = Math.sin(Math.PI * data.phi / 180) * Math.cos(Math.PI * data.theta / 180);
        var viewerDirection = new Vec3(dirX, dirY, dirZ);

        // the camera is located in the origin
        var viewerPosition = new Vec3(0.0, 0.0, 0.0);

        // Calculate the camera matrix depending on viewing direction
        var modelviewMatrix = new Aff3d();
        modelviewMatrix.lookAt(viewerPosition, viewerPosition.add(viewerDirection), new Vec3(0.0, 1.0, 0.0));

        var projectionMatrix = new Aff3d();
        var aspect = gl.drawingBufferWidth / gl.drawingBufferHeight;
        projectionMatrix.perspective(data.options.fov, aspect, 0.1, 2);

        // clear screen
        gl.clearColor(1.0, 1.0, 1.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // pass parameters to the shader program
        gl.uniformMatrix4fv(gl.getUniformLocation(data.pShader, "modelviewMatrix"), false, modelviewMatrix.data());
        gl.uniformMatrix4fv(gl.getUniformLocation(data.pShader, "projectionMatrix"), false, projectionMatrix.data());
        gl.uniform1i(gl.getUniformLocation(data.pShader, "uSampler"), 0);

        // draw each side of the cube with the corresponding texture of the cube map
        gl.bindTexture(gl.TEXTURE_2D, data.texture_zp);
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
        gl.bindTexture(gl.TEXTURE_2D, data.texture_zn);
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 6*2);
        gl.bindTexture(gl.TEXTURE_2D, data.texture_yp);
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 12*2);
        gl.bindTexture(gl.TEXTURE_2D, data.texture_yn);
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 18*2);
        gl.bindTexture(gl.TEXTURE_2D, data.texture_xp);
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 24*2);
        gl.bindTexture(gl.TEXTURE_2D, data.texture_xn);
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 30*2);

        data.animationId = requestAnimationFrame(function() {return draw(data);});
    }



    // Class of homogeneous transformation matrices
    function Aff3d() {

        this.values = new Float32Array(16);

        this.setToZero = function() {
            var i;
            for(i=0; i<16; ++i) this.values[i] = 0;
        }

        this.setToIdentity = function() {
            var i;
            for(i=0; i<16; ++i) this.values[i] = 0;
            for(i=0; i< 4; ++i) this.values[4*i+i] = 1;
        }

        // Calculates a camera matrix
        this.lookAt = function(pos, center, up) {
            if(pos.sub(center).norm2() == 0) {
                this.setToIdentity();
            } else {

                var dirNormalized = center.sub(pos).normalize();
                var somehowUpNormalized = up.normalize();
                var thirdDirection = dirNormalized.cross(somehowUpNormalized).normalize();
                var upNormalized = thirdDirection.cross(dirNormalized).normalize();

                this.values[ 0] = thirdDirection.x;
                this.values[ 4] = thirdDirection.y;
                this.values[ 8] = thirdDirection.z;

                this.values[ 1] = upNormalized.x;
                this.values[ 5] = upNormalized.y;
                this.values[ 9] = upNormalized.z;           

                this.values[ 2] = -dirNormalized.x;
                this.values[ 6] = -dirNormalized.y;
                this.values[10] = -dirNormalized.z;

                this.values[ 3] = 0;
                this.values[ 7] = 0;
                this.values[11] = 0;
                this.values[15] = 1;

                this.values[12] = -thirdDirection.dot(pos);
                this.values[13] = -upNormalized.dot(pos);
                this.values[14] =  dirNormalized.dot(pos);  
            }
        }

        // Calculates a projection matrix
        this.perspective = function(fovy, aspect, near, far) {
            this.setToZero();
            var f = cot(fovy * Math.PI / 360.0);
            this.values[ 0] = f / aspect;
            this.values[ 5] = f;
            this.values[10] = (far + near) / (near - far);
            this.values[11] = -1;
            this.values[14] = (2 * far * near) / (near - far);
        }

        this.data = function() {
            return this.values;
        }
    }



    // Class of 3D vectors
    function Vec3( x, y, z ) {

        this.x = x;
        this.y = y;
        this.z = z;

        this.add = function(vec) {
            return new Vec3(x + vec.x, y + vec.y, z + vec.z);
        }

        this.sub = function(vec) {
            return new Vec3(x - vec.x, y - vec.y, z - vec.z);
        }

        this.dot = function(vec) {
            return x * vec.x + y * vec.y + z * vec.z;
        }

        this.scale = function(s) {
            return new Vec3(x*s, y*s, z*s);
        }

        this.cross = function(vec) {
            return new Vec3(y*vec.z - z*vec.y, z*vec.x - x*vec.z, x*vec.y - y*vec.x);
        }

        this.norm2 = function() {
            return x*x + y*y + z*z;
        }

        this.norm = function() {
            return Math.sqrt( this.norm2() );
        }

        this.normalize = function() {
            var length = this.norm();
            if( length>0 ) {
                return this.scale(1.0 / length);
            } else {
                return this;
            }
        }
    }



    // Calculates the cotangent of a value
    function cot(value) {
        return 1.0 / Math.tan(value);
    }

}(jQuery));
