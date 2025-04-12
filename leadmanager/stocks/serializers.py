from rest_framework import serializers
from stocks.models import Stock, StockPrice

class StockPriceSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockPrice
        fields = '__all__'
        read_only_fields = list(fields)  # OR just list all fields manually, safer!

class StockSerializer(serializers.ModelSerializer):
    prices = StockPriceSerializer(many=True, read_only=True)  # uses related_name='prices'

    class Meta:
        model = Stock
        fields = '__all__'
        read_only_fields = ('ticker', 'company_name', 'series')
