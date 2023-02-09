#ifndef __RAYTRACER_H__
#define __RAYTRACER_H__

#define MAX_THREADS 32

// The main ray tracer.

#include <time.h>
#include <glm/vec3.hpp>
#include <queue>
#include <thread>
#include "scene/cubeMap.h"
#include "scene/ray.h"
#include <mutex>

class Scene;
class Pixel {
public:
	Pixel(int i, int j, unsigned char* ptr) : ix(i), jy(j), value(ptr) {}

	int ix;
	int jy;
	unsigned char* value;
};


class RayTracer {
public:
	RayTracer();
	~RayTracer();

	glm::dvec3 tracePixel(int i, int j);
	glm::dvec3 traceRay(ray& r, const glm::dvec3& thresh, int depth,
	                    double& length, double prev_refrac_index);

	glm::dvec3 getPixel(int i, int j);
	void setPixel(int i, int j, glm::dvec3 color);
	void getBuffer(unsigned char*& buf, int& w, int& h);
	double aspectRatio();

	void traceImage(int w, int h);
	int aaImage();
	bool checkRender();
	void waitRender();

	void traceSetup(int w, int h);

	bool loadScene(const char* fn);
	bool sceneLoaded() { return scene != 0; }

	void setReady(bool ready) { m_bBufferReady = ready; }
	bool isReady() const { return m_bBufferReady; }

	const Scene& getScene() { return *scene; }

	bool stopTrace;

	// function that each worker thread executes
	void thread_function(int thread_id, int start_row, int end_row, int row_len);

private:
	glm::dvec3 trace(double x, double y);

	std::vector<unsigned char> buffer;
	int buffer_width, buffer_height;
	int bufferSize;
	int block_size;
	double thresh;
	std::unique_ptr<Scene> scene;

	bool m_bBufferReady;

	// variables used for multi-threading
	unsigned int num_threads;
	std::vector<std::thread> threads;
	std::vector<int> thread_done;
	std::mutex mtx;

	// variables for AA
	bool computeAA;
	double aaThresh;
	int samples;
};

#endif // __RAYTRACER_H__
