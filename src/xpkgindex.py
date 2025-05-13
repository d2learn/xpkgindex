import os, sys
import json
import shutil
from jinja2 import Environment, FileSystemLoader

# 路径设置
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(BASE_DIR, '..')
TEMPLATE_DIR = os.path.join(ROOT, 'templates')
OUTPUT_DIR = os.path.join(ROOT, 'site')
PACKAGE_DIR = os.path.join(OUTPUT_DIR, 'packages')
DATA_FILE = os.path.join(ROOT, 'data.json')

from data_abstract_layer import DataAbstractLayer
from parsers.xim_package_parser import XPackageParser

# 获得输入参数 pkgindex-dir path
if len(sys.argv) > 1:
    pkgindex_dir = sys.argv[1]
else:
    pkgindex_dir = os.path.join(ROOT, ".." , 'xim-pkgindex/pkgs')

dal = DataAbstractLayer(XPackageParser(), pkgindex_dir)
dal.generate()
dal.save_to(DATA_FILE)

# 加载数据
with open(DATA_FILE, 'r', encoding='utf-8') as f:
    packages = json.load(f)

# 创建 Jinja2 环境
env = Environment(loader=FileSystemLoader(TEMPLATE_DIR))

# 渲染模板
index_template = env.get_template('index.html')
package_template = env.get_template('package.html')

# 清空输出目录
if os.path.exists(OUTPUT_DIR):
    shutil.rmtree(OUTPUT_DIR)
os.makedirs(PACKAGE_DIR)

# 渲染首页
with open(os.path.join(OUTPUT_DIR, 'index.html'), 'w', encoding='utf-8') as f:
    f.write(index_template.render(packages=packages))

# 渲染每个包详情页
for pkg in packages:
    out_path = os.path.join(PACKAGE_DIR, f"{pkg['name']}.html")
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(package_template.render(pkg=pkg, packages=packages))

# 拷贝静态资源
for file in ['style.css', 'search.js', 'language.js']:
    shutil.copy(os.path.join(TEMPLATE_DIR, file), os.path.join(OUTPUT_DIR, file))

print("✅ 静态网站已生成到 site/")