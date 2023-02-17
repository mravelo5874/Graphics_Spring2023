Milestone 2 Submission by Marco Ravelo
Date: 2/15/2023

No colaboration was done and all the code writen was by me.

I intentionally turned in the assignment late. I plan to use one of my late-days for this project.

All parts of the assignment are complete. Plus some extra credit parts.

- Acceleration Structure: I created a BVH structure that is generated when you open and load a new scene (line 325 of RayTracer.cpp). The implementation of all the BVH methods is contained within the scene class (all code after line 220 in scene.cpp is dedicated to creating and traversing the BVH structure). Acceleration works for every primative geometry and with every scene. The dragon*.ray scenes will render in a fraction of the time that they did before 100+ seconds to ~15 seconds. 

- Multi-threading updates: In the last milestone, I implemented a naive multi-threading method that assigns each thread a set number of rows to render. I decided to implement two more ways to assign pixels to threads and tested each one with the same scene and parameters (dragon.ray, r=5, ss=1024). These can be seen in RayTracer::traceImage(). 

thread_func_1 average render time = 26.38 seconds
thread_func_2 average render time = 28.37 seconds
thread_func_3 average render time = 25.59 seconds

I decided to keep thread_func_3 as the default since it was the fastest. This function lets each thread access the next pixel to render using a mutex, meaning that some threads will render more pixels than others.

- Texture Mapping: Implemented correctly and works for all scene_part_2 scenes.

- Cube Mapping: Implemented correctly and works for all scenes and all cube maps.

- Creative Scenes: I have created 6 custom scenes that are contained in the folder "custom_scenes". For the three performace intensive scenes (super_box_grid.ray, super_poly_cube.ray, and super sphere_grid.ray), I used a simple python script to generate them. The other three scenes (normal_map_cube_*.ray) were created to showcase my normal map implementation.

- Normal Mapping: I implemented normal mapping by adding a new token to the parse called "normal". It reads in a texture map and adds it to a material as a material property. This can be seen in the normal_map_cube_*.ray files within the cube's material properties.

