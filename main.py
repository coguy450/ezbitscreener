from coinbase.wallet.client import Client

client = Client('e2Sy9s5yx6GnsUqT', <api_secret>, api_version='YYYY-MM-DD')

currency_code = 'USD'  # can also use EUR, CAD, etc.

# Make the request
price = client.get_spot_price(currency=currency_code)

print 'Current bitcoin price in %s: %s' % (currency_code, price.amount)
