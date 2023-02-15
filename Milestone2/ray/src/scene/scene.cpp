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

void Scene::add_bvh(MaterialSceneObject* obj, std::string type)
{
	// make sure object is not already in bvh_objects
	if (std::find(bvh_objects.begin(), bvh_objects.end(), obj) == bvh_objects.end())
	{
		obj->ComputeBoundingBox();
		obj->compute_centroid();
		// used to check that vector swaps were working
		//obj->insert_index = bvh_object_insert_index;
		//bvh_object_insert_index++;
		bvh_objects.push_back(obj);
		
		/*
		std::cout <<
			"added bvh object '" << type <<
			"' with centroid: " << obj->centroid <<
			" and bb: max" << obj->getBoundingBox().getMax() <<
			" min" << obj->getBoundingBox().getMin() << std::endl;
		*/
	}
}


// Get any intersection with an object.  Return information about the 
// intersection through the reference parameter.
bool Scene::intersect(ray& r, isect& i, bool only_bb) const {
	bool have_one = false;
	// ignore actual objects and only render BVH bounding boxes
	if (!only_bb)
	{
		for (const auto& obj : objects)
		{
			isect cur;
			if (obj->intersect(r, cur))
			{
				if (!have_one || (cur.getT() < i.getT()))
				{
					i = cur;
					have_one = true;
				}
			}
		}
	}
	// draw BVH bounding boxes (for bvh debugging)
	/*
	for (int j = 0; j < bvh_node_array.size(); j++)
	{
		BoundingBox bb = bvh_node_array.at(j).get()->bb;
		double tmin = 0;
		double tmax = 0;
		if (bb.intersect(r, tmin, tmax))
		{
			// set T
			i.setT(tmax);
			glm::dvec3 point = r.at(i);
			// determine normal vector 
			glm::dvec3 centroid = bb.getMax() - bb.getMin();
			glm::dvec3 out_vec = centroid - point;
			out_vec /= glm::max(glm::max(glm::abs(out_vec.x), glm::abs(out_vec.y)), glm::abs(out_vec.z)); // Greatest length
			glm::dvec3 norm = glm::normalize(glm::floor(glm::clamp(out_vec, 0.0, 1.0) * 1.0000001)); // Unit normal for hit
			i.setN(norm);

			// make bounding box material
			Material m;
			m.setDiffuse(glm::dvec3(0.1, 0.1, 0.4));
			m.setAmbient(glm::dvec3(0.1, 0.1, 0.1));
			m.setSpecular(glm::dvec3(0, 0, 0));
			m.setEmissive(glm::dvec3(0, 0, 0));
			m.setShininess(100);
			m.setTransmissive(glm::dvec3(0.75, 0.75, 0.75));
			i.setMaterial(m);
			have_one = true;
		}
	}
	*/

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

	// dont generate BVH if nothing in array
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
	// set root min and max aabb
	root->bb.setMin(sceneBounds.getMin());
	root->bb.setMax(sceneBounds.getMax());
	// subdivide recursively
	subdivide_node(root_index);

	std::cout << "bvh size: " << bvh_node_array.size() << std::endl;
}

void Scene::update_node_bounds(int node_index)
{
	BVH_node* node = bvh_node_array.at(node_index).get();
	node->bb.setMin(glm::dvec3(1e30f));
	node->bb.setMax(glm::dvec3(-1e30f));
	for (int first = node->first_prim, i = 0; i < node->prim_count; i++)
	{
		MaterialSceneObject* obj = bvh_objects.at(first + i);
		node->bb.merge(obj->getBoundingBox());
	}
	//std::cout << "updated node bounds -> node: " << node_index << ", aabb.min: " << node->aabb_min << ", aabb.max: " << node->aabb_max << std::endl;
}

