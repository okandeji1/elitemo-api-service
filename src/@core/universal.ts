import { nanoid } from 'nanoid';
import { v2 as cloudinary } from 'cloudinary';
import { unlink } from 'fs';
import logger from '../util/logger/logger';
/**
 * Generate ID of specified lenght
 * @param options {object} - options
 */

export const generateId = (options) => {
  return options.suffix ? `${options.suffix}-${nanoid(options.length)}` : nanoid(options.length);
};

export const fileUpload = async (options: any): Promise<any> => {
  const tenantConnection = options.connection;
  const { models: tenantModels } = tenantConnection;

  try {
    const settings = await tenantModels.Setting.findOne({}).lean();

    const {
      hostname: cloud_name,
      username: api_key,
      password: api_secret,
    } = new URL(settings.cloudinaryUrl);

    cloudinary.config({
      cloud_name,
      api_key,
      api_secret,
    });

    const miscellaneous = {};
    for (const [key, images] of Object.entries(options.files)) {
      miscellaneous[key] = [];

      // @ts-ignore
      for (const image of images) {
        const result = await cloudinary.uploader.upload(image.path, {
          resource_type: 'auto',
          folder: `${tenantConnection.name}/${options.folder}`,
        });

        miscellaneous[key].push(result.secure_url);
        unlink(image.path, () => {
          return true;
        });
      }
      // Update user
    }
    return { status: true, data: miscellaneous };
  } catch (error: any) {
    logger.log('info', `request failed. Error: ${error.message}`);
    return {
      status: false,
      message: 'Internal server error!',
      code: 500,
    };
  }
};
