from rest_framework import serializers
from stocks.models import Stock, StockPrice

# Stock and StockPrice are read-only.
class StockSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stock
        fields = '__all__'
        read_only_fields = ('ticker', 'company_name', 'series')

class StockPriceSerializer(serializers.ModelSerializer):
    stock = StockSerializer(read_only=True)
    class Meta:
        model = StockPrice
        fields = '__all__'
        read_only_fields = fields
