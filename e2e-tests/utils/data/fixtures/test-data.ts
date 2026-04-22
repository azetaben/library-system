import {createFrameworkTestData, type TestDataShape,} from './test-data-helpers.ts';
import {logger} from '../../runtime/logger.ts';

export const testData: TestDataShape = createFrameworkTestData();

export const resetTestData = () => {
    logger.debug('Resetting shared framework test data');
    Object.assign(testData, createFrameworkTestData());
};
