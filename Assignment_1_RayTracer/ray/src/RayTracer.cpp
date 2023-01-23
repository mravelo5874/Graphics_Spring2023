// The main ray tracer.

#pragma warning (disable: 4786)

#include "RayTracer.h"
#include "scene/light.h"
#include "scene/material.h"
#include "scene/ray.h"

#include "parser/Tokenizer.h"
#include "parser/Parser.h"

#include "ui/TraceUI.h"
#include <cmath>
#include <algorithm>
#include <glm/glm.hpp>
#include <glm/gtx/io.hpp>
#include <string.h> // for memset

#include <iostream>
#include <fstream>
#include <thread>
#include <mutex>

using namespace std;
extern TraceUI* traceUI;

// Use this variable to decide if you want to print out
// debugging messages.  Gets set in the "trace single ray" mode
// in TraceGLWindow, for example.
bool debugMode = true;

// Trace a top-level ray through pixel(i,j), i.e. normalized window coordinates (x,y),
// through the projection plane, and out into the scene.  All we do is
// enter the main ray-tracing method, getting things started by plugging
// in an initial ray weight of (0.0,0.0,0.0) and an initial recursion depth of 0.

glm::dvec3 RayTracer::trace(double x, double y)
{
	// Clear out the ray cache in the scene for debugging purposes,
	if (TraceUI::m_debug)
	{
		scene->clearIntersectCache();		
	}

	ray r(glm::dvec3(0,0,0), glm::dvec3(0,0,0), glm::dvec3(1,1,1), ray::VISIBILITY);
	scene->getCamera().rayThrough(x,y,r);
	double dummy;
	glm::dvec3 ret = traceRay(r, glm::dvec3(1.0,1.0,1.0), traceUI->getDepth(), dummy);
	ret = glm::clamp(ret, 0.0, 1.0);
	return ret;
}

glm::dvec3 RayTracer::tracePixel(int i, int j)
{
	glm::dvec3 col(0,0,0);

	if( ! sceneLoaded() ) return col;

	double x = double(i)/double(buffer_width);
	double y = double(j)/double(buffer_height);

	unsigned char *pixel = buffer.data() + ( i + j * buffer_width ) * 3;
	col = trace(x, y);

	pixel[0] = (int)( 255.0 * col[0]);
	pixel[1] = (int)( 255.0 * col[1]);
	pixel[2] = (int)( 255.0 * col[2]);
	return col;
}

#define VERBOSE 0

