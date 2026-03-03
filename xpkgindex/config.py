import json
import os
from .models import SiteConfig


def load_config(directory: str) -> SiteConfig:
    """Load .xpkgindex.json from directory, returning SiteConfig with defaults."""
    config_path = os.path.join(directory, ".xpkgindex.json")
    if not os.path.exists(config_path):
        return SiteConfig()

    with open(config_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    config = SiteConfig()
    # Map nested JSON to flat SiteConfig
    site = data.get("site", {})
    config.title = site.get("title", config.title)
    config.description = site.get("description", config.description)
    config.logo = site.get("logo", config.logo)

    links = data.get("links", {})
    config.github = links.get("github", "")
    config.forum = links.get("forum", "")
    config.docs_url = links.get("docs", "")
    config.custom_links = links.get("custom", [])

    about = data.get("about", {})
    config.project_name = about.get("project_name", "")
    config.project_url = about.get("project_url", "")
    config.about_description = about.get("description", "")
    config.maintainers = about.get("maintainers", [])
    config.license = about.get("license", "")

    theme = data.get("theme", {})
    config.primary_color = theme.get("primary_color", config.primary_color)
    config.style = theme.get("style", config.style)

    config.install_command_template = data.get("install_command_template", config.install_command_template)
    config.pkgs_dir = data.get("pkgs_dir", config.pkgs_dir)

    return config
