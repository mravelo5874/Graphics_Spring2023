import os
import glob
from distutils.dir_util import copy_tree
import shutil

srcfiles = glob.glob('./src/neural/*.ts')
workers = glob.glob('./src/neural/workers/*.ts')
cmd = 'tsc --allowJs -m ES6 -t esnext --outDir dist --sourceMap --alwaysStrict --allowSyntheticDefaultImports true --esModuleInterop true ' + ' '.join(srcfiles) + ' ' +  ' '.join(workers) + ' ./src/lib/vue/vue.js '
print('Building TypeScript: ' + cmd)
os.system(cmd)
copy_tree('./src/neural/static', './dist')
