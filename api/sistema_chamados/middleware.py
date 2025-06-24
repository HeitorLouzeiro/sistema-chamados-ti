import re
from django.conf import settings
from django.utils.deprecation import MiddlewareMixin


class DisableCSRFMiddleware(MiddlewareMixin):
    """
    Middleware para desabilitar CSRF em rotas específicas
    """
    
    def process_request(self, request):
        # Lista de padrões de URL que devem ser isentos de CSRF
        exempt_urls = getattr(settings, 'CSRF_EXEMPT_URLS', [])
        
        if request.path_info:
            for pattern in exempt_urls:
                if re.match(pattern, request.path_info):
                    setattr(request, '_dont_enforce_csrf_checks', True)
                    break
        
        return None
