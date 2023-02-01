#include "trimesh.h"
#include <assert.h>
#include <float.h>
#include <string.h>
#include <algorithm>
#include <cmath>
#include "../ui/TraceUI.h"
#include <iostream>
extern TraceUI* traceUI;

using namespace std;

Trimesh::~Trimesh()
{
	for (auto m : materials)
		delete m;
	for (auto f : faces)
		delete f;
}

// must add vertices, normals, and materials IN ORDER
void Trimesh::addVertex(const glm::dvec3& v)
{
	vertices.emplace_back(v);
}

void Trimesh::addMaterial(Material* m)
{
	materials.emplace_back(m);
}

void Trimesh::addNormal(const glm::dvec3& n)
{
	normals.emplace_back(n);
}

// Returns false if the vertices a,b,c don't all exist
bool Trimesh::addFace(int a, int b, int c)
{
	int vcnt = vertices.size();

	if (a >= vcnt || b >= vcnt || c >= vcnt)
		return false;

	TrimeshFace* newFace = new TrimeshFace(
	        scene, new Material(*this->material), this, a, b, c);
	newFace->setTransform(this->transform);
	if (!newFace->degen)
		faces.push_back(newFace);
	else
		delete newFace;

	// Don't add faces to the scene's object list so we can cull by bounding
	// box
	return true;
}

// Check to make sure that if we have per-vertex materials or normals
// they are the right number.
const char* Trimesh::doubleCheck()
{
	if (!materials.empty() && materials.size() != vertices.size())
		return "Bad Trimesh: Wrong number of materials.";
	if (!normals.empty() && normals.size() != vertices.size())
		return "Bad Trimesh: Wrong number of normals.";

	return 0;
}

bool Trimesh::intersectLocal(ray& r, isect& i) const
{
	bool have_one = false;
	for (auto face : faces) {
		isect cur;
		if (face->intersectLocal(r, cur)) {
			if (!have_one || (cur.getT() < i.getT())) {
				i = cur;
				have_one = true;
			}
		}
	}
	if (!have_one)
		i.setT(1000.0);
	return have_one;
}

bool TrimeshFace::intersect(ray& r, isect& i) const
{
	return intersectLocal(r, i);
}

