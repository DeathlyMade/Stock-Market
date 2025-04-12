from django.db import models
from django.contrib.auth.models import User

class Stock(models.Model):

    ticker = models.CharField(max_length=10, unique=True)
    company_name = models.CharField(max_length=100)
    series = models.CharField(max_length=10)

    def __str__(self):
        return self.ticker

class StockPrice(models.Model):
    stock = models.ForeignKey(Stock, related_name='prices', on_delete=models.CASCADE)
    date = models.DateField()
    prev_close_price = models.DecimalField(max_digits=15, decimal_places=4, blank=True, null=True)
    open_price = models.DecimalField(max_digits=15, decimal_places=4, blank=True, null=True)
    high_price = models.DecimalField(max_digits=15, decimal_places=4, blank=True, null=True)
    last_price = models.DecimalField(max_digits=15, decimal_places=4, blank=True, null=True)
    low_price = models.DecimalField(max_digits=15, decimal_places=4, blank=True, null=True)
    close_price = models.DecimalField(max_digits=15, decimal_places=4, blank=True, null=True)
    VWAP = models.DecimalField(max_digits=15, decimal_places=4, blank=True, null=True)  
    volume = models.BigIntegerField(blank=True, null=True)
    turnover = models.DecimalField(max_digits=15, decimal_places=4, blank=True, null=True)

    class Meta:
        unique_together = ('stock', 'date')  # Ensures one record per day for each stock
        ordering = ['-date']

    def __str__(self):
        return f"{self.stock.ticker} on {self.date}"

