export class neural_renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.height = canvas.height;
        this.width = canvas.width;
        console.log('width: ' + this.width + ', height: ' + this.height);
        this.gl = canvas.getContext("webgl");
        this.frame_time = 1000 / 60; // fps = 60
    }
    set_activation(_activation) {
        this.activation_function = _activation;
    }
    set_kernel(_kernel) {
        this.kernel = _kernel;
    }
    set_color(_color) {
        this.color_mask = { r: _color.x, g: _color.y, b: _color.z };
        if (this.gl) {
            this.gl.uniform4f(this.color_mask_location, this.color_mask.r, this.color_mask.g, this.color_mask.b, 1.0);
            this.update_display();
        }
    }
    set_state(_start_state) {
        let gl = this.gl;
        this.state_tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.state_tex);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, _start_state);
        this.txa = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.txa);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        this.fba = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fba);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.txa, 0);
        this.txb = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.txb);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        this.fbb = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbb);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.txb, 0);
        gl.bindTexture(gl.TEXTURE_2D, this.state_tex);
        this.update_display();
    }
    compile_shaders(_vertex_source, _fragment_source) {
        let gl = this.gl;
        // replace activation function
        _fragment_source = _fragment_source.replace('[ACTIVATION_FUNCTION]', this.activation_function);
        // Create a vertex shader object
        let vertex_shader = gl.createShader(gl.VERTEX_SHADER);
        // Attach vertex shader source code
        gl.shaderSource(vertex_shader, _vertex_source);
        // Compile the vertex shader
        gl.compileShader(vertex_shader);
        // Create fragment shader object
        let fragment_shader = gl.createShader(gl.FRAGMENT_SHADER);
        // Attach fragment shader source code
        gl.shaderSource(fragment_shader, _fragment_source);
        // Compile the fragmentt shader
        gl.compileShader(fragment_shader);
        // Create a shader program object to store
        // the combined shader program
        let shader_program = gl.createProgram();
        this.shader = shader_program;
        // Attach a vertex shader
        gl.attachShader(shader_program, vertex_shader);
        // Attach a fragment shader
        gl.attachShader(shader_program, fragment_shader);
        // Link both programs
        gl.linkProgram(shader_program);
        // Use the combined shader program object
        gl.useProgram(shader_program);
        if (gl.getShaderInfoLog(fragment_shader)) {
            // console.error("FRAGMENT SHADER ERROR:", gl.getShaderInfoLog(fragShader))
            return gl.getShaderInfoLog(fragment_shader);
        }
        if (gl.getShaderInfoLog(vertex_shader)) {
            console.error("VERTEX SHADER ERROR:", gl.getShaderInfoLog(vertex_shader));
        }
        if (gl.getProgramInfoLog(shader_program)) {
            console.error("SHADER PROGRAM ERROR:", gl.getProgramInfoLog(shader_program));
        }
        let vertex_buffer = gl.createBuffer();
        /*==========Defining and storing the geometry=======*/
        let vertices = [
            -1.0, -1.0,
            1.0, -1.0,
            -1.0, 1.0,
            -1.0, 1.0,
            1.0, -1.0,
            1.0, 1.0
        ];
        this.size = ~~(vertices.length / 2);
        gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
        // Get the attribute location
        let coord = gl.getAttribLocation(shader_program, "coordinates");
        // Point an attribute to the currently bound VBO
        gl.vertexAttribPointer(coord, 2, gl.FLOAT, false, 0, 0);
        // Enable the attribute
        gl.enableVertexAttribArray(coord);
        // define attributes
        this.one_pixel_location = gl.getUniformLocation(this.shader, "one_pixel");
        this.kernel_location = gl.getUniformLocation(this.shader, "u_kernel[0]");
        this.color_mask_location = gl.getUniformLocation(this.shader, "color_mask");
        return null;
    }
    start_render() {
        if (this.is_running)
            throw 'called start_render() while already rendering';
        this.is_running = true;
        this.apply_values();
        this.render();
    }
    apply_values() {
        let gl = this.gl;
        gl.uniform2f(this.one_pixel_location, 1 / this.width, 1 / this.height);
        gl.uniform1fv(this.kernel_location, this.kernel);
        gl.uniform4f(this.color_mask_location, this.color_mask.r, this.color_mask.g, this.color_mask.b, 1.0);
    }
    stop_render() {
        this.is_running = false;
        if (this.updaterequest)
            clearTimeout(this.updaterequest);
    }
    render() {
        let start = Date.now();
        this.update_state();
        // if (this.skip_frames) 
        // {
        // 	this.update_state()
        // 	this.update_state()
        // 	this.update_state()
        // }
        console.log('rendering!');
        this.update_display();
        let compute_time = Date.now() - start;
        if (this.is_running) {
            this.updaterequest = setTimeout(() => { this.render(); }, this.frame_time - compute_time); // set render speed
        }
    }
    update_display() {
        let gl = this.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.drawArrays(gl.TRIANGLES, 0, this.size);
    }
    update_state() {
        let gl = this.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbb);
        gl.drawArrays(gl.TRIANGLES, 0, this.size);
        gl.bindTexture(gl.TEXTURE_2D, this.txb); // use texture b
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.drawArrays(gl.TRIANGLES, 0, this.size);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fba);
        gl.drawArrays(gl.TRIANGLES, 0, this.size);
        gl.bindTexture(gl.TEXTURE_2D, this.txa);
    }
}
//# sourceMappingURL=neural_renderer.js.map