// Do recursive ray tracing!  You'll want to insert a lot of code here
// (or places called from here) to handle reflection, refraction, etc etc.
glm::dvec3 RayTracer::traceRay(ray& r, const glm::dvec3& thresh, int depth, double& t)
{
	// return (0, 0, 0) if at max depth
	if (depth >= traceUI->getMaxDepth())
	{
		return glm::dvec3(0, 0, 0);
	}

	isect i;
	glm::dvec3 colorC;

#if VERBOSE
	std::cerr << "== current depth: " << depth << std::endl;
#endif

	if(scene->intersect(r, i)) 
	{
		// YOUR CODE HERE

		// An intersection occurred!  We've got work to do.  For now,
		// this code gets the material for the surface that was intersected,
		// and asks that material to provide a color for the ray.

		// This is a great place to insert code for recursive ray tracing.
		// Instead of just returning the result of shade(), add some
		// more steps: add in the contributions from reflected and refracted
		// rays.

		// intersection point
		glm::dvec3 inter_p = r.at(i);

		// material of object hit
		const Material& m = i.getMaterial();

		// calculate important vectors
		glm::dvec3 in_vec = r.getDirection();
		glm::dvec3 out_vec = in_vec * -1.0;
		glm::dvec3 norm_vec = i.getN();
		glm::dvec3 refl_vec = glm::reflect(in_vec, norm_vec); // 2.0 * glm::dot(out_vec, norm_vec) * (norm_vec - out_vec);
		glm::dvec3 refra_vec = glm::refract(in_vec, norm_vec, m.index(i));

		// total light contribution
		glm::dvec3 total_I_phong(0, 0, 0);

		// for each light l, shoot shadow ray from intersection point i to l
		int total_lights = scene->getAllLights().size();
		for (int l = 0; l < total_lights; l++)
		{
			// get direction of light
			glm::dvec3 light_vec = scene->getAllLights()[l].get()->getDirection(inter_p);

			// calculate ambient term
			glm::dvec3 I_ambient = m.ka(i) * scene->ambient();

			// shoot shadow ray and check for intersection w/ objects
			ray light_r(inter_p, light_vec, glm::dvec3(1, 1, 1), ray::SHADOW);
			isect shadow_i;
			if (!scene->intersect(light_r, shadow_i))
			{
				// calculate diffuse term (nothing blocking light)
				// I_d = kd * abs(dot(l, n)) * I_in
				double dot_abs_result = abs(glm::dot(light_vec, norm_vec));
				glm::dvec3 I_diffuse = m.kd(i) * dot_abs_result;
				
				// calculate specular term
				// I_s = ks * max(dot(v, r), 0)^alpha * I_in
				double dot_result = glm::dot(in_vec, refl_vec);
				double max_result = max(dot_result, 0.0);
				double pow_result = pow(max_result, m.shininess(i));
				glm::dvec3 I_specular = m.ks(i) * pow_result;

				// calculate light contribution
				// I = I_ambient + [I_diffuse + I_specular] * I_in
				glm::dvec3 light_color = scene->getAllLights()[l].get()->getColor();
				glm::dvec3 I_phong = I_ambient + ((I_diffuse + I_specular) * light_color); 
				total_I_phong += I_phong;
			}
		}

		// shoot reflective ray
		ray ref_r(inter_p, refl_vec, glm::dvec3(1, 1, 1), ray::REFLECTION);
		glm::dvec3 ref_color = traceRay(ref_r, thresh, depth + 1, t);
		glm::dvec3 I_ref = m.kr(i) * ref_color;

		// shoot transmissive ray
		
		// get color of object's matrial at intersection i
		glm::dvec3 mat_color = m.shade(scene.get(), r, i);
		// add total light contributiuon and reflected light
		colorC = mat_color + total_I_phong + I_ref;
	} 
	else 
	{
		// No intersection.  This ray travels to infinity, so we color
		// it according to the background color, which in this (simple) case
		// is just black.
		//
		// FIXME: Add CubeMap support here.
		// TIPS: CubeMap object can be fetched from traceUI->getCubeMap();
		//       Check traceUI->cubeMap() to see if cubeMap is loaded
		//       and enabled.

		colorC = glm::dvec3(0.0, 0.0, 0.0);
	}
#if VERBOSE
	std::cerr << "== depth: " << depth+1 << " done, returning: " << colorC << std::endl;
#endif
	return colorC;
}

RayTracer::RayTracer()
	: scene(nullptr), buffer(0), thresh(0), buffer_width(0), buffer_height(0), m_bBufferReady(false)
{
}

RayTracer::~RayTracer()
{
}

void RayTracer::getBuffer( unsigned char *&buf, int &w, int &h )
{
	buf = buffer.data();
	w = buffer_width;
	h = buffer_height;
}

double RayTracer::aspectRatio()
{
	return sceneLoaded() ? scene->getCamera().getAspectRatio() : 1;
}

bool RayTracer::loadScene(const char* fn)
{
	ifstream ifs(fn);
	if( !ifs ) {
		string msg( "Error: couldn't read scene file " );
		msg.append( fn );
		traceUI->alert( msg );
		return false;
	}

	// Strip off filename, leaving only the path:
	string path( fn );
	if (path.find_last_of( "\\/" ) == string::npos)
		path = ".";
	else
		path = path.substr(0, path.find_last_of( "\\/" ));

	// Call this with 'true' for debug output from the tokenizer
	Tokenizer tokenizer( ifs, false );
	Parser parser( tokenizer, path );
	try {
		scene.reset(parser.parseScene());
	}
	catch( SyntaxErrorException& pe ) {
		traceUI->alert( pe.formattedMessage() );
		return false;
	} catch( ParserException& pe ) {
		string msg( "Parser: fatal exception " );
		msg.append( pe.message() );
		traceUI->alert( msg );
		return false;
	} catch( TextureMapException e ) {
		string msg( "Texture mapping exception: " );
		msg.append( e.message() );
		traceUI->alert( msg );
		return false;
	}

	if (!sceneLoaded())
		return false;

	return true;
}

