#include "material.h"
#include "../ui/TraceUI.h"
#include "light.h"
#include "ray.h"
extern TraceUI* traceUI;

#include <glm/gtx/io.hpp>
#include <iostream>
#include "../fileio/images.h"

using namespace std;
extern bool debugMode;

Material::~Material()
{
}

// Apply the phong model to this point on the surface of the object, returning
// the color of that point.
glm::dvec3 Material::shade(Scene* scene, const ray& r, const isect& i) const
{
	// YOUR CODE HERE

	// For now, this method just returns the diffuse color of the object.
	// This gives a single matte color for every distinct surface in the
	// scene, and that's it.  Simple, but enough to get you started.
	// (It's also inconsistent with the phong model...)

	// Your mission is to fill in this method with the rest of the phong
	// shading model, including the contributions of all the light sources.
	// You will need to call both distanceAttenuation() and
	// shadowAttenuation()
	// somewhere in your code in order to compute shadows and light falloff.
	//	if( debugMode )
	//		std::cout << "Debugging Phong code..." << std::endl;

	// When you're iterating through the lights,
	// you'll want to use code that looks something
	// like this:
	//
	// for ( const auto& pLight : scene->getAllLights() )
	// {
	//              // pLight has type unique_ptr<Light>
	// 		.
	// 		.
	// 		.
	// }
	return kd(i);
}

TextureMap::TextureMap(string filename)
{
	data = readImage(filename.c_str(), width, height);
	if (data.empty()) {
		width = 0;
		height = 0;
		string error("Unable to load texture map '");
		error.append(filename);
		error.append("'.");
		throw TextureMapException(error);
	}
	/*
	std::cout << "width: " << width << std::endl;
	std::cout << "height: " << height << std::endl;
	std::cout << "image data: " << data.size() << std::endl;
	*/
}

glm::dvec3 TextureMap::getMappedValue(const glm::dvec2& coord) const
{
	// In order to add texture mapping support to the
	// raytracer, you need to implement this function.
	// What this function should do is convert from
	// parametric space which is the unit square
	// [0, 1] x [0, 1] in 2-space to bitmap coordinates,
	// and use these to perform bilinear interpolation
	// of the values.

	double u = (double)(height - 1) * coord[1];
	double v = (double)(width - 1) * coord[0];

	double u_1 = glm::floor(u);
	double u_2 = glm::ceil(u);
	double v_1 = glm::floor(v);
	double v_2 = glm::ceil(v);

	double alpha = (u_2 - u) / (u_2 - u_1);
	double beta = (u - u_1) / (u_2 - u_1);
	double gamma = (v_2 - v) / (v_2 - v_1);
	double delta = (v - v_1) / (v_2 - v_1);

	glm::dvec3 a = getPixelAt((int)u_1, (int)v_1);
	glm::dvec3 b = getPixelAt((int)u_2, (int)v_1);
	glm::dvec3 c = getPixelAt((int)u_2, (int)v_2);
	glm::dvec3 d = getPixelAt((int)u_1, (int)v_2);

	glm::dvec3 val = (gamma * ((alpha * a) + (beta * b))) + (delta * ((alpha * d) + (beta * c)));
	glm::dvec3 ori = getPixelAt((int)u, (int)v);

	//std::cout << "ori: " << ori << " bilin: " << val << std::endl;
	return val;
}

glm::dvec3 TextureMap::getPixelAt(int x, int y) const
{
	// In order to add texture mapping support to the
	// raytracer, you need to implement this function.

	// clamp x and y to be between 0 and width/height respectively
	x = glm::clamp(x, 0, width - 1);
	y = glm::clamp(y, 0, height - 1);

	// data length = height * width * 3
	int start_index = ((width * x) + (y)) * 3;

	//std::cout << "x: " << x << " y: " << y << std::endl;
	//std::cout << "start pixel: " << start_pixel << std::endl;

	glm::dvec3 pixel(
		(double)data.at(start_index + 0) / 255.0,
		(double)data.at(start_index + 1) / 255.0,
		(double)data.at(start_index + 2) / 255.0
		);

	//std::cout << "pixel: " << pixel << std::endl;
	return pixel;
}

glm::dvec3 MaterialParameter::value(const isect& is) const
{
	if (0 != _textureMap)
		return _textureMap->getMappedValue(is.getUVCoordinates());
	else
		return _value;
}

double MaterialParameter::intensityValue(const isect& is) const
{
	if (0 != _textureMap) {
		glm::dvec3 value(
		        _textureMap->getMappedValue(is.getUVCoordinates()));
		return (0.299 * value[0]) + (0.587 * value[1]) +
		       (0.114 * value[2]);
	} else
		return (0.299 * _value[0]) + (0.587 * _value[1]) +
		       (0.114 * _value[2]);
}
