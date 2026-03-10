export const convertCurrency = (value, targetCurrency = 'INR') => {
    const rates = {
        'USD': 1,
        'EUR': 0.92,
        'INR': 83.5,
        'GBP': 0.79,
        'JPY': 150
    };
    if (value === undefined || value === null) return 0;
    return value * (rates[targetCurrency] || 83.5);
};

export const formatCurrency = (value, currencyCode = 'INR', compact = false) => {
    const locales = {
        'USD': 'en-US',
        'EUR': 'en-IE', // Using Ireland to get standard Euro formatting
        'INR': 'en-IN',
        'GBP': 'en-GB',
        'JPY': 'ja-JP'
    };
    
    // Fallback if value is somehow missing but normally value is 0
    if (value === undefined || value === null) return '';

    const convertedValue = convertCurrency(value, currencyCode);

    return new Intl.NumberFormat(locales[currencyCode] || 'en-IN', {
        style: 'currency',
        currency: currencyCode,
        maximumFractionDigits: compact ? 1 : 0,
        notation: compact ? 'compact' : 'standard'
    }).format(convertedValue);
};