void RayTracer::traceSetup(int w, int h)
{
	size_t newBufferSize = w * h * 3;
	if (newBufferSize != buffer.size()) {
		bufferSize = newBufferSize;
		buffer.resize(bufferSize);
	}
	buffer_width = w;
	buffer_height = h;
	std::fill(buffer.begin(), buffer.end(), 0);
	m_bBufferReady = true;

	/*
	 * Sync with TraceUI
	 */
	// set none of the render vectors to be done
	thread_done.clear();

	num_threads = traceUI->getThreads();
	block_size = traceUI->getBlockSize();
	thresh = traceUI->getThreshold();
	samples = traceUI->getSuperSamples();
	aaThresh = traceUI->getAaThreshold();

	// YOUR CODE HERE
	// FIXME: Additional initializations
}

void RayTracer::thread_function(int thread_id, int start_row, int end_row, int row_len)
{
	// trace each pixel from start to end row
	for (int y = start_row; y < end_row; y++)
	{
		for (int x = 0; x < row_len; x++)
		{
			tracePixel(x, y);
		}
	}
	// signal that this thread is done (must be in mutex)
	mtx.lock();
	thread_done.push_back(thread_id);
	mtx.unlock();
}

/*
 * RayTracer::traceImage
 *
 *	Trace the image and store the pixel data in RayTracer::buffer.
 *
 *	Arguments:
 *		w:	width of the image buffer
 *		h:	height of the image buffer
 *
 */
void RayTracer::traceImage(int w, int h)
{
	// Always call traceSetup before rendering anything.
	traceSetup(w,h);

	// YOUR CODE HERE
	// FIXME: Start one or more threads for ray tracing
	//
	// TIPS: Ideally, the traceImage should be executed asynchronously,
	//       i.e. returns IMMEDIATELY after working threads are launched.
	//
	//       An asynchronous traceImage lets the GUI update your results
	//       while rendering.

	// determine how many rows per thread + remainder rows
	int rows_per_thread = h / num_threads;
	int row_rem = h % num_threads;

	// start x threads to trace image rows
	for (int t_id = 0; t_id < num_threads; t_id++)
	{
		// designate start and end rows for each thread
		int start_row = rows_per_thread * t_id;
		int end_row = start_row + rows_per_thread;
		// add remainder rows if last thread
		if (t_id == num_threads - 1)
		{
			end_row += row_rem;
		}

		// start thread
		threads.push_back(std::thread(&RayTracer::thread_function, this, t_id, start_row, end_row, w));
	}
}

int RayTracer::aaImage()
{
	// YOUR CODE HERE
	// FIXME: Implement Anti-aliasing here
	//
	// TIP: samples and aaThresh have been synchronized with TraceUI by
	//      RayTracer::traceSetup() function
	return 0;
}

bool RayTracer::checkRender()
{
	// YOUR CODE HERE
	// FIXME: Return true if tracing is done.
	//        This is a helper routine for GUI.
	//
	// TIPS: Introduce an array to track the status of each worker thread.
	//       This array is maintained by the worker threads.

	// return true if all threads are complete
	if (thread_done.size() >= num_threads)
		return true;
	// else return false by default
	return false;
}

void RayTracer::waitRender()
{
	// YOUR CODE HERE
	// FIXME: Wait until the rendering process is done.
	//        This function is essential if you are using an asynchronous
	//        traceImage implementation.
	//
	// TIPS: Join all worker threads here.

	for (int i = 0; i < num_threads; i++)
	{
		threads[i].join();
	}
}


glm::dvec3 RayTracer::getPixel(int i, int j)
{
	unsigned char *pixel = buffer.data() + ( i + j * buffer_width ) * 3;
	return glm::dvec3((double)pixel[0]/255.0, (double)pixel[1]/255.0, (double)pixel[2]/255.0);
}

void RayTracer::setPixel(int i, int j, glm::dvec3 color)
{
	unsigned char *pixel = buffer.data() + ( i + j * buffer_width ) * 3;

	pixel[0] = (int)( 255.0 * color[0]);
	pixel[1] = (int)( 255.0 * color[1]);
	pixel[2] = (int)( 255.0 * color[2]);
}

