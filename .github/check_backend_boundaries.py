"""Small import-direction check; run from the repository root, alongside Ruff."""

import ast
from pathlib import Path

# Keep HTTP/application orchestration out of persistence and validation layers.
FORBIDDEN = {
    "models.py": {"serializers", "services", "views", "urls", "rest_framework", "django.http"},
    "serializers.py": {"services", "views", "urls", "django.http"},
    "services.py": {"serializers", "views", "urls", "rest_framework", "django.http"},
}
errors = []
for path in sorted(Path("backend").rglob("*.py")):
    if path.name not in FORBIDDEN or "migrations" in path.parts:
        continue
    for node in ast.walk(ast.parse(path.read_text(), filename=str(path))):
        if isinstance(node, ast.Import):
            imports = [alias.name for alias in node.names]
        elif isinstance(node, ast.ImportFrom):
            imports = [node.module or ""]
            imports.extend(f"{node.module or ''}.{alias.name}" for alias in node.names)
        else:
            continue
        for module in imports:
            segments = module.split(".")
            for forbidden in FORBIDDEN[path.name]:
                if (
                    forbidden in segments
                    or module == forbidden
                    or module.startswith(f"{forbidden}.")
                ):
                    errors.append(f"{path}:{node.lineno}: {path.name} must not import {module}")
if errors:
    raise SystemExit("\n".join(sorted(set(errors))))
print("Backend import boundaries passed.")
