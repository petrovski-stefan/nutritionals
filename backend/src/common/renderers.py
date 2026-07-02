from rest_framework.renderers import JSONRenderer


class StandardizedJSONRenderer(JSONRenderer):
    def render(self, data, accepted_media_type=None, renderer_context=None) -> bytes:
        response_obj = (renderer_context or {}).get("response")

        status_code = response_obj.status_code if response_obj else 500

        if status_code == 204:  # Handle DELETE No Content
            return super().render(None, accepted_media_type, renderer_context)

        if status_code < 400:
            standardized_data = {"success": True, "data": data}
        else:
            standardized_data = {
                "success": False,
                **data,
            }

        return super().render(standardized_data, accepted_media_type, renderer_context)
