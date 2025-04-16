from django.db import models
from django.contrib.auth.models import User

class Stock(models.Model):

    ticker = models.CharField(max_length=10, unique=True)
    company_name = models.CharField(max_length=100)
    series = models.CharField(max_length=10)
    industry = models.CharField(max_length=100, blank=True, null=True)

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

    class Meta:
        unique_together = ('stock', 'date')  # Ensures one record per day for each stock
        ordering = ['-date']

    def __str__(self):
        return f"{self.stock.ticker} on {self.date}"

class Portfolio(models.Model):
    # 1 Portfolio belongs to 1 User
    # 1 User can have multiple Portfolios
    owner = models.ForeignKey(User, related_name="portfolios", on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    description = models.TextField()
    # Define ManyToMany with a through model that stores additional fields.
    stocks = models.ManyToManyField(Stock, through='PortfolioStock', related_name="portfolios", blank=True)

    def __str__(self):
        return self.name

class PortfolioStock(models.Model):
    portfolio = models.ForeignKey(Portfolio, on_delete=models.CASCADE)
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE)
    buy_price = models.DecimalField(max_digits=15, decimal_places=4, help_text="Buy-in price of the stock.")
    shares = models.DecimalField(max_digits=15, decimal_places=4, help_text="Number of shares purchased.")
    
    class Meta:
        unique_together = ('portfolio', 'stock')  # Prevent the same stock appearing more than once per portfolio

    def __str__(self):
        return f"{self.stock.ticker} in {self.portfolio.name}"
    
class Watchlist(models.Model):
    owner = models.OneToOneField(User, related_name="watchlist", on_delete=models.CASCADE)
    stocks = models.ManyToManyField(Stock, related_name="watchlists", blank=True)

    def __str__(self):
        return self.name