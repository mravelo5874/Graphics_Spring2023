#include "cubeMap.h"
#include "ray.h"
#include "../ui/TraceUI.h"
#include "../scene/material.h"
#include <iostream>
extern TraceUI* traceUI;


glm::dvec3 CubeMap::getColor(ray r) const
{
	// YOUR CODE HERE
	
	// determine which face the ray will hit and get UV coords
	glm::dvec3 dir = glm::normalize(r.getDirection());
	glm::dvec3 abs_dir = glm::abs(dir);
	int tm_index = 0;
	double ma = 0.0;
	glm::dvec2 uv(0.0);

	// x, y, z
	if (abs_dir.z >= abs_dir.x && abs_dir.z >= abs_dir.y)
	{
		tm_index = dir.z < 0.0 ? 4 : 5;
		ma = 0.5 / abs_dir.z;
		uv = glm::dvec2(dir.z < 0.0 ? dir.x : -dir.x, dir.y);
	}
	else if (abs_dir.y >= abs_dir.x)
	{
		tm_index = dir.y < 0.0 ? 3 : 2;
		ma = 0.5 / abs_dir.y;
		uv = glm::dvec2(dir.x, dir.y < 0.0 ? -dir.z : dir.z);
	}
	else
	{
		tm_index = dir.x < 0.0 ? 1 : 0;
		ma = 0.5 / abs_dir.x;
		uv = glm::dvec2(dir.x < 0.0 ? -dir.z : dir.z, dir.y);
	}

	uv = uv * ma + 0.5;

	// swap axis
	//uv = glm::dvec2(uv[1], uv[0]);

	//std::cout << "tm_index: " << tm_index << std::endl;
	//std::cout << "uv: " << uv.x << ", " << uv.y << std::endl;

	return tMap[tm_index]->getMappedValue(uv);
}

CubeMap::CubeMap()
{
}

CubeMap::~CubeMap()
{
}

void CubeMap::setNthMap(int n, TextureMap* m)
{
	if (m != tMap[n].get())
		tMap[n].reset(m);
}
