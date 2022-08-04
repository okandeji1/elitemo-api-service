import { nanoid } from 'nanoid';

/**
 * Generate ID of specified lenght
 * @param options {object} - options
 */

export const generateId = (options) => {
  return options.suffix ? `${options.suffix}-${nanoid(options.length)}` : nanoid(options.length);
};
