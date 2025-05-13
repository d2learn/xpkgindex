import os
import json

class DataAbstractLayer:

    def __init__(self, parser_impl, datadir):
        self.parser_impl = parser_impl
        self.datadir = datadir
        self.datas = []

    def generate(self):
        """ get all files in the datadir (recursively) """
        all_files = []
        for root, dirs, files in os.walk(self.datadir):
            for file in files:
                abs_path = os.path.join(root, file)
                if self.is_package(abs_path):
                    all_files.append(abs_path)

        """parse packages and generate the data"""
        datas = []
        pkg_number = len(all_files)
        current_number = 0
        success_number = 0
        for file in all_files:
            print(f"[{current_number} / {pkg_number}]: Parsing 📦-{file}")
            data = self.parse(file)
            if data:
                datas.append(data)
                success_number += 1
            else:
                print(f"❌ Failed to parse {file}")
            current_number += 1
        
        self._datas_format(datas)

        print(f"✅ {success_number} packages parsed successfully, {pkg_number} packages found.")

    def save_to(self, filename):

        json_data = json.dumps(self.datas, indent=4, ensure_ascii=False)
        
        """save to file"""
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(json_data)

        print(f"✅ Data saved to {filename}")

    def _datas_format(self, datas):
        self.datas = []
        data_filter = {}
        for data in datas:
            print("format data: ", data)

            if not data.get('maintainers'):
                data['maintainers'] = 'unknown'

            if not data.get('licenses'):
                data['licenses'] = 'unknown'

            if not data.get('dependencies'):
                data['dependencies'] = { "xim": '0.0.2' }

            if not data.get('namespace'):
                data['namespace'] = ''
                data['install'] = data['name'] + '@' + data['version']
            else:
                data['install'] = data['namespace'] + ':' + data['name'] + '@' + data['version']
            
            if not data.get('homepage'):
                data['homepage'] = '../index.html'

            if not data.get('repo'):
                data['repo'] = '../index.html'

            if not data.get('categories'):
                data['categories'] = ['other']

            if not data.get('keywords'):
                data['keywords'] = ['unknown']

            if data_filter.get(data['name']):
                print(f"❌ Duplicate package name: {data['name']}")
                continue

            self.datas.append({
                'name': data['name'],
                'description': data['description'],
                'version': data['version'],
                'maintainers': data['maintainers'],
                'licenses': data['licenses'],
                'categories': data['categories'],
                'keywords': data['keywords'],
                'install': 'xlings install ' + data['install'],
                'dependencies' : data['dependencies'],
                'links': {
                    '🏠Homepage': data['homepage'],
                    '📦Repo': data['repo'],
                },
            })

            data_filter[data['name']] = data['description']

    def is_package(self, filename):
        """
        Checks if the implementation is a package.
        """
        return self.parser_impl.is_package(filename)

    def parse(self, filename):
        """
        Parses the file using the implementation provided.
        """
        return self.parser_impl.parse(filename)