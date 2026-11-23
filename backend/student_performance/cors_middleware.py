from django.http import HttpResponse


class CorsMiddleware:
    """
    Lightweight CORS middleware allowing cross-origin requests from frontend dev servers (Vite/React).
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.method == 'OPTIONS':
            response = HttpResponse()
            self._add_cors_headers(request, response)
            return response

        response = self.get_response(request)
        self._add_cors_headers(request, response)
        return response

    def _add_cors_headers(self, request, response):
        origin = request.headers.get('Origin', '*')
        response['Access-Control-Allow-Origin'] = origin if origin else '*'
        response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With, X-CSRFToken, Accept'
        response['Access-Control-Allow-Credentials'] = 'true'
