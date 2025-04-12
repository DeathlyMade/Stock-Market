from rest_framework.routers import DefaultRouter
from .api import StockViewSet

router = DefaultRouter()
router.register('api/stocks', StockViewSet, basename='stock')

urlpatterns = router.urls