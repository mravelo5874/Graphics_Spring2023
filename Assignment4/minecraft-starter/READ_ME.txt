Assignment 4 Submission by Marco Ravelo
Date: 4/10/2023

No collaboration was done and all the code written was by me.

All parts of the assignment are complete.

I implemented all required elements for this assignment (plus extra features) including:
- terrain synthesis
- procedural textures
- fps controls
- extra features are listed at the end of this doc

Here are the controls:
- use 'WASD' to move the player
- use 'SPACE' to jump 
- hold the 'left mouse button' and drag to rotate the camera
- hold the 'right mouse button' on a block to mine it (will detail in extra features section)
- press 'c' to toggle creative mode on or off (this is useful for getting around quickly and allows the player to no-clip through all objects)

The player is automatically able to walk up blocks. This makes exploring the landscape much easier.

Additionally, I added some simple HUD elements which display fps, player position, and current chunk, and some terrain generation parameters (will explain in the next section). 


***Some notes about my implementations***:
- I have worked with perlin noise terrain generation in the past using Unity. Here is my repository for that project from 4 years ago (https://github.com/mravelo5874/PerlinNoiseTerrainGenerator). Because of this, I implemented my perlin noise somewhat differently. I added two parameters that affect how the noise patch is calculated, that being persistence and lacunarity. Lacunarity determines how much detail is added at each octave (changes the frequency), and persistence determines how much each octave contributes to the overall result (changes the amplitude). I found this article which explains this much better than I have(https://medium.com/@yvanscher/playing-with-perlin-noise-generating-realistic-archipelagos-b59f004d8401). Additionally, I added an offset parameter (offset each octave at variable speeds), a scale parameter (scales the size of the noise patch), and a height parameter (height that the terrain can reach). I added some controls which allow you to change all these parameters at run-time to see the effects each has on the terrain generation:

- hold 'left alt' and press '-' or '+' to change the height
- hold 'left alt' and press 'o' or 'p' to change the persistence
- hold 'left alt' and press 'k' or 'l' to change the lacunarity
- hold 'left alt' and press 'n' or 'm' to change the scale

Keep in mind that this will affect the frame rate for a short moment, so I would recommend just tapping the buttons instead of holding them down. Changing the terrain significantly from the default might cause unexpected results such as fps drops, missing blocks in the terrain, and unexpected player movement. If any of this happens just refresh the page to return to default.

Here are some interesting combinations that I found:

- default terrain:	(scale: 75, height: 24, persistence: 0.10, lacunarity: 5.00)
- spiky mountains:	(scale: 60, height: 30, persistence: 0.60, lacunarity: 3.60)
- archipelagos:		(scale: 40, height: 20, persistance:-0.70, lacunarity: 0.00)
- mud-and-ice: 		(scale: 35, height: 20, persistance: 1.00, lacunarity: 0.00)
- rolling-hills:	(scale: 125,height:  8, persistance: 0.00, lacunarity: 0.00)
- fps-killer:		(scale: 75, height: 35, persistance: 1.00, lacunarity: 6.50)

- There are 8 different types of blocks: snow, stone, dirt, grass[0-3], and sand. The type of block is determined based on its y position. I also added some blending between layers to stylize the terrain. You will see streaks of blocks in the landscape when blending between layers. This was done on purpose because I thought it looked cool.
- Each block uses perlin noise to procedurally-generate its texture. I really liked how they all turned out, especially the stone, grass, and sand blocks.
- glitch-cubes: On rare occasions, my block shader will assign two block types to a single block, giving it a static-like appearance. I decided to leave it in since it is very rare and looks pretty cool.


***EXTRA FEATURES***:
- mining: You are able to destroy blocks in the world by pressing the right mouse button. If a block is in range, it will be outlined in red when holding the mouse button. This means you are currently mining that block. After some time (set to 250 milliseconds), the block will be destroyed and the outline will turn green. Destroying blocks will not create holes in the terrain which would allow the player to fall through the map. Instead, new blocks are created, giving the illusion of solid terrain and underground blocks. You can more easily see this if you mine some blocks into a mountain and then use creative mode to no-clip into the mountain to see the new blocks that were spawned in. (keep in mind that if you update the terrain generation, it will remove any changes you have made to the landscape)

- chunk saving/loading: When mining blocks, the chunk is able to keep track of any changes you have made. This means that if you mine some blocks, move to a different chunk (unloading the original chunk), and return to the original chunk, the blocks you mined will not be re-generated. (keep in mind that if you update the terrain generation, it will remove any changes you have made to the landscape)

- water: I added a simple water level at y=-30. It does not use reflections as stated in the milestone optional features section. Instead, I use some stylized perlin noise to add some movement to the water, giving the illusion of waves, specular highlights, and cloud reflections. Also, when not in creative mode, you are able to float in the water.
