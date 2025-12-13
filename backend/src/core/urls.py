from django.conf import settings
from django.contrib import admin
from django.urls import include, path

# Admin site config
admin.site.site_header = "NUTRITIONALS"
admin.site.site_title = "NUTRITIONALS"

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/products/", include("products.urls")),
    path("api/v1/users/", include("users.urls")),
    path("api/v1/mylists/", include("mylists.urls")),
]

if settings.DEBUG:
    from django.conf.urls.static import static
    from django.contrib.staticfiles.urls import staticfiles_urlpatterns

    urlpatterns += staticfiles_urlpatterns()
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

    urlpatterns += [
        path("silk/", include("silk.urls", namespace="silk")),
    ]
