from dataclasses import dataclass, field
from typing import Dict, List, Optional


@dataclass
class PlatformInfo:
    versions: List[str] = field(default_factory=list)  # all version strings (excluding "latest")
    latest_version: str = ""  # resolved latest version
    deps: List[str] = field(default_factory=list)
    raw: Dict = field(default_factory=dict)  # original parsed platform data


@dataclass
class Package:
    name: str = ""
    description: str = ""
    homepage: str = ""
    repo: str = ""
    docs: str = ""
    licenses: List[str] = field(default_factory=list)
    type: str = "package"
    status: str = "dev"
    categories: List[str] = field(default_factory=list)
    keywords: List[str] = field(default_factory=list)
    authors: List[str] = field(default_factory=list)
    maintainers: List[str] = field(default_factory=list)
    contributors: str = ""
    programs: List[str] = field(default_factory=list)
    archs: List[str] = field(default_factory=list)
    xvm_enable: bool = False
    platforms: Dict[str, PlatformInfo] = field(default_factory=dict)  # "linux", "windows", "macosx"
    source_file: str = ""  # path to the .lua file
    namespace: str = ""  # optional namespace like "config"


@dataclass
class SiteConfig:
    title: str = "Package Index"
    description: str = "Package index for xlings package manager"
    logo: str = "Package Index"

    # Links
    github: str = ""
    forum: str = ""
    docs_url: str = ""
    custom_links: List[Dict[str, str]] = field(default_factory=list)

    # About
    project_name: str = ""
    project_url: str = ""
    about_description: str = ""
    maintainers: List[str] = field(default_factory=list)
    license: str = ""

    # Theme
    primary_color: str = "#00d4ff"
    style: str = "dark"

    # Build
    install_command_template: str = "xlings install {name}@{version}"
    pkgs_dir: str = "pkgs"

    # Install commands (for homepage install section)
    install_commands: Dict[str, str] = field(default_factory=dict)
