Milestone 1 Submission by Marco Ravelo

No colaboration was done and all the code writen was by me. I apologize for turning in the
assignment in a day late. I will be using one of my three late days for this assignment.

All parts of the assignemnt are complete. There are some discrepancies when comparing to
the reference solution:
- I added threading to the rendering process. Renders should be significantly faster.
- Some scenes like "dragon2.ray" appear to have some speckles despite the other dragon
models looking correct.
- The scene "sphere_box.ray" will look extremely off at depths greater than 2.
- Some translucent scenes may look different, primarily "easy3.ray" and similar.
- My anti-aliasing is not very pretty, it just blurs the final image but it is implemented
correctly based on the instructions. It is performed after the image is completely rendered.