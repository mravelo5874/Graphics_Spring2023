import os
import glob
from distutils.dir_util import copy_tree
import shutil

srcfiles = glob.glob('./src/neural/*.ts')
pngFiles = glob.glob('./src/neural/*.png')
cmd = 'tsc --allowJs -m ES6 -t ES6 --outDir dist --sourceMap --alwaysStrict ' + " ".join(srcfiles) + " ".join(pngFiles) + ' ./src/lib/vue/vue.js '
print('Building TypeScript: ' + cmd)
os.system(cmd)
copy_tree('./src/neural/static', './dist')