// Intersect ray r with the triangle abc.  If it hits returns true,
// and put the parameter in t and the barycentric coordinates of the
// intersection in u (alpha) and v (beta).
bool TrimeshFace::intersectLocal(ray& r, isect& i) const
{
	// get imporntant points and vectors for calculations
	glm::dvec3 a_coords = parent->vertices[ids[0]];
	glm::dvec3 b_coords = parent->vertices[ids[1]];
	glm::dvec3 c_coords = parent->vertices[ids[2]];
	glm::dvec3 n = glm::cross(b_coords - a_coords, c_coords - a_coords);
	n = glm::normalize(n);
	glm::dvec3 q = a_coords;
	glm::dvec3 v = r.getDirection();
	glm::dvec3 o = r.getPosition();

	double denom = glm::dot(v, n);
	// if dot(v, n) is 0, ray and plane are parallel
	if (denom == 0)
	{
		return false;
	}

	double t = glm::dot((q - o), n) / denom;
	// if t is negative, plane is behind ray
	if (t < 0)
	{
		return false;
	}

	// set t for intersection and get point p on plane
	i.setT(t);
	glm::dvec3 p = r.at(i);

	double ab = glm::dot(glm::cross((b_coords - a_coords), (p - a_coords)), n);
	double bc = glm::dot(glm::cross((c_coords - b_coords), (p - b_coords)), n);
	double ca = glm::dot(glm::cross((a_coords - c_coords), (p - c_coords)), n);

	if (ab >= 0 && bc >= 0 && ca >= 0)
	{
		glm::mat2 m1(1.0);
		m1[0][0] = glm::dot((b_coords - a_coords), (b_coords - a_coords));
		m1[0][1] = glm::dot((c_coords - a_coords), (b_coords - a_coords));
		m1[1][0] = glm::dot((b_coords - a_coords), (c_coords - a_coords));
		m1[1][1] = glm::dot((c_coords - a_coords), (c_coords - a_coords));
		// perform linear algebra
		glm::vec2 m2(glm::dot((p - a_coords), (b_coords - a_coords)), glm::dot((p - a_coords), (c_coords - a_coords)));
		glm::vec2 bary = glm::inverse(m1) * m2;
		// get barycentric coordinates
		double bary_coord_a = bary.x;
		double bary_coord_b = bary.y;
		double bary_coord_c = 1 - bary.x - bary.y;
		// set i values
		i.setUVCoordinates(bary);
		i.setMaterial(this->getMaterial());
		i.setMaterial(parent->getMaterial());
		i.setN(n);
		// using barycentric coordinates, 
		// determine phong interpolation of normal of intersection (only for meshes w/ per-vertex normals)
		if (parent->vertNorms)
		{
			// get per-vertex normals
			glm::dvec3 a_norm = parent->normals[ids[1]];
			glm::dvec3 b_norm = parent->normals[ids[2]];
			glm::dvec3 c_norm = parent->normals[ids[0]];
			// compute interpolated normal
			glm::dvec3 inter_norm = (a_norm * bary_coord_a) + (b_norm * bary_coord_b) + (c_norm * bary_coord_c);
			inter_norm = glm::normalize(inter_norm);
			i.setN(inter_norm);
		}
		// as well as interpolation of material (without renormalization) (only for meshes w/ per-vertex materials)
		if (parent->materials.size() > 2)
		{
			// get per-vertex material
			Material* a_mat = parent->materials[ids[1]];
			Material* b_mat = parent->materials[ids[2]];
			Material* c_mat = parent->materials[ids[0]];
			// compute interpolated material
			Material inter_mat;
			inter_mat.setEmissive((a_mat->ke(i) * bary_coord_a) + (b_mat->ke(i) * bary_coord_b) + (c_mat->ke(i) * bary_coord_c));
			inter_mat.setAmbient((a_mat->ka(i) * bary_coord_a) + (b_mat->ka(i) * bary_coord_b) + (c_mat->ka(i) * bary_coord_c));
			inter_mat.setSpecular((a_mat->ks(i) * bary_coord_a) + (b_mat->ks(i) * bary_coord_b) + (c_mat->ks(i) * bary_coord_c));
			inter_mat.setDiffuse((a_mat->kd(i) * bary_coord_a) + (b_mat->kd(i) * bary_coord_b) + (c_mat->kd(i) * bary_coord_c));
			inter_mat.setReflective((a_mat->kr(i) * bary_coord_a) + (b_mat->kr(i) * bary_coord_b) + (c_mat->kr(i) * bary_coord_c));
			inter_mat.setTransmissive((a_mat->kt(i) * bary_coord_a) + (b_mat->kt(i) * bary_coord_b) + (c_mat->kt(i) * bary_coord_c));
			inter_mat.setIndex((a_mat->index(i) * bary_coord_a) + (b_mat->index(i) * bary_coord_b) + (c_mat->index(i) * bary_coord_c));
			inter_mat.setShininess((a_mat->shininess(i) * bary_coord_a) + (b_mat->shininess(i) * bary_coord_b) + (c_mat->shininess(i) * bary_coord_c));
			i.setMaterial(inter_mat);
		}
		return true;
	}
	return false;
}

// Once all the verts and faces are loaded, per vertex normals can be
// generated by averaging the normals of the neighboring faces.
void Trimesh::generateNormals()
{
	int cnt = vertices.size();
	normals.resize(cnt);
	std::vector<int> numFaces(cnt, 0);

	for (auto face : faces) {
		glm::dvec3 faceNormal = face->getNormal();

		for (int i = 0; i < 3; ++i) {
			normals[(*face)[i]] += faceNormal;
			++numFaces[(*face)[i]];
		}
	}

	for (int i = 0; i < cnt; ++i) {
		if (numFaces[i])
			normals[i] /= numFaces[i];
	}

	vertNorms = true;
}

