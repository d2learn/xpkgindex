import subprocess
import json

class XPackageParser:

    def is_package(self, path: str) -> bool:
        if not path.endswith('.lua'):
            return False
        
        """ exist `package =` string """
        with open(path, 'r') as file:
            for line in file:
                if 'package =' in line:
                    return True

        return False

    def parse(self, path: str) -> dict:

        """call xim pkgname --info-json"""
        filename = path.split('/')[-1]
        if filename.endswith('.lua'):
            filename = filename[:-4]

        pkgname = "local:" + filename

        try:
            # add the package to the xim
            result = subprocess.run(['xim', '--add-xpkg', path], capture_output=True, text=True)
            if result.returncode != 0:
                raise Exception(f"Error: {result.stderr}")
            # get the package info
            result = subprocess.run(['xim', pkgname, '--info-json', path], capture_output=True, text=True)
            if result.returncode != 0:
                raise Exception(f"Error: {result.stderr}")
            return json.loads(result.stdout)
        except Exception as e:
            print(f"Failed to parse package: {e}")
            return {}

