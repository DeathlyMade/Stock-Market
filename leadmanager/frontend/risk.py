import quantstats as qs
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import warnings
import os

#calculate risk factor for given stock data
def calculate_risk(stock_data, stock_name, risk_factor):
    # Calculate daily returns
    stock_data['daily_return'] = stock_data['Close'].pct_change()
    
    # Calculate risk factor based on the specified type
    if risk_factor == 'volatility':
        risk_value = stock_data['daily_return'].std() * np.sqrt(252)  # Annualized volatility
    elif risk_factor == 'sharpe_ratio':
        risk_value = qs.stats.sharpe(stock_data['daily_return'], rf=0.01)  # Assuming a risk-free rate of 1%
    elif risk_factor == 'max_drawdown':
        risk_value = qs.stats.max_drawdown(stock_data['daily_return'])
    else:
        raise ValueError("Invalid risk factor type. Choose from 'volatility', 'sharpe_ratio', or 'max_drawdown'.")
    
    return {stock_name: risk_value}


if __name__ == "__main__":
    # Suppress warnings
    warnings.filterwarnings("ignore")

    # Read stock data from CSV file and parse the Date column as datetime
    stock_data = pd.read_csv('ADANIPORTS.csv', parse_dates=['Date'])

    # Set the Date column as the index
    stock_data.set_index('Date', inplace=True)

    # Calculate risk factors for each stock
    risk_factors = ['volatility', 'sharpe_ratio', 'max_drawdown']
    risk_data = {}

    for risk_factor in risk_factors:
        risk_data[risk_factor] = {}
        for stock_name in stock_data['Symbol'].unique():
            stock_data_filtered = stock_data[stock_data['Symbol'] == stock_name]
            risk_data[risk_factor].update(calculate_risk(stock_data_filtered, stock_name, risk_factor))

    # Create a DataFrame from the risk data
    risk_df = pd.DataFrame(risk_data)

    #for each row of risk_df, calculate weighted summation where I can specify the 3 weights of all the risk factors
    risk_df['risk_score'] = risk_df['volatility'] * 0.5 + risk_df['sharpe_ratio'] * 0.3 + risk_df['max_drawdown'] * 0.2


    # Plot the risk factors
    plt.figure(figsize=(12, 6))
    for risk_factor in risk_df.columns:
        plt.plot(risk_df.index, risk_df[risk_factor], label=risk_factor)

    plt.xlabel('Stock')
    plt.ylabel('Risk Factor Value')
    plt.title('Risk Factors for Stocks')
    plt.legend()
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.show()

    # Save the risk data to a CSV file
    risk_df.to_csv('risk_data.csv', index=False)