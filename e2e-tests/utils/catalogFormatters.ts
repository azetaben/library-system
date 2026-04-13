export function formatCatalogDate(dateValue: string): string {
    const isoDateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateValue.trim());
    if (!isoDateMatch) {
        return dateValue;
    }

    const [, year, month, day] = isoDateMatch;
    return `${day}/${month}/${year}`;
}

export function normalizeCurrencyValue(rawValue: string): string {
    return rawValue
        .trim()
        .replace(/^(?:ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£|ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£|Ãƒâ€šÃ‚Â£|Ã‚Â£|Â£|\$)/, '');
}

export function formatCatalogPrice(priceValue: string): string {
    const normalized = normalizeCurrencyValue(priceValue);
    if (!/^\d+(?:\.\d+)?$/.test(normalized)) {
        return priceValue;
    }

    return `£${Number(normalized).toFixed(2)}`;
}

export function normalizeCatalogPriceForContains(priceValue: string): string {
    const normalized = normalizeCurrencyValue(priceValue);
    if (!/^\d+(?:\.\d+)?$/.test(normalized)) {
        return normalized;
    }

    return Number(normalized).toFixed(2);
}
