#include <cmath>
#include <iostream>

#include "light.h"
#include <glm/glm.hpp>
#include <glm/gtx/io.hpp>


using namespace std;

const double EPSILON = 0.000001;

double DirectionalLight::distanceAttenuation(const glm::dvec3& P) const
{
	// distance to light is infinite, so f(di) goes to 0.  Return 1.
	return 1.0;
}


glm::dvec3 DirectionalLight::shadowAttenuation(const ray& r, const glm::dvec3& p, const int depth) const
{	
	if (depth <= 0)
	{
		// return 1 because we will never reach the light
		return glm::dvec3(1.0);
	}

	// shoot ray from shadow point to light
	glm::dvec3 light_dir = getDirection(p);
	ray shadow_r(p, light_dir, glm::dvec3(1, 1, 1), ray::SHADOW);
	isect shadow_i;
	bool hit = scene->intersect(shadow_r, shadow_i);

	// you hit something! 
	if (hit)
	{
		// material of object hit
		const Material& m = shadow_i.getMaterial();

		// check if translucent
		if (!m.Trans())
		{
			// object is not translucent, therefore no light from light source can reach it
			return glm::dvec3(0.0);
		}
		else
		{
			// object is translucent!
			// send ray through object to calculate how much light gets through
			glm::dvec3 in_p = shadow_r.at(shadow_i);
			// get point slightly into the surface of intersection
			in_p = in_p + (light_dir * EPSILON);
			ray inside_r(in_p, light_dir, glm::dvec3(1, 1, 1), ray::SHADOW);
			isect inside_i;
			bool hit = scene->intersect(inside_r, inside_i);

			// you hit somthing!
			if (hit)
			{
				// make sure it is translucent
				const Material& m = shadow_i.getMaterial();
				if (!m.Trans())
				{
					// object is not translucent, therefore no light from light source can reach it
					return glm::dvec3(0.0);
				}
				else
				{
					glm::dvec3 out_p = inside_r.at(inside_i);
					// get point slightly out of the surface of intersection
					out_p = out_p + (light_dir * EPSILON);
					// calculate how much distance the ray traveled
					double dist = glm::distance(in_p, out_p);
					// return recursive shadow light * (kt)^dist
					// clamp between 0 and 1!
					return glm::clamp(glm::pow(m.kt(shadow_i), glm::dvec3(dist)) * shadowAttenuation(inside_r, out_p, depth - 1), 0.0, 1.0);
				}
			}
		}
	}

	// nothing blocking light - no need to calculate anything!
	return glm::dvec3(1.0);
}

glm::dvec3 DirectionalLight::getColor() const
{
	return color;
}

glm::dvec3 DirectionalLight::getDirection(const glm::dvec3& P) const
{
	return -orientation;
}

double PointLight::distanceAttenuation(const glm::dvec3& P) const
{
	// You'll need to modify this method to attenuate the intensity 
	// of the light based on the distance between the source and the 
	// point P.  For now, we assume no attenuation and just return 1.0
	
	double dist = glm::distance(P, position);
	double atten = glm::min(1.0, (1.0 / (constantTerm + (linearTerm * dist) + (quadraticTerm * glm::pow(dist, 2)))));
	atten = glm::clamp(atten, 0.0, 1.0);
	return atten;
}

glm::dvec3 PointLight::getColor() const
{
	return color;
}

glm::dvec3 PointLight::getDirection(const glm::dvec3& P) const
{
	return glm::normalize(position - P);
}

// 0 = fully shadowed and 1 = fully illuminated
glm::dvec3 PointLight::shadowAttenuation(const ray& r, const glm::dvec3& p, const int depth) const
{
	if (depth <= 0)
	{
		// return 0, did not reach light
		return glm::dvec3(0.0);
	}

	// shoot ray from shadow point to light
	glm::dvec3 light_dir = getDirection(p);
	ray shadow_r(p, light_dir, glm::dvec3(1, 1, 1), ray::SHADOW);
	isect shadow_i;
	bool hit = scene->intersect(shadow_r, shadow_i);

	// make sure intersection object is between light and this object
	glm::dvec3 object_to_light = getDirection(shadow_r.at(shadow_i));
	hit = glm::dot(light_dir, object_to_light) > 0.0;

	// you hit something! 
	if (hit)
	{
		// make sure it is translucent
		const Material& m = shadow_i.getMaterial();
		if (!m.Trans())
		{	
			// object is not translucent, therefore no light from light source can reach it
			return glm::dvec3(0.0);
		}
		else
		{
			// object is translucent!
			// send ray through object to calculate how much light gets through
			glm::dvec3 in_p = shadow_r.at(shadow_i);
			// get point slightly into the surface of intersection
			in_p = in_p + (light_dir * EPSILON);
			ray inside_r(in_p, light_dir, glm::dvec3(1, 1, 1), ray::SHADOW);
			isect inside_i;
			bool hit = scene->intersect(inside_r, inside_i);
			
			// make sure intersection object is between light and this object
			glm::dvec3 object_to_light = getDirection(inside_r.at(inside_i));
			hit = glm::dot(light_dir, object_to_light) > 0.0;

			// you hit somthing!
			if (hit)
			{
				// make sure it is translucent
				const Material& m = shadow_i.getMaterial();
				if (!m.Trans())
				{
					// object is not translucent, therefore no light from light source can reach it
					return glm::dvec3(0.0);
				}
				else
				{
					glm::dvec3 out_p = inside_r.at(inside_i);
					// get point slightly out of the surface of intersection
					out_p = out_p + (light_dir * EPSILON);
					// calculate how much distance the ray traveled
					double dist = glm::distance(in_p, out_p);
					// return recursive shadow light * (kt)^dist
					// clamp between 0 and 1!
					return glm::clamp(glm::pow(m.kt(shadow_i), glm::dvec3(dist)) * shadowAttenuation(inside_r, out_p, depth - 1), 0.0, 1.0);
				}
			}
		}
	}

	// nothing blocking light - no need to calculate anything!
	return glm::dvec3(1.0);
}

#define VERBOSE 0
