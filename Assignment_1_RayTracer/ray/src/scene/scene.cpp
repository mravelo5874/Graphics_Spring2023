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

void MaterialSceneObject::compute_centroid()
{
	BoundingBox bb = getBoundingBox();
	glm::dvec3 avg = (bb.getMax() + bb.getMin()) * 0.5;
	centroid = avg;
	std::cout << "centroid calculated: " << centroid << std::endl;
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

void Scene::add_node(BVH_node* node)
{
	bvh_node_array.emplace_back(node);
}

void Scene::add_bvh(MaterialSceneObject* obj)
{
	obj->compute_centroid();
	bvh_objects.push_back(obj);
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

/* N is the number of objects in the scene */
void Scene::generate_BVH()
{
	std::cout << "generating BVH..." << std::endl;
	std::cout << "bvh_objects.size(): " << bvh_objects.size() << std::endl;

	// dont generate BVH if noting in array
	if (bvh_objects.size() == 0)
	{
		BVH_node* root = new BVH_node;
		add_node(root);
		return;
	}
	

	BVH_node* root = new BVH_node;
	add_node(root);
	// initially assign all objects to root node
	root->left_child = root->right_child = 0;
	root->first_prim = 0;
	root->prim_count = bvh_objects.size();
	// update min and max aabb
	update_node_bounds(root_index);
	// subdivide recursively
	subdivide_node(root_index);

	std::cout << "bvh size: " << bvh_node_array.size() << std::endl;
}

void Scene::update_node_bounds(int node_index)
{
	BVH_node* node = bvh_node_array.at(node_index).get();
	node->aabb_min = glm::dvec3(1e30f);
	node->aabb_max = glm::dvec3(-1e30f);
	for (int first = node->first_prim, i = 0; i < node->prim_count; i++)
	{
		MaterialSceneObject* obj = bvh_objects.at(first + i);
		BoundingBox bb = obj->getBoundingBox();
		node->aabb_min = glm::min(node->aabb_min, bb.getMin());
		node->aabb_max = glm::max(node->aabb_max, bb.getMax());
	}
	//std::cout << "node: " << node_index << ", aabb.min: " << node->aabb_min << ", aabb.max: " << node->aabb_max << std::endl;
}

void Scene::subdivide_node(int node_index)
{
	// get node and terminate reccursion
	BVH_node* node = bvh_node_array.at(node_index).get();
	if (node->prim_count <= 1) return;

	// determine axis and position of the split plane
	glm::dvec3 extent = node->aabb_max - node->aabb_min;
	int axis = 0;
	if (extent.y > extent.x) axis = 1;
	if (extent.z > extent[axis]) axis = 2;
	double split_pos = node->aabb_min[axis] + extent[axis] * 0.5f;

	// split group in two halves
	int i = node->first_prim;
	int p_count = i + node->prim_count - 1;
	// TODO: better way to split into two groups
	// ? surface area heuristic
	while (i <= p_count)
	{
		if (bvh_objects.at(i)->centroid[axis] < split_pos)
			i++;
		else
			swap(bvh_objects.at(i), bvh_objects.at(p_count--));
	}

	// return if count = 0 OR count = prism_count
	int left_count = i - node->first_prim;
	if (left_count == 0 || left_count == node->prim_count) return;
	// create child nodes for each half
	BVH_node* left_child = new BVH_node;
	BVH_node* right_child = new BVH_node;
	add_node(left_child);
	add_node(right_child);
	int left_child_index = used_nodes++;
	int right_child_index = used_nodes++;
	node->left_child = left_child_index;
	node->right_child = right_child_index;
	left_child->first_prim = node->first_prim;
	left_child->prim_count = left_count;
	right_child->first_prim = i;
	right_child->prim_count = node->prim_count - left_count;
	node->prim_count = 0;

	// continue building BVH recursively
	update_node_bounds(left_child_index);
	update_node_bounds(right_child_index);
	subdivide_node(left_child_index);
	subdivide_node(right_child_index);
}

bool Scene::intersect_BVH(ray& r, isect& i, const int node_index)
{
	// get node and return if no intersection is detected, return false
	BVH_node* node = bvh_node_array.at(node_index).get();
	if (!intersect_aabb(r, i, node->aabb_min, node->aabb_max)) return false;
	// check if node is a leaf node
	std::cout << "node->prim_count: " << node->prim_count << std::endl;
	if (node->prim_count > 0)
	{
		std::cout << "hit bvh object!" << std::endl;
		bool have_one = false;
		isect cur;
		for (int j = node->first_prim; j < node->prim_count - 1; j++)
		{
			if (bvh_objects.at(j)->intersect(r, cur)) {
				if (!have_one || (cur.getT() < i.getT())) {
					i = cur;
					have_one = true;
				}
			}
		}
		if (!have_one)
			i.setT(1000.0);
		// if debugging,
		if (TraceUI::m_debug)
		{
			addToIntersectCache(std::make_pair(new ray(r), new isect(i)));
		}
		return have_one;
	}
	else
	{
		intersect_BVH(r, i, node->left_child);
		intersect_BVH(r, i, node->right_child);
	}
}

bool Scene::intersect_aabb(ray& r, isect& i, glm::dvec3 bbmin, glm::dvec3 bbmax)
{
	//std::cout << "aabb intersection!" << std::endl;

	glm::dvec3 rd = r.getDirection();
	glm::dvec3 ro = r.getPosition();
	double tx1 = (bbmin.x - ro.x) / rd.x;
	double tx2 = (bbmax.x - ro.x) / rd.x;
	double tmin = min(tx1, tx2);
	double tmax = max(tx1, tx2);
	double ty1 = (bbmin.y - ro.y) / rd.y;
	double ty2 = (bbmax.y - ro.y) / rd.y;
	tmin = max(tmin, min(ty1, ty2));
	tmax = min(tmax, max(ty1, ty2));
	double tz1 = (bbmin.z - ro.z) / rd.z;
	double tz2 = (bbmax.z - ro.z) / rd.z;
	tmin = max(tmin, min(tz1, tz2));
	tmax = min(tmax, max(tz1, tz2));
	return tmax >= tmin && tmin < i.getT() && tmax > 0;
}