from rest_framework.renderers import JSONRenderer


class StandardizedJSONRenderer(JSONRenderer):
    def render(self, data, accepted_media_type=None, renderer_context=None) -> bytes:
        status_code = renderer_context.get("response").status_code
        # print(renderer_context["view"].get_view_name())
        response = {
            "status": 200 <= status_code < 300,
            "code": status_code,
        }

        if data and "errors" in data:
            response["errors_type"] = data["type"]
            response["errors"] = data["errors"]
            response["data"] = None
        else:
            response["data"] = data

        return super(StandardizedJSONRenderer, self).render(
            response, accepted_media_type, renderer_context
        )
