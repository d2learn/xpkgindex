"""xpkg Lua package parser using lupa (embedded Lua runtime).

Executes .lua package files in a sandboxed Lua environment and extracts
the `package` table directly — no custom tokenizer or parser needed.
"""

import glob
import os
from typing import List, Optional

from lupa import LuaRuntime

from .models import Package, PlatformInfo


# Lua sandbox: mock all xim-specific APIs so package files execute cleanly
_LUA_SANDBOX = """
function import(...) end
function cprint(...) end

path = path or {}
path.join = function(...) return '' end

os.host = function() return 'linux' end
os.iorun = function(...) return true end
os.exec = function(...) return true end
os.tryrm = function(...) end
os.mv = function(...) end
os.cp = function(...) end
os.cd = function(...) end
os.isfile = function(...) return false end

io.readfile = function(...) return '' end
io.writefile = function(...) end
"""


def _make_lua() -> LuaRuntime:
    """Create a fresh sandboxed Lua runtime."""
    lua = LuaRuntime(unpack_returned_tuples=True)
    lua.execute(_LUA_SANDBOX)
    return lua


def _lua_table_to_python(obj) -> object:
    """Recursively convert a Lua table to Python dict/list."""
    if not hasattr(obj, "keys"):
        return obj

    keys = list(obj.keys())
    if not keys:
        return {}

    # Array-like table: consecutive integer keys starting at 1
    if all(isinstance(k, (int, float)) for k in keys):
        int_keys = sorted(int(k) for k in keys)
        if int_keys == list(range(1, len(int_keys) + 1)):
            return [_lua_table_to_python(obj[k]) for k in sorted(keys)]

    # Dict-like table
    result = {}
    for k in keys:
        py_key = str(k) if not isinstance(k, str) else k
        result[py_key] = _lua_table_to_python(obj[k])
    return result


def _extract_platform_info(platform_data: dict) -> PlatformInfo:
    """Build PlatformInfo from a parsed platform dict."""
    info = PlatformInfo(raw=dict(platform_data))

    # deps
    deps = platform_data.get("deps")
    if isinstance(deps, list):
        info.deps = [str(d) for d in deps]
    elif isinstance(deps, dict):
        info.deps = [str(v) for v in deps.values()]

    # versions and latest
    for key, value in platform_data.items():
        if key == "deps":
            continue
        if key == "latest":
            if isinstance(value, dict) and "ref" in value:
                info.latest_version = str(value["ref"])
            continue
        info.versions.append(str(key))

    if not info.latest_version and info.versions:
        info.latest_version = info.versions[0]

    return info


def _build_package(data: dict, filepath: str) -> Package:
    """Populate a Package dataclass from a Python dict."""
    pkg = Package(source_file=filepath)

    for attr in ("name", "description", "homepage", "repo", "docs",
                 "type", "status", "contributors", "namespace"):
        val = data.get(attr)
        if val is not None:
            setattr(pkg, attr, str(val))

    for attr in ("licenses", "categories", "keywords", "authors",
                 "maintainers", "programs", "archs"):
        val = data.get(attr)
        if isinstance(val, list):
            setattr(pkg, attr, [str(v) for v in val])
        elif isinstance(val, str):
            setattr(pkg, attr, [val])

    if "xvm_enable" in data:
        pkg.xvm_enable = bool(data["xvm_enable"])

    xpm = data.get("xpm")
    if isinstance(xpm, dict):
        for platform_name in ("linux", "windows", "macosx"):
            pdata = xpm.get(platform_name)
            if isinstance(pdata, dict):
                pkg.platforms[platform_name] = _extract_platform_info(pdata)

    return pkg


def parse_lua_file(filepath: str) -> Optional[Package]:
    """Parse a .lua package file. Returns Package, or None for ref/alias/failures."""
    if not filepath.endswith(".lua"):
        return None

    try:
        with open(filepath, "r", encoding="utf-8", errors="replace") as f:
            code = f.read()

        if "package" not in code:
            return None

        lua = _make_lua()
        lua.execute(code)
        pkg_table = lua.globals().package

        if pkg_table is None:
            return None

        # Skip ref/alias packages
        for k in pkg_table.keys():
            if k == "ref":
                return None

        data = _lua_table_to_python(pkg_table)
        if not isinstance(data, dict):
            return None

        return _build_package(data, filepath)

    except Exception as e:
        print(f"Warning: Failed to parse {filepath}: {e}")
        return None


def parse_packages_dir(pkgs_dir: str) -> List[Package]:
    """Recursively parse all .lua files in pkgs_dir."""
    packages = []
    for filepath in sorted(glob.glob(os.path.join(pkgs_dir, "**/*.lua"), recursive=True)):
        pkg = parse_lua_file(filepath)
        if pkg is not None:
            packages.append(pkg)
    return packages
