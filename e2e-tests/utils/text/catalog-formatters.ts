import {logger} from '../runtime/logger.ts';

export function formatCatalogDate(dateValue: string): string {
    logger.debug(`Formatting catalog date "${dateValue}"`);
    const isoDateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateValue.trim());
    if (!isoDateMatch) {
        logger.debug(
            `Date "${dateValue}" is not ISO format; returning original value`,
        );
        return dateValue;
    }

    const [, year, month, day] = isoDateMatch;
    const formatted = `${day}/${month}/${year}`;
    logger.info(`Formatted catalog date "${dateValue}" to "${formatted}"`);
    return formatted;
}

export function normalizeCurrencyValue(rawValue: string): string {
    logger.debug(`Normalizing currency value "${rawValue}"`);
    return rawValue.trim().replace(/^[^\d.-]+/, '');
}

export function formatCatalogPrice(priceValue: string): string {
    logger.debug(`Formatting catalog price "${priceValue}"`);
    const normalized = normalizeCurrencyValue(priceValue);
    if (!/^\d+(?:\.\d+)?$/.test(normalized)) {
        logger.debug(
            `Price "${priceValue}" is not numeric after normalization; returning original value`,
        );
        return priceValue;
    }

    const formatted = `\u00A3${Number(normalized).toFixed(2)}`;
    logger.info(`Formatted catalog price "${priceValue}" to "${formatted}"`);
    return formatted;
}

export function normalizeCatalogPriceForContains(priceValue: string): string {
    logger.debug(`Normalizing catalog price for contains check "${priceValue}"`);
    const normalized = normalizeCurrencyValue(priceValue);
    if (!/^\d+(?:\.\d+)?$/.test(normalized)) {
        logger.debug(
            `Price "${priceValue}" is not numeric after normalization; returning normalized value`,
        );
        return normalized;
    }

    const formatted = Number(normalized).toFixed(2);
    logger.info(
        `Normalized catalog contains price "${priceValue}" to "${formatted}"`,
    );
    return formatted;
}
