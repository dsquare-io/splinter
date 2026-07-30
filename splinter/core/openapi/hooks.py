import re

from splinter.utils.strings import underscore_to_camel

_PATH_VAR = re.compile(r"\{([^}]+)\}")


def camelize_path_parameters(result, generator, request, public):
    """Rename snake_case URL path variables to camelCase, matching the camelCased bodies.

    The path template (``{property_uid}``) and the path parameter ``name`` must stay in sync per
    the OpenAPI spec, so both are rewritten together. This runs at the document level because the
    generator -- not AutoSchema -- owns the ``paths`` keys.
    """
    paths = result.get("paths", {})
    camelized = {}
    for path, path_item in paths.items():
        mapping = {var: underscore_to_camel(var) for var in _PATH_VAR.findall(path) if var != underscore_to_camel(var)}
        if mapping:
            for operation in path_item.values():
                if not isinstance(operation, dict):
                    continue
                for param in operation.get("parameters", []):
                    if param.get("in") == "path" and param.get("name") in mapping:
                        param["name"] = mapping[param["name"]]

        new_path = _PATH_VAR.sub(lambda m: "{" + underscore_to_camel(m.group(1)) + "}", path)
        camelized[new_path] = path_item

    result["paths"] = camelized
    return result
