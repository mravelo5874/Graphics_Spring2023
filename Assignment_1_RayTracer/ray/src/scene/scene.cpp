#include <cmath>

#include "scene.h"
#include "light.h"
#include "kdTree.h"
#include "../ui/TraceUI.h"
#include <glm/gtx/extended_min_max.hpp>
#include <iostream>
#include <glm/gtx/io.hpp>

using namespace std;

bool Geometry::intersect(ray& r, isect& i) const {
	double tmin, tmax;
	if (hasBoundingBoxCapability() && !(bounds.intersect(r, tmin, tmax))) return false;
	// Transform the ray into the object's local coordinate space
	glm::dvec3 pos = transform->globalToLocalCoords(r.getPosition());
	glm::dvec3 dir = transform->globalToLocalCoords(r.getPosition() + r.getDirection()) - pos;
	double length = glm::length(dir);
	dir = glm::normalize(dir);
	// Backup World pos/dir, and switch to local pos/dir
	glm::dvec3 Wpos = r.getPosition();
	glm::dvec3 Wdir = r.getDirection();
	r.setPosition(pos);
	r.setDirection(dir);
	bool rtrn = false;
	if (intersectLocal(r, i))
	{
		// Transform the intersection point & normal returned back into global space.
		i.setN(transform->localToGlobalCoordsNormal(i.getN()));
		i.setT(i.getT()/length);
		rtrn = true;
	}
	// Restore World pos/dir
	r.setPosition(Wpos);
	r.setDirection(Wdir);
	return rtrn;
}

bool Geometry::hasBoundingBoxCapability() const {
	// by default, primitives do not have to specify a bounding box.
	// If this method returns true for a primitive, then either the ComputeBoundingBox() or
    // the ComputeLocalBoundingBox() method must be implemented.

	// If no bounding box capability is supported for an object, that object will
	// be checked against every single ray drawn.  This should be avoided whenever possible,
	// but this possibility exists so that new primitives will not have to have bounding
	// boxes implemented for them.
	return false;
}

void Geometry::ComputeBoundingBox() {
    // take the object's local bounding box, transform all 8 points on it,
    // and use those to find a new bounding box.

    BoundingBox localBounds = ComputeLocalBoundingBox();
        
    glm::dvec3 min = localBounds.getMin();
    glm::dvec3 max = localBounds.getMax();

    glm::dvec4 v, newMax, newMin;

    v = transform->localToGlobalCoords( glm::dvec4(min[0], min[1], min[2], 1) );
    newMax = v;
    newMin = v;
    v = transform->localToGlobalCoords( glm::dvec4(max[0], min[1], min[2], 1) );
    newMax = glm::max(newMax, v);
    newMin = glm::min(newMin, v);
    v = transform->localToGlobalCoords( glm::dvec4(min[0], max[1], min[2], 1) );
    newMax = glm::max(newMax, v);
    newMin = glm::min(newMin, v);
    v = transform->localToGlobalCoords( glm::dvec4(max[0], max[1], min[2], 1) );
    newMax = glm::max(newMax, v);
    newMin = glm::min(newMin, v);
    v = transform->localToGlobalCoords( glm::dvec4(min[0], min[1], max[2], 1) );
    newMax = glm::max(newMax, v);
    newMin = glm::min(newMin, v);
    v = transform->localToGlobalCoords( glm::dvec4(max[0], min[1], max[2], 1) );
    newMax = glm::max(newMax, v);
    newMin = glm::min(newMin, v);
    v = transform->localToGlobalCoords( glm::dvec4(min[0], max[1], max[2], 1) );
    newMax = glm::max(newMax, v);
    newMin = glm::min(newMin, v);
    v = transform->localToGlobalCoords( glm::dvec4(max[0], max[1], max[2], 1) );
    newMax = glm::max(newMax, v);
    newMin = glm::min(newMin, v);
		
    bounds.setMax(glm::dvec3(newMax));
    bounds.setMin(glm::dvec3(newMin));
}

Scene::Scene()
{
	ambientIntensity = glm::dvec3(0, 0, 0);
}

Scene::~Scene()
{
}

void Scene::add(Geometry* obj) {
	obj->ComputeBoundingBox();
	sceneBounds.merge(obj->getBoundingBox());
	objects.emplace_back(obj);
}

void Scene::add(Light* light)
{
	lights.emplace_back(light);
}


// Get any intersection with an object.  Return information about the 
// intersection through the reference parameter.
bool Scene::intersect(ray& r, isect& i) const {
	double tmin = 0.0;
	double tmax = 0.0;
	bool have_one = false;
	for(const auto& obj : objects) {
		isect cur;
		if( obj->intersect(r, cur) ) {
			if(!have_one || (cur.getT() < i.getT())) {
				i = cur;
				have_one = true;
			}
		}
	}
	if(!have_one)
		i.setT(1000.0);
	// if debugging,
	if (TraceUI::m_debug)
	{
		addToIntersectCache(std::make_pair(new ray(r), new isect(i)));
	}
	return have_one;
}

TextureMap* Scene::getTexture(string name) {
	auto itr = textureCache.find(name);
	if (itr == textureCache.end()) {
		textureCache[name].reset(new TextureMap(name));
		return textureCache[name].get();
	}
	return itr->second.get();
}

// code for BVH generation created by following tutorial:
// https://jacco.ompf2.com/2022/04/13/how-to-build-a-bvh-part-1-basics/
struct BVH_node
{
	glm::dvec3 aabb_min, aabb_max;
	int left_child, right_child;
	int first_prim, prim_count;
};

/* N is the number of objects in the scene */
void Scene::generate_BVH()
{
	// create bvh node array
	bvh_node_array = new BVH_node[objects.size()];
	// initially assign all objects to root node
	BVH_node& root = bvh_node_array[root_index];
	root.left_child = root.right_child = 0;
	root.first_prim = 0;
	root.prim_count = objects.size();
	// update min and max aabb
	update_node_bounds(root_index);
	// subdivide recursively
	subdivide_bvh(root_index);
}

void Scene::update_node_bounds(int node_index)
{
	BVH_node& node = bvh_node_array[node_index];
	node.aabb_min = glm::dvec3(1e30f);
	node.aabb_max = glm::dvec3(-1e30f);
	for (int first = node.first_prim, i = 0; i < node.prim_count; i++)
	{
		Geometry* obj = objects.at(first + i).get();
		BoundingBox bb = obj->getBoundingBox();
		node.aabb_min = glm::min(node.aabb_min, bb.getMin());
		node.aabb_max = glm::max(node.aabb_max, bb.getMax());
	}
}

void Scene::subdivide_bvh(int node_index)
{
	// determine axis and position of the split plane
	BVH_node& node = bvh_node_array[node_index];
	glm::dvec3 extent = node.aabb_max - node.aabb_min;
	int axis = 0;
	if (extent.y > extent.x) axis = 1;
	if (extent.z > extent[axis]) axis = 2;
	double split_pos = node.aabb_min[axis] + extent[axis] * 0.5f;

	// TODO: cont this
}