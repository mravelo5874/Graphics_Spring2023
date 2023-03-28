Assignment 3 Submission by Marco Ravelo
Date: 3/27/2023

No colaboration was done and all the code writen was by me.

All parts of the assignment are complete.

I implemented all required elements for this assignment including:
- bone picking using the mouse
- bone manupulation (rotation and roll)
- linear-blend skinning (done on the GPU)

Some notes about my implementations:

- When hovering over a bone, a hexagonal prism will appear around it to indicate that it is currently selected. You can press 'Z' or 'X' on your keyboard to decrease or increase the hexagonal's radius respectively. The prism should appear blue ('cyan') when simply hovering over it.

- In order to rotate a bone, left-click on it and move your mouse LEFT or RIGHT. The x-distance from where you clicked will determine the radians of rotation to apply to the bone. The rotation axis will always be the camera's forward vector. The hexagonal prism will change color to green when it is being manipulated.

- When hovering over a bone, you can press the left or right arrow keys to roll the bone in either direction.

- In order to facilitate debugging, I implemented a simple raycast system. You can press 'B' to shoot a raycast from the camera's eye in the forward direction. This ray will appear blue ('cyan'). Additionally, you can press 'V' to shoot a raycast from the mouse's screen position. This ray will appear pink.

