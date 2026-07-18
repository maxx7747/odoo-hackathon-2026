from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from rest_framework.authtoken.views import obtain_auth_token

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth-token/', obtain_auth_token, name='api-auth-token'),

    path('api/core/', include('core.urls')),
    path('api/environmental/', include('environmental.urls')),
    path('api/social/', include('social.urls')),
    path('api/governance/', include('governance.urls')),
    path('api/gamification/', include('gamification.urls')),
    path('api/scoring/', include('scoring.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/reports/', include('reports.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
