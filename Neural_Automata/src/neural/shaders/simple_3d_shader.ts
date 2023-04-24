export const simple_3d_vertex = 
`#version 300 es
layout(location=0) in vec3 pos;
precision highp float;

uniform mat4 u_view;
uniform mat4 u_proj;
uniform vec3 u_eye;

in vec4 a_norm;
in vec4 a_pos;
in vec2 a_uv;

out vec4 v_norm;
out vec2 v_uv;
out vec3 v_eye;
out vec3 v_ray;

void main() 
{
    gl_Position = u_proj * u_view * a_pos;
    v_norm = normalize(a_norm);
    v_uv = a_uv;
    v_eye = u_eye;
    v_ray = a_pos.xyz - u_eye;
}
`;

export const simple_3d_fragment = 
`#version 300 es
precision highp float;

uniform highp sampler3D u_volume;
uniform highp sampler2D u_func; 

in vec4 v_norm;
in vec2 v_uv;
in vec3 v_eye;
in vec3 v_ray;

out vec4 fragColor;

vec2 intersect_box(vec3 orig, vec3 dir) 
{
	const vec3 box_min = vec3(-0.5, -0.5, -0.5);
	const vec3 box_max = vec3(0.5, 0.5, 0.5);
	vec3 inv_dir = 1.0 / dir;
	vec3 tmin_tmp = (box_min - orig) * inv_dir;
	vec3 tmax_tmp = (box_max - orig) * inv_dir;
	vec3 tmin = min(tmin_tmp, tmax_tmp);
	vec3 tmax = max(tmin_tmp, tmax_tmp);
	float t0 = max(tmin.x, max(tmin.y, tmin.z));
	float t1 = min(tmax.x, min(tmax.y, tmax.z));
	return vec2(t0, t1);
}

void main() 
{   
    vec4 my_color = vec4(0.0, 0.0, 0.0, 0.0);

    // step 1: normalize ray
    vec3 ray = normalize(v_ray);

    // step 2: intersect ray with volume, find interval along ray inside volume
    vec2 t_hit = intersect_box(v_eye, ray);
    if (t_hit.x > t_hit.y)
    {
        discard;
    }

    // avoid sampling behind eye
    t_hit.x = max(t_hit.x, 0.0);

    // step 3: set step size to march through volume
    float dt = 0.001;

    // step 4: march ray through volume and sample
    vec3 p = v_eye + t_hit.x * ray;
    for (float t = t_hit.x; t < t_hit.y; t += dt)
    {
        // sample volume
        float val = texture(u_volume, p + vec3(0.5, 0.5, 0.5)).a;

        // get color from transfer function
        vec4 val_color = vec4(texture(u_func, vec2(val * 2.0, 0.5)).rgb, val * 0.5);

        my_color.rgb += (1.0 - my_color.a) * val_color.a * val_color.rgb;
        my_color.a += (1.0 - my_color.a) * val_color.a;

        if (my_color.a >= 0.95)
        {
            break;
        }
        p += ray * dt;
    }

    fragColor = my_color; // (abs(v_norm) * 0.25) + (vec4(ray, 1.0) * 0.25); +
}
`;