void Scene::subdivide_node(int node_index)
{
	// get node and terminate reccursion once node contains one or zero prims
	BVH_node* node = bvh_node_array.at(node_index).get();
	if (node->prim_count <= 1) return;

	// determine axis and position of the split plane
	glm::dvec3 extent = node->bb.getMax() - node->bb.getMin();
	int axis = 0;
	if (extent.y > extent.x) axis = 1;
	if (extent.z > extent[axis]) axis = 2;
	double split_pos = node->bb.getMin()[axis] + extent[axis] * 0.5f;

	// split group in two halves
	int i = node->first_prim;
	int p_count = i + node->prim_count - 1;
	// TODO: better way to split into two groups
	// ? surface area heuristic
	while (i <= p_count)
	{
		if (bvh_objects.at(i)->centroid[axis] < split_pos)
		{
			i++;
		}
		else
		{
			//std::cout << "before swap -> bvh_objects[i]: " << bvh_objects.at(i)->insert_index << " bvh_objects[p_count]: " << bvh_objects.at(p_count)->insert_index << std::endl;
			iter_swap(bvh_objects.begin() + i, bvh_objects.begin() + p_count);
			//std::cout << "after swap -> bvh_objects[i]: " << bvh_objects.at(i)->insert_index << " bvh_objects[p_count]: " << bvh_objects.at(p_count)->insert_index << std::endl;
			p_count--;
		}
	}

	// return if count = 0 OR count = prism_count
	int left_count = i - node->first_prim;
	if (left_count == 0 || left_count == node->prim_count) return;
	// create child nodes for each half
	BVH_node* left_child = new BVH_node;
	BVH_node* right_child = new BVH_node;
	int left_child_index = used_nodes++;
	int right_child_index = used_nodes++;
	node->left_child = left_child_index;
	node->right_child = right_child_index;
	left_child->first_prim = node->first_prim;
	left_child->prim_count = left_count;
	right_child->first_prim = i;
	right_child->prim_count = node->prim_count - left_count;
	node->prim_count = 0;
	add_node(left_child);
	add_node(right_child);

	// continue building BVH recursively
	update_node_bounds(left_child_index);
	update_node_bounds(right_child_index);
	subdivide_node(left_child_index);
	subdivide_node(right_child_index);
}

bool Scene::intersect_BVH(ray& r, isect& i, const int node_index) const
{
	// get node and return if no intersection is detected, return false
	BVH_node* node = bvh_node_array.at(node_index).get();
	//std::cout << "intersecting BVH, node: " << node_index << " with " << node->prim_count << " nodes." << std::endl;
	double tmin = 0;
	double tmax = 0;
	if (!node->bb.intersect(r, tmin, tmax))
	{
		return false;
	}
	// check if node is a leaf node
	//std::cout << "node->prim_count: " << node->prim_count << std::endl;
	if (node->prim_count > 0)
	{
		//std::cout << "node->first_prim: " << node->first_prim << std::endl;
		//std::cout << "node->prim_count: " << node->prim_count << std::endl;
		bool have_one = false;
		for (int first = node->first_prim, j = 0; j < node->prim_count; j++)
		{
			isect cur;
			if (bvh_objects.at(first + j)->intersect(r, cur))
			{
				if (!have_one || (cur.getT() < i.getT()))
				{
					i = cur;
					have_one = true;
				}
			}
		}
		if (!have_one) i.setT(1000.0);
		// if debugging,
		if (TraceUI::m_debug)
		{
			addToIntersectCache(std::make_pair(new ray(r), new isect(i)));
		}
		return have_one;
	}

	// recursively check both child nodes
	isect left_i;
	isect right_i;
	bool left_hit = intersect_BVH(r, left_i, node->left_child);
	bool right_hit = intersect_BVH(r, right_i, node->right_child);
	

	// set i to be the lowest T value
	if (left_hit && right_hit)
	{
		if (left_i.getT() < right_i.getT())
			i = left_i;
		else
			i = right_i;
		return true;
	}
	else if (left_hit)
	{
		i = left_i;
		return true;
	}
	else if (right_hit)
	{
		i = right_i;
		return true;
	}
	else
	{
		i.setT(1000.0);
		return false;
	}
}