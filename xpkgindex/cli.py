"""CLI entry point for xpkgindex."""

import argparse
import os

from .generator import generate


def main():
    parser = argparse.ArgumentParser(
        prog="xpkgindex",
        description="Generate static site for xpkg package index",
    )
    parser.add_argument("command", choices=["generate"], help="Command to run")
    parser.add_argument("directory", help="Path to package index directory")
    parser.add_argument("--output", "-o", default="site", help="Output directory (default: site)")
    parser.add_argument("--config", "-c", default=None, help="Path to .xpkgindex.json config file")

    args = parser.parse_args()

    directory = os.path.abspath(args.directory)
    output = os.path.abspath(args.output)

    if args.command == "generate":
        generate(directory, output, config_path=args.config)
