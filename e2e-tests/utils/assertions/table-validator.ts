import {DataTable} from '@cucumber/cucumber';
import {logger} from '../runtime/logger.ts';

/**
 * Validates and extracts typed data from Cucumber DataTable.
 * Prevents silent failures from missing or malformed table columns.
 *
 * Usage:
 * ```typescript
 * interface LoginCreds {
 *   username: string;
 *   password: string;
 * }
 *
 * const creds = TableValidator.extractRow<LoginCreds>(
 *   dataTable,
 *   ['username', 'password'],
 *   'Login credentials'
 * );
 * ```
 */
export class TableValidator {
  /**
   * Extract and validate a single row from DataTable with required column enforcement.
   *
   * @param dataTable Cucumber DataTable from step parameter
   * @param requiredColumns List of required column names (keys must exist in row)
   * @param context Description for error messages (e.g., "Login credentials", "Book data")
   * @returns Typed row with guaranteed required fields
   * @throws Error if table is empty, required columns missing, or data validation fails
   */
  static extractRow<T extends Record<string, string>>(
    dataTable: DataTable,
    requiredColumns: (keyof T)[],
    context: string = 'DataTable',
  ): T {
    logger.info(`[TableValidator] Extracting row from ${context}`);

    const rows = dataTable.hashes();

    if (rows.length === 0) {
      const error = `[TableValidator] ${context}: No data rows in table`;
      logger.error(error);
      throw new Error(error);
    }

    const row = rows[0];

    // Validate required columns exist
    const missing = requiredColumns.filter(col => !(col in row));
    if (missing.length > 0) {
      const error =
        `[TableValidator] ${context}: Missing required columns: ${missing.join(', ')}\n` +
        `Available columns: ${Object.keys(row).join(', ')}`;
      logger.error(error);
      throw new Error(error);
    }

    // Validate required columns are not empty
    const empty = requiredColumns.filter(
      col => {
        const value = row[col as string];
        return !value || (value.trim?.() ?? '').length === 0;
      },
    );
    if (empty.length > 0) {
      const error =
        `[TableValidator] ${context}: Required columns cannot be empty: ${empty.join(', ')}`;
      logger.error(error);
      throw new Error(error);
    }

    logger.debug(`[TableValidator] ${context}: Extracted row with ${Object.keys(row).length} columns`);
    return row as T;
  }

  /**
   * Extract all rows from DataTable with required column validation.
   *
   * @param dataTable Cucumber DataTable from step parameter
   * @param requiredColumns List of required column names
   * @param context Description for error messages
   * @returns Array of typed rows, each guaranteed to have required fields
   * @throws Error if any row is missing required columns
   */
  static extractRows<T extends Record<string, string>>(
    dataTable: DataTable,
    requiredColumns: (keyof T)[],
    context: string = 'DataTable',
  ): T[] {
    logger.info(`[TableValidator] Extracting rows from ${context}`);

    const rows = dataTable.hashes();

    if (rows.length === 0) {
      const error = `[TableValidator] ${context}: No data rows in table`;
      logger.error(error);
      throw new Error(error);
    }

    const results: T[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      // Validate required columns exist
      const missing = requiredColumns.filter(col => !(col in row));
      if (missing.length > 0) {
        const error =
          `[TableValidator] ${context} row ${i}: Missing required columns: ${missing.join(', ')}\n` +
          `Available columns: ${Object.keys(row).join(', ')}`;
        logger.error(error);
        throw new Error(error);
      }

      // Validate required columns are not empty
      const empty = requiredColumns.filter(
        col => {
          const value = row[col as string];
          return !value || (value.trim?.() ?? '').length === 0;
        },
      );
      if (empty.length > 0) {
        const error =
          `[TableValidator] ${context} row ${i}: Required columns cannot be empty: ${empty.join(', ')}`;
        logger.error(error);
        throw new Error(error);
      }

      results.push(row as T);
    }

    logger.debug(`[TableValidator] ${context}: Extracted ${results.length} rows`);
    return results;
  }

  /**
   * Validate that DataTable has expected column structure.
   * Useful for early error detection before processing.
   *
   * @param dataTable Cucumber DataTable from step parameter
   * @param expectedColumns List of expected column names
   * @param context Description for error messages
   * @throws Error if columns don't match expected structure
   */
  static validateColumns(
    dataTable: DataTable,
    expectedColumns: string[],
    context: string = 'DataTable',
  ): void {
    logger.debug(`[TableValidator] Validating column structure for ${context}`);

    const rows = dataTable.hashes();
    if (rows.length === 0) {
      logger.debug(`[TableValidator] ${context}: Empty table, skipping column validation`);
      return;
    }

    const row = rows[0];
    const actualColumns = Object.keys(row);

    // Check all expected columns are present
    const missing = expectedColumns.filter(col => !actualColumns.includes(col));
    if (missing.length > 0) {
      const error =
        `[TableValidator] ${context}: Missing expected columns: ${missing.join(', ')}\n` +
        `Expected: ${expectedColumns.join(', ')}\n` +
        `Actual: ${actualColumns.join(', ')}`;
      logger.error(error);
      throw new Error(error);
    }

    // Check no extra unexpected columns
    const extra = actualColumns.filter(col => !expectedColumns.includes(col));
    if (extra.length > 0) {
      logger.warn(
        `[TableValidator] ${context}: Found unexpected columns: ${extra.join(', ')}. ` +
        `These will be ignored.`,
      );
    }

    logger.debug(`[TableValidator] ${context}: Column structure validated`);
  }

  /**
   * Coerce string value from DataTable to specific type.
   * Handles common conversions: 'true'/'false' → boolean, '123' → number, etc.
   *
   * @param value String value from DataTable
   * @param targetType Type to coerce to
   * @returns Coerced value
   * @throws Error if coercion fails
   */
  static coerce<T>(value: string, targetType: 'boolean' | 'number' | 'string'): T {
    if (targetType === 'boolean') {
      if (value.toLowerCase() === 'true') return true as T;
      if (value.toLowerCase() === 'false') return false as T;
      throw new Error(
        `[TableValidator] Cannot coerce "${value}" to boolean. Expected "true" or "false".`,
      );
    }

    if (targetType === 'number') {
      const num = Number(value);
      if (Number.isNaN(num)) {
        throw new Error(`[TableValidator] Cannot coerce "${value}" to number. Must be numeric.`);
      }
      return num as T;
    }

    return value as T;
  }
}